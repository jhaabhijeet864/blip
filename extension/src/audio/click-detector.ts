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
  private dataBuffer: Uint8Array<ArrayBuffer> | null = null;
  private isRunning = false;
  private animationFrameId: number | null = null;

  private previousRms = 0;
  private clickThreshold = 0.65; // 0.0 to 1.0 normalized sensitivity
  private lastClickTime = 0;
  private cooldownMs = 250; // Rapid acoustic click detector debounce (high-level triggers apply extra debounce)

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

      // In Chromium, audio contexts created without prior user gesture often start suspended.
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
        // Also ensure on first user interaction we resume immediately
        const resumeAudio = () => {
          if (this.audioContext && this.audioContext.state === "suspended") {
            this.audioContext.resume().catch(() => {});
          }
          window.removeEventListener("click", resumeAudio);
          window.removeEventListener("keydown", resumeAudio);
        };
        window.addEventListener("click", resumeAudio, { once: true });
        window.addEventListener("keydown", resumeAudio, { once: true });
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.05; // Ultra-fast transient attack response

      // High-pass filter to isolate finger snap high-frequency transient (1800Hz+)
      const highPassFilter = this.audioContext.createBiquadFilter();
      highPassFilter.type = "highpass";
      highPassFilter.frequency.value = 1800;

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

      // Check if context suspended and resume
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
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
    // Snap signature discrimination:
    // Speech energy concentrates in voice fundamentals (<1.2 kHz) and vowel formants.
    // Finger snaps produce an explosive impulsive burst heavily centered in 2.5 kHz - 7 kHz
    // with virtually negligible low-frequency energy compared to high-frequency energy.
    
    const lowBinStart = 1;
    const lowBinEnd = Math.floor(freqData.length * 0.10); // Voice band: ~100Hz - 1.2kHz
    
    const snapBinStart = Math.floor(freqData.length * 0.20); // Snap band: ~2.5kHz
    const snapBinEnd = Math.floor(freqData.length * 0.70);   // Snap band: ~7.5kHz
    
    let lowEnergy = 0;
    for (let i = lowBinStart; i < lowBinEnd; i++) {
      const v = freqData[i] / 255;
      lowEnergy += v * v;
    }
    const lowRms = Math.sqrt(lowEnergy / Math.max(1, lowBinEnd - lowBinStart));

    let snapEnergy = 0;
    let snapPeak = 0;
    for (let i = snapBinStart; i < snapBinEnd; i++) {
      const val = freqData[i] / 255;
      snapEnergy += val * val;
      if (val > snapPeak) {
        snapPeak = val;
      }
    }
    const snapRms = Math.sqrt(snapEnergy / Math.max(1, snapBinEnd - snapBinStart));
    const delta = snapRms - this.previousRms;
    this.previousRms = snapRms * 0.4 + this.previousRms * 0.6; // Moving baseline

    // Reject human speech: in speech, low voice energy dominates or equals high frequencies.
    // In a finger snap, high-frequency snap energy is significantly higher than low speech fundamentals,
    // or low energy is near silent background.
    const isSpeech = lowRms > 0.18 && lowRms >= snapRms * 1.2;
    if (isSpeech) {
      return false;
    }

    // Dynamic sensitivity trigger for sharp transient rise attack
    // Require substantial impulse rise and strong peak
    const sensitivityTrigger = Math.max(0.08, (1.0 - this.clickThreshold) * 0.35 + 0.08);
    const isTransientClick = 
      delta > sensitivityTrigger && 
      snapPeak > 0.32 && 
      (now - this.lastClickTime > this.cooldownMs || this.lastClickTime === 0);

    if (isTransientClick) {
      this.lastClickTime = now;
      if (this.onClickCallback) {
        this.onClickCallback({
          timestamp: now,
          intensity: snapPeak,
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
