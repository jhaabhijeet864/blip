export class GokuSpeedlinesRenderer {
  private lineCount = 48;
  private angles: Float32Array;
  private lengths: Float32Array;

  constructor(lineCount = 48) {
    this.lineCount = lineCount;
    this.angles = new Float32Array(lineCount);
    this.lengths = new Float32Array(lineCount);

    for (let i = 0; i < lineCount; i++) {
      this.angles[i] = (i * (Math.PI * 2)) / lineCount + (Math.random() - 0.5) * 0.1;
      this.lengths[i] = 0.6 + Math.random() * 0.4;
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number, // 0.0 to 1.0
    centerX?: number,
    centerY?: number
  ): void {
    if (progress <= 0 || progress >= 1.0) {
      return;
    }

    const cx = centerX ?? width / 2;
    const cy = centerY ?? height * 0.45;
    const maxRadius = Math.hypot(width, height);

    ctx.save();

    // 1. Initial white shockwave flash (peaks at progress ~0.15)
    const flashAlpha = Math.max(0, 1.0 - progress * 2.2);
    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.85})`;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Expanding shockwave ring
    const ringRadius = progress * maxRadius * 0.7;
    const ringAlpha = Math.max(0, (1.0 - progress) * 0.9);
    ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
    ctx.lineWidth = 4 * (1.0 - progress);
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Radial anime speedlines
    const lineAlpha = Math.max(0, (1.0 - progress) * 0.95);
    ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
    ctx.lineWidth = 2.5;

    const innerRadius = 40 + progress * 160;

    for (let i = 0; i < this.lineCount; i++) {
      const angle = this.angles[i];
      const outerRadius = innerRadius + (maxRadius - innerRadius) * this.lengths[i];

      const x1 = cx + Math.cos(angle) * innerRadius;
      const y1 = cy + Math.sin(angle) * innerRadius;
      const x2 = cx + Math.cos(angle) * outerRadius;
      const y2 = cy + Math.sin(angle) * outerRadius;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

