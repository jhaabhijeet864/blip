export interface ClickDetectionEvent {
  timestamp: number;
  intensity: number;
  frequencyBand: number;
}

export type ClickCallback = (event: ClickDetectionEvent) => void;

export class AudioClickDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private dataBuffer: Uint8Array | null = null;
  private isRunning = false;
  private animationFrameId: number | null = null;

  private previousRms = 0;
  private clickThreshold = 0.65; // 0.0 to 1.0 normalized sensitivity
  private lastClickTime = 0;
  private cooldownMs = 250; // Minimum time between consecutive acoustic clicks

  private onClickCallback: ClickCallback | null = null;

  constructor(threshold = 0.65) {
    this.clickThreshold = threshold;
  }

  public setOnClickCallback(cb: ClickCallback): void {
    this.onClickCallback = cb;
  }

  public setThreshold(threshold: number): void {
    this.clickThreshold = Math.max(0.1, Math.min(1.0, threshold));
  }

  public start(stream: MediaStream): boolean {
    if (typeof window === "undefined" || this.isRunning) {
      return false;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      return false;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        return false;
      }

      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.1; // Fast transient response

      // High-pass filter to isolate finger snap high-frequency transient (2000Hz+)
      const highPassFilter = this.audioContext.createBiquadFilter();
      highPassFilter.type = "highpass";
      highPassFilter.frequency.value = 2200;

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.sourceNode.connect(highPassFilter);
      highPassFilter.connect(this.analyser);

      this.dataBuffer = new Uint8Array(this.analyser.frequencyBinCount);
      this.isRunning = true;

      this.startAnalysisLoop();
      return true;
    } catch {
      return false;
    }
  }

  private startAnalysisLoop(): void {
    const analyze = () => {
      if (!this.isRunning || !this.analyser || !this.dataBuffer) {
        return;
      }

      this.analyser.getByteFrequencyData(this.dataBuffer);
      this.evaluateFrequencySpike(this.dataBuffer, performance.now());

      if (typeof requestAnimationFrame !== "undefined") {
        this.animationFrameId = requestAnimationFrame(analyze);
      } else {
        this.animationFrameId = setTimeout(analyze, 16) as unknown as number;
      }
    };

    if (typeof requestAnimationFrame !== "undefined") {
      this.animationFrameId = requestAnimationFrame(analyze);
    } else {
      this.animationFrameId = setTimeout(analyze, 16) as unknown as number;
    }
  }

  public evaluateFrequencySpike(freqData: Uint8Array, now: number): boolean {
    // Calculate RMS energy in snap band (approx bins 25 to 80 for 512 FFT at 48kHz)
    let sum = 0;
    let peak = 0;
    const startBin = Math.floor(freqData.length * 0.15); // ~2 kHz
    const endBin = Math.floor(freqData.length * 0.65); // ~8 kHz
    const binCount = endBin - startBin;

    for (let i = startBin; i < endBin; i++) {
      const val = freqData[i] / 255;
      sum += val * val;
      if (val > peak) {
        peak = val;
      }
    }

    const rms = Math.sqrt(sum / binCount);
    const delta = rms - this.previousRms;
    this.previousRms = rms * 0.7 + this.previousRms * 0.3; // Low-pass moving baseline

    // Sharp rise attack + peak threshold + cooldown
    const sensitivityTrigger = (1.0 - this.clickThreshold) * 0.4 + 0.1;
    const isTransientClick = delta > sensitivityTrigger && peak > 0.35 && now - this.lastClickTime > this.cooldownMs;

    if (isTransientClick) {
      this.lastClickTime = now;
      if (this.onClickCallback) {
        this.onClickCallback({
          timestamp: now,
          intensity: peak,
          frequencyBand: 4000,
        });
      }
      return true;
    }

    return false;
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      if (typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(this.animationFrameId);
      } else {
        clearTimeout(this.animationFrameId);
      }
      this.animationFrameId = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}
