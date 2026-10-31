import {
  BlipConfig,
  BlipMessage,
  BlipState,
  DEFAULT_BLIP_CONFIG,
  GestureEffectType,
} from "./types";
import { AudioClickDetector } from "./audio/click-detector";
import { DualTriggerSnapKinematics } from "./gestures/snap-kinematics";
import { CanvasParticlePool } from "./effects/particles";
import { BackgroundPlateManager } from "./effects/plate-manager";
import { MeetingMuteManager } from "./effects/mute-manager";

export interface StreamInterceptorOptions {
  onFrame?: (video: HTMLVideoElement, ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  onStateChange?: (state: BlipState) => void;
}

export class BlipStreamInterceptor {
  private config: BlipConfig = { ...DEFAULT_BLIP_CONFIG };
  private state: BlipState = {
    isIntercepted: false,
    isVanished: false,
    currentEffect: "none",
    hasBackgroundPlate: false,
    fps: 0,
    lastGestureTime: 0,
  };

  private kinematics: DualTriggerSnapKinematics;
  private audioDetector: AudioClickDetector;
  private particlePool: CanvasParticlePool;
  private plateManager: BackgroundPlateManager;
  private muteManager: MeetingMuteManager;

  private originalGetUserMedia: typeof navigator.mediaDevices.getUserMedia | null = null;
  private hiddenVideo: HTMLVideoElement | null = null;
  private processingCanvas: HTMLCanvasElement | null = null;
  private processingCtx: CanvasRenderingContext2D | null = null;
  private backgroundPlateCanvas: HTMLCanvasElement | null = null;
  private backgroundPlateCtx: CanvasRenderingContext2D | null = null;

  private realStream: MediaStream | null = null;
  private syntheticStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private isDestroyed = false;

  private frameCount = 0;
  private lastFpsCalcTime = typeof performance !== "undefined" ? performance.now() : 0;
  private effectProgress = 0; // 0.0 to 1.0

  private safeRequestAnimationFrame(cb: FrameRequestCallback): number {
    if (typeof requestAnimationFrame !== "undefined") {
      return requestAnimationFrame(cb);
    }
    return setTimeout(cb, 16) as unknown as number;
  }

  private safeCancelAnimationFrame(id: number): void {
    if (typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  }

  constructor(options?: StreamInterceptorOptions) {
    this.kinematics = new DualTriggerSnapKinematics(0.06, 1500);
    this.audioDetector = new AudioClickDetector(this.config.audioClickThreshold);
    this.particlePool = new CanvasParticlePool(3000);
    this.plateManager = new BackgroundPlateManager();
    this.muteManager = new MeetingMuteManager();

    this.audioDetector.setOnClickCallback((event) => {
      this.kinematics.registerAudioClick(event.timestamp);
    });

    this.kinematics.setOnGestureTriggered((event) => {
      if (this.state.isVanished) {
        this.triggerReappear();
      } else {
        this.triggerVanish(event.type);
      }
    });

    if (typeof window !== "undefined") {
      this.initMessageListener();
    }
  }

  public install(): boolean {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return false;
    }

    if (this.originalGetUserMedia !== null) {
      return true; // Already installed
    }

    this.originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    const self = this;

    navigator.mediaDevices.getUserMedia = async function (
      constraints: MediaStreamConstraints
    ): Promise<MediaStream> {
      return self.interceptGetUserMedia(constraints);
    };

    if (typeof window !== "undefined") {
      (window as unknown as { __BLIP_INTERCEPTOR_READY__: boolean }).__BLIP_INTERCEPTOR_READY__ = true;
    }
    return true;
  }

  public async interceptGetUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    if (!this.originalGetUserMedia) {
      throw new Error("BlipStreamInterceptor not installed");
    }

    const realStream = await this.originalGetUserMedia.call(navigator.mediaDevices, constraints);

    // If video is not requested or Blip is disabled, pass through original stream
    const hasVideo = Boolean(constraints && constraints.video);
    if (!hasVideo || !this.config.enabled) {
      return realStream;
    }

    // Clean up previous active pipeline if re-requesting stream (e.g. Google Meet camera toggle)
    this.cleanupActivePipeline();

    this.realStream = realStream;
    this.setupProcessingPipeline(realStream);

    if (!this.syntheticStream) {
      return realStream;
    }

    this.state.isIntercepted = true;
    this.broadcastState();
    return this.syntheticStream;
  }

  private cleanupActivePipeline(): void {
    if (this.animationFrameId !== null) {
      this.safeCancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.hiddenVideo) {
      try {
        this.hiddenVideo.pause();
        this.hiddenVideo.srcObject = null;
        if (this.hiddenVideo.parentNode) {
          this.hiddenVideo.parentNode.removeChild(this.hiddenVideo);
        }
      } catch {
        // Safe cleanup
      }
      this.hiddenVideo = null;
    }
    this.audioDetector.stop();
  }

  private setupProcessingPipeline(realStream: MediaStream): void {
    const realVideoTrack = realStream.getVideoTracks()[0];
    if (!realVideoTrack) {
      return;
    }

    // 1. Create active off-screen video element attached to DOM
    // Uses tiny dimensions and minimal opacity to guarantee active compositor decoding in Chromium
    this.hiddenVideo = document.createElement("video");
    this.hiddenVideo.id = "blip-internal-camera-feed";
    this.hiddenVideo.autoplay = true;
    this.hiddenVideo.muted = true;
    this.hiddenVideo.playsInline = true;
    if (typeof this.hiddenVideo.setAttribute === "function") {
      this.hiddenVideo.setAttribute("playsinline", "");
      this.hiddenVideo.setAttribute("webkit-playsinline", "");
    }

    this.hiddenVideo.style.position = "fixed";
    this.hiddenVideo.style.top = "0px";
    this.hiddenVideo.style.left = "0px";
    this.hiddenVideo.style.width = "4px";
    this.hiddenVideo.style.height = "4px";
    this.hiddenVideo.style.opacity = "0.001";
    this.hiddenVideo.style.pointerEvents = "none";
    this.hiddenVideo.style.zIndex = "-99999";
    this.hiddenVideo.srcObject = realStream;

    if (typeof document !== "undefined" && (document.body || document.documentElement)) {
      (document.body || document.documentElement).appendChild(this.hiddenVideo);
    }

    // 2. Create offscreen canvas for rendering effects
    const settings = typeof realVideoTrack.getSettings === "function" ? realVideoTrack.getSettings() : {};
    const initialWidth = settings.width || 1280;
    const initialHeight = settings.height || 720;

    this.processingCanvas = document.createElement("canvas");
    this.processingCanvas.width = initialWidth;
    this.processingCanvas.height = initialHeight;
    this.processingCtx = this.processingCanvas.getContext("2d", { willReadFrequently: true });

    // 3. Create canvas for empty room background plate
    this.backgroundPlateCanvas = document.createElement("canvas");
    this.backgroundPlateCanvas.width = initialWidth;
    this.backgroundPlateCanvas.height = initialHeight;
    this.backgroundPlateCtx = this.backgroundPlateCanvas.getContext("2d");

    // 4. Capture 30 FPS synthetic stream from offscreen canvas
    this.syntheticStream = this.processingCanvas.captureStream(30);

    // 5. Wrap synthetic video track to delegate to real track (critical for Google Meet compatibility!)
    const syntheticVideoTrack = this.syntheticStream.getVideoTracks()[0];
    if (syntheticVideoTrack && realVideoTrack) {
      const originalGetSettings = syntheticVideoTrack.getSettings?.bind(syntheticVideoTrack);
      syntheticVideoTrack.getSettings = () => {
        const synth = originalGetSettings ? originalGetSettings() : {};
        const real = realVideoTrack.getSettings ? realVideoTrack.getSettings() : {};
        return {
          ...real,
          ...synth,
          deviceId: real.deviceId || "blip-virtual-camera",
          groupId: real.groupId,
          facingMode: real.facingMode,
          aspectRatio: real.aspectRatio || (synth.width && synth.height ? synth.width / synth.height : 1.777),
        };
      };

      if (typeof realVideoTrack.getCapabilities === "function") {
        syntheticVideoTrack.getCapabilities = () => realVideoTrack.getCapabilities();
      }
      if (typeof realVideoTrack.getConstraints === "function") {
        syntheticVideoTrack.getConstraints = () => realVideoTrack.getConstraints();
      }
      syntheticVideoTrack.applyConstraints = async (constraints) => {
        return realVideoTrack.applyConstraints(constraints);
      };

      // When Google Meet turns off camera, stop real track and cleanup
      const originalStop = syntheticVideoTrack.stop.bind(syntheticVideoTrack);
      syntheticVideoTrack.stop = () => {
        originalStop();
        realVideoTrack.stop();
        this.cleanupActivePipeline();
      };
    }

    // 6. Transfer real audio tracks into synthetic stream
    for (const audioTrack of realStream.getAudioTracks()) {
      this.syntheticStream.addTrack(audioTrack);
    }

    if (realStream.getAudioTracks().length > 0) {
      this.audioDetector.start(realStream);
    }

    const updateDimensions = () => {
      if (this.hiddenVideo && this.processingCanvas && this.backgroundPlateCanvas) {
        const w = this.hiddenVideo.videoWidth || initialWidth;
        const h = this.hiddenVideo.videoHeight || initialHeight;
        if (w > 0 && h > 0) {
          this.processingCanvas.width = w;
          this.processingCanvas.height = h;
          this.backgroundPlateCanvas.width = w;
          this.backgroundPlateCanvas.height = h;
        }
      }
    };

    if (typeof this.hiddenVideo.addEventListener === "function") {
      this.hiddenVideo.addEventListener("loadedmetadata", updateDimensions);
      this.hiddenVideo.addEventListener("canplay", updateDimensions);
    }
    updateDimensions();

    this.hiddenVideo.play().catch(() => {
      // Autoplay handled by browser permission grant
    });

    // 7. Begin rendering loop
    this.startRenderLoop();
  }

  private startRenderLoop(): void {
    if (this.animationFrameId !== null) {
      this.safeCancelAnimationFrame(this.animationFrameId);
    }

    const render = () => {
      if (this.isDestroyed) {
        return;
      }

      this.renderFrame();
      this.updateFpsCounter();
      this.animationFrameId = this.safeRequestAnimationFrame(render);
    };

    this.animationFrameId = this.safeRequestAnimationFrame(render);
  }

  public renderFrame(): void {
    if (!this.processingCtx || !this.processingCanvas || !this.hiddenVideo) {
      return;
    }

    // Ensure hidden video is ready to produce valid frames
    if (this.hiddenVideo.readyState < 2 || this.hiddenVideo.videoWidth === 0) {
      return;
    }

    const w = this.processingCanvas.width;
    const h = this.processingCanvas.height;

    // Handle dynamic camera resolution adjustments
    if (this.hiddenVideo.videoWidth > 0 && this.hiddenVideo.videoWidth !== w) {
      this.processingCanvas.width = this.hiddenVideo.videoWidth;
      this.processingCanvas.height = this.hiddenVideo.videoHeight;
      if (this.backgroundPlateCanvas) {
        this.backgroundPlateCanvas.width = this.hiddenVideo.videoWidth;
        this.backgroundPlateCanvas.height = this.hiddenVideo.videoHeight;
      }
    }

    // Case 1: Normal Live View
    if (!this.state.isVanished && this.state.currentEffect === "none") {
      this.processingCtx.drawImage(this.hiddenVideo, 0, 0, w, h);
      return;
    }

    // Case 2: Transition effect active (Thanos Snap Vanish or Goku Flash)
    if (this.state.currentEffect !== "none") {
      this.renderEffectFrame(w, h);
      return;
    }

    // Case 3: Fully Vanished (Empty Room Clean Plate)
    if (this.state.isVanished) {
      if (this.state.hasBackgroundPlate && this.backgroundPlateCanvas) {
        this.processingCtx.drawImage(this.backgroundPlateCanvas, 0, 0, w, h);
      } else {
        // Fallback plate: clean dark meeting ambience if plate not yet captured
        this.processingCtx.fillStyle = "#090d16";
        this.processingCtx.fillRect(0, 0, w, h);
        this.processingCtx.fillStyle = "#64748b";
        this.processingCtx.font = "14px monospace";
        this.processingCtx.textAlign = "center";
        this.processingCtx.fillText("Empty Room Plate (Vanished)", w / 2, h / 2);
      }
    }
  }

  private renderEffectFrame(w: number, h: number): void {
    if (!this.processingCtx || !this.hiddenVideo) {
      return;
    }

    const dt = 1 / 30;
    const now = performance.now();

    // 1. THANOS DUST SNAP DISSOLVE EFFECT
    if (this.state.currentEffect === "snap") {
      this.effectProgress += dt / (this.config.dustDurationMs / 1000);
      const progress = this.effectProgress;

      // Draw background plate underneath
      if (this.state.hasBackgroundPlate && this.backgroundPlateCanvas) {
        this.processingCtx.drawImage(this.backgroundPlateCanvas, 0, 0, w, h);
      } else {
        this.processingCtx.fillStyle = "#090d16";
        this.processingCtx.fillRect(0, 0, w, h);
      }

      // Fade out live person silhouette simulation
      this.processingCtx.save();
      const alpha = Math.max(0, 1.0 - progress);
      this.processingCtx.globalAlpha = alpha;
      this.processingCtx.drawImage(this.hiddenVideo, 0, 0, w, h);
      this.processingCtx.restore();

      // Render drifting ash particles with curl noise
      this.particlePool.update(dt, now / 1000);
      this.particlePool.render(this.processingCtx);

      if (progress >= 1.0) {
        this.state.currentEffect = "none";
        this.state.isVanished = true;
        this.effectProgress = 0;
        this.broadcastState();
      }
      return;
    }

    // 2. GOKU INSTANT TRANSMISSION ANIME FLASH EFFECT
    if (this.state.currentEffect === "goku") {
      this.effectProgress += dt / 0.85; // fast 850ms anime teleport
      const progress = this.effectProgress;

      // Draw background plate underneath
      if (this.state.hasBackgroundPlate && this.backgroundPlateCanvas) {
        this.processingCtx.drawImage(this.backgroundPlateCanvas, 0, 0, w, h);
      } else {
        this.processingCtx.fillStyle = "#090d16";
        this.processingCtx.fillRect(0, 0, w, h);
      }

      // Fast vanish subject
      this.processingCtx.save();
      this.processingCtx.globalAlpha = Math.max(0, 1.0 - progress * 2);
      this.processingCtx.drawImage(this.hiddenVideo, 0, 0, w, h);
      this.processingCtx.restore();

      // Anime radial speed lines
      const cx = w / 2;
      const cy = h * 0.45;
      const lineCount = 36;

      this.processingCtx.save();
      this.processingCtx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 1.0 - progress * 1.5)})`;
      this.processingCtx.lineWidth = 2.5;

      for (let i = 0; i < lineCount; i++) {
        const angle = (i * (Math.PI * 2)) / lineCount;
        const rInner = 60 + progress * 140;
        const rOuter = Math.max(w, h);
        this.processingCtx.beginPath();
        this.processingCtx.moveTo(cx + Math.cos(angle) * rInner, cy + Math.sin(angle) * rInner);
        this.processingCtx.lineTo(cx + Math.cos(angle) * rOuter, cy + Math.sin(angle) * rOuter);
        this.processingCtx.stroke();
      }
      this.processingCtx.restore();

      // Electric cyan / blinding white flash shockwave around peak
      if (progress >= 0.35 && progress <= 0.75) {
        const flashIntensity = 1.0 - Math.abs(progress - 0.55) / 0.2;
        this.processingCtx.save();
        this.processingCtx.fillStyle = `rgba(220, 255, 255, ${flashIntensity * 0.75})`;
        this.processingCtx.fillRect(0, 0, w, h);

        const shockRadius = (progress - 0.35) * (w * 0.7);
        this.processingCtx.strokeStyle = `rgba(255, 255, 255, ${flashIntensity})`;
        this.processingCtx.lineWidth = 6;
        this.processingCtx.beginPath();
        this.processingCtx.arc(cx, cy, shockRadius, 0, Math.PI * 2);
        this.processingCtx.stroke();
        this.processingCtx.restore();
      }

      if (progress >= 1.0) {
        this.state.currentEffect = "none";
        this.state.isVanished = true;
        this.effectProgress = 0;
        this.broadcastState();
      }
    }
  }

  public triggerVanish(effect: GestureEffectType): void {
    if (this.state.isVanished || this.state.currentEffect !== "none") {
      return;
    }

    this.state.currentEffect = effect;
    this.effectProgress = 0;

    if (effect === "snap" && this.processingCtx && this.processingCanvas) {
      const w = this.processingCanvas.width;
      const h = this.processingCanvas.height;
      try {
        const frameData = this.processingCtx.getImageData(0, 0, w, h);
        const dummyMask = new Uint8ClampedArray(w * h);
        const cx = w / 2;
        const cy = h * 0.55;
        const rx = w * 0.28;
        const ry = h * 0.42;
        for (let y = 0; y < h; y += 4) {
          for (let x = 0; x < w; x += 4) {
            const dx = (x - cx) / rx;
            const dy = (y - cy) / ry;
            if (dx * dx + dy * dy <= 1.0) {
              dummyMask[y * w + x] = 255;
            }
          }
        }
        this.particlePool.spawnFromSilhouette(dummyMask, frameData, 2000);
      } catch {
        // Fallback center spawning
        const dummyMask = new Uint8ClampedArray(w * h);
        this.particlePool.spawnFromSilhouette(dummyMask, { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) } as ImageData, 1500);
      }
    }

    if (this.config.autoMute) {
      this.setMicrophoneMuted(true);
    }

    this.broadcastState();
  }

  public triggerReappear(): void {
    this.state.isVanished = false;
    this.state.currentEffect = "none";
    this.effectProgress = 0;
    this.particlePool.reset();

    if (this.config.autoMute) {
      this.setMicrophoneMuted(false);
    }

    this.broadcastState();
  }

  public captureBackgroundPlate(sourceVideo?: HTMLVideoElement): boolean {
    const video = sourceVideo || this.hiddenVideo;
    if (!video || !this.backgroundPlateCtx || !this.backgroundPlateCanvas) {
      return false;
    }

    // Match exact native video resolution identically to LivePlayground.tsx
    const w = video.videoWidth > 0 ? video.videoWidth : (this.processingCanvas?.width || 1280);
    const h = video.videoHeight > 0 ? video.videoHeight : (this.processingCanvas?.height || 720);
    this.backgroundPlateCanvas.width = w;
    this.backgroundPlateCanvas.height = h;

    try {
      this.backgroundPlateCtx.drawImage(video, 0, 0, w, h);
      this.state.hasBackgroundPlate = true;
      this.broadcastState();
      return true;
    } catch {
      return false;
    }
  }

  public loadBackgroundPlate(dataUrl: string): void {
    if (!this.backgroundPlateCtx || !this.backgroundPlateCanvas) {
      return;
    }
    const img = new Image();
    img.onload = () => {
      if (this.backgroundPlateCanvas && this.backgroundPlateCtx) {
        this.backgroundPlateCanvas.width = img.width || 1280;
        this.backgroundPlateCanvas.height = img.height || 720;
        this.backgroundPlateCtx.drawImage(img, 0, 0);
        this.state.hasBackgroundPlate = true;
        this.broadcastState();
      }
    };
    img.src = dataUrl;
  }

  public getBackgroundPlateDataUrl(): string | null {
    if (!this.state.hasBackgroundPlate || !this.backgroundPlateCanvas) {
      return null;
    }
    try {
      return this.backgroundPlateCanvas.toDataURL("image/jpeg", 0.85);
    } catch {
      return null;
    }
  }

  public setMicrophoneMuted(muted: boolean): void {
    if (this.realStream) {
      for (const track of this.realStream.getAudioTracks()) {
        track.enabled = !muted;
      }
    }

    if (typeof window !== "undefined") {
      window.postMessage(
        {
          source: "blip-extension-injected",
          action: "BLIP_AUTO_MUTE",
          payload: muted,
          timestamp: Date.now(),
        } as BlipMessage,
        "*"
      );
    }
  }

  public updateConfig(newConfig: Partial<BlipConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getState(): BlipState {
    return { ...this.state };
  }

  private updateFpsCounter(): void {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsCalcTime;
    if (elapsed >= 1000) {
      this.state.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsCalcTime = now;
    }
  }

  private broadcastState(): void {
    if (typeof window !== "undefined") {
      const statePayload: BlipState & { backgroundPlateDataUrl?: string } = {
        ...this.getState(),
      };
      if (this.state.hasBackgroundPlate) {
        statePayload.backgroundPlateDataUrl = this.getBackgroundPlateDataUrl() || undefined;
      }

      window.postMessage(
        {
          source: "blip-extension-injected",
          action: "BLIP_STATUS_RESPONSE",
          payload: statePayload,
          timestamp: Date.now(),
        } as BlipMessage,
        "*"
      );
    }
  }

  private initMessageListener(): void {
    window.addEventListener("message", (event) => {
      if (event.source !== window || !event.data || typeof event.data !== "object") {
        return;
      }

      const message = event.data as BlipMessage;
      if (message.source === "blip-extension-injected") {
        return;
      }

      switch (message.action) {
        case "BLIP_UPDATE_CONFIG":
          if (message.payload) {
            this.updateConfig(message.payload as Partial<BlipConfig>);
          }
          break;
        case "BLIP_TRIGGER_SNAP":
          this.triggerVanish("snap");
          break;
        case "BLIP_TRIGGER_GOKU":
          this.triggerVanish("goku");
          break;
        case "BLIP_TRIGGER_REAPPEAR":
          this.triggerReappear();
          break;
        case "BLIP_CALIBRATE":
          this.captureBackgroundPlate();
          break;
        case "BLIP_LOAD_PLATE":
          if (message.payload && typeof (message.payload as { dataUrl?: string }).dataUrl === "string") {
            this.loadBackgroundPlate((message.payload as { dataUrl: string }).dataUrl);
          }
          break;
        case "BLIP_STATUS_REQUEST":
          this.broadcastState();
          break;
      }
    });
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.cleanupActivePipeline();
    if (this.realStream) {
      for (const track of this.realStream.getTracks()) {
        track.stop();
      }
      this.realStream = null;
    }
    if (this.originalGetUserMedia && typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = this.originalGetUserMedia;
      this.originalGetUserMedia = null;
    }
  }
}
