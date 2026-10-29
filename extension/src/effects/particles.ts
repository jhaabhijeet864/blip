export class CanvasParticlePool {
  private capacity: number;
  private activeCount = 0;

  public x: Float32Array;
  public y: Float32Array;
  public vx: Float32Array;
  public vy: Float32Array;
  public size: Float32Array;
  public alpha: Float32Array;
  public life: Float32Array;
  public maxLife: Float32Array;
  public r: Uint8Array;
  public g: Uint8Array;
  public b: Uint8Array;

  constructor(capacity = 3000) {
    this.capacity = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.size = new Float32Array(capacity);
    this.alpha = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.maxLife = new Float32Array(capacity);
    this.r = new Uint8Array(capacity);
    this.g = new Uint8Array(capacity);
    this.b = new Uint8Array(capacity);
  }

  public spawnFromSilhouette(
    mask: Uint8ClampedArray,
    frame: ImageData,
    targetCount = 2000
  ): number {
    const width = frame.width;
    const height = frame.height;
    const totalPixels = width * height;

    // Collect candidate foreground pixels
    const foregroundIndices: number[] = [];
    const step = Math.max(1, Math.floor(totalPixels / (targetCount * 4)));

    for (let i = 0; i < totalPixels; i += step) {
      if (mask[i] > 128) {
        foregroundIndices.push(i);
      }
    }

    if (foregroundIndices.length === 0) {
      // Fallback: spawn around center
      for (let y = height * 0.25; y < height * 0.75; y += 10) {
        for (let x = width * 0.25; x < width * 0.75; x += 10) {
          foregroundIndices.push(Math.floor(y * width + x));
        }
      }
    }

    const countToSpawn = Math.min(this.capacity, Math.min(targetCount, foregroundIndices.length));
    this.activeCount = countToSpawn;

    const imgData = frame.data;

    for (let i = 0; i < countToSpawn; i++) {
      const randIdx = foregroundIndices[Math.floor(Math.random() * foregroundIndices.length)];
      const px = randIdx % width;
      const py = Math.floor(randIdx / width);

      this.x[i] = px;
      this.y[i] = py;

      // Thanos upward curl drift
      this.vx[i] = (Math.random() - 0.5) * 35;
      this.vy[i] = -40 - Math.random() * 80; // Upward drift
      this.size[i] = 1.5 + Math.random() * 3.5;
      this.alpha[i] = 0.85 + Math.random() * 0.15;
      this.maxLife[i] = 1.0 + Math.random() * 1.5; // seconds
      this.life[i] = this.maxLife[i];

      // Sample color from video frame
      const byteIdx = randIdx * 4;
      this.r[i] = imgData[byteIdx] || 150;
      this.g[i] = imgData[byteIdx + 1] || 140;
      this.b[i] = imgData[byteIdx + 2] || 130;
    }

    return this.activeCount;
  }

  public update(dt: number, timeSec = 0): void {
    let alive = 0;

    for (let i = 0; i < this.activeCount; i++) {
      if (this.life[i] <= 0) {
        continue;
      }

      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        continue;
      }

      // Curl noise curl math
      const curlX = Math.sin(this.y[i] * 0.02 + timeSec * 3) * 20;
      const curlY = Math.cos(this.x[i] * 0.02 + timeSec * 3) * 10;

      this.x[i] += (this.vx[i] + curlX) * dt;
      this.y[i] += (this.vy[i] + curlY) * dt;

      // Fade alpha with life
      const lifeRatio = this.life[i] / this.maxLife[i];
      this.alpha[i] = Math.max(0, lifeRatio);

      // Compact active particles to front
      if (alive !== i) {
        this.x[alive] = this.x[i];
        this.y[alive] = this.y[i];
        this.vx[alive] = this.vx[i];
        this.vy[alive] = this.vy[i];
        this.size[alive] = this.size[i];
        this.alpha[alive] = this.alpha[i];
        this.life[alive] = this.life[i];
        this.maxLife[alive] = this.maxLife[i];
        this.r[alive] = this.r[i];
        this.g[alive] = this.g[i];
        this.b[alive] = this.b[i];
      }
      alive++;
    }

    this.activeCount = alive;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.activeCount === 0) {
      return;
    }

    ctx.save();
    for (let i = 0; i < this.activeCount; i++) {
      const a = this.alpha[i];
      if (a <= 0.01) {
        continue;
      }

      ctx.fillStyle = `rgba(${this.r[i]}, ${this.g[i]}, ${this.b[i]}, ${a})`;
      ctx.beginPath();
      ctx.arc(this.x[i], this.y[i], this.size[i], 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public getActiveCount(): number {
    return this.activeCount;
  }

  public isAlive(): boolean {
    return this.activeCount > 0;
  }

  public reset(): void {
    this.activeCount = 0;
  }
}
