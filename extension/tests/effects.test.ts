import { describe, it, expect } from "vitest";
import { CanvasParticlePool } from "../src/effects/particles";

describe("CanvasParticlePool", () => {
  it("spawns particles matching silhouette mask and samples video frame colors", () => {
    const pool = new CanvasParticlePool(100);
    const width = 20;
    const height = 20;
    const mask = new Uint8ClampedArray(width * height);
    const frame = {
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4),
    } as unknown as ImageData;

    // Set pixel (10, 10) as foreground in red
    const idx = 10 * width + 10;
    mask[idx] = 255;
    frame.data[idx * 4] = 220; // R
    frame.data[idx * 4 + 1] = 40; // G
    frame.data[idx * 4 + 2] = 50; // B

    const spawned = pool.spawnFromSilhouette(mask, frame, 10);
    expect(spawned).toBeGreaterThan(0);
    expect(pool.getActiveCount()).toBe(spawned);
    expect(pool.isAlive()).toBe(true);
    expect(pool.x[0]).toBe(10);
    expect(pool.y[0]).toBe(10);
    expect(pool.r[0]).toBe(220);
  });

  it("updates particles with upward buoyancy and curl velocity", () => {
    const pool = new CanvasParticlePool(10);
    pool.x[0] = 100;
    pool.y[0] = 200;
    pool.vx[0] = 0;
    pool.vy[0] = -50;
    pool.life[0] = 1.0;
    pool.maxLife[0] = 1.0;
    (pool as unknown as { activeCount: number }).activeCount = 1;

    pool.update(0.1, 0); // 100ms dt

    expect(pool.y[0]).toBeLessThan(200); // Moved upward!
    expect(pool.life[0]).toBeCloseTo(0.9, 2);
    expect(pool.alpha[0]).toBeCloseTo(0.9, 2);
  });

  it("removes dead particles when lifetime expires", () => {
    const pool = new CanvasParticlePool(5);
    pool.x[0] = 50;
    pool.y[0] = 50;
    pool.life[0] = 0.05;
    pool.maxLife[0] = 1.0;
    (pool as unknown as { activeCount: number }).activeCount = 1;

    pool.update(0.1, 0); // 100ms exceeds 50ms life
    expect(pool.getActiveCount()).toBe(0);
    expect(pool.isAlive()).toBe(false);
  });
});

