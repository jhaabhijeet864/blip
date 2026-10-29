import { HandLandmarkIndex, HandLandmarks, NormalizedLandmark, VisionDetectionResult } from "./types";

export class BrowserVisionDetector {
  public static calculateDistance2D(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static calculateDistance3D(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  public static calculateThumbMiddleDistance(hand: HandLandmarks): number {
    if (!hand || hand.length < 21) {
      return 1.0;
    }
    const thumbTip = hand[HandLandmarkIndex.THUMB_TIP];
    const middleTip = hand[HandLandmarkIndex.MIDDLE_FINGER_TIP];
    return this.calculateDistance2D(thumbTip, middleTip);
  }

  public static createSilhouetteAlphaMask(
    currentFrame: ImageData,
    backgroundPlate: ImageData | null,
    threshold = 30
  ): Uint8ClampedArray {
    const totalPixels = currentFrame.width * currentFrame.height;
    const alphaMask = new Uint8ClampedArray(totalPixels);

    if (!backgroundPlate || backgroundPlate.data.length !== currentFrame.data.length) {
      // Default fallback: center ellipse silhouette
      const cx = currentFrame.width / 2;
      const cy = currentFrame.height / 2;
      const rx = currentFrame.width * 0.3;
      const ry = currentFrame.height * 0.45;

      for (let y = 0; y < currentFrame.height; y++) {
        for (let x = 0; x < currentFrame.width; x++) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          const distSq = dx * dx + dy * dy;
          const idx = y * currentFrame.width + x;
          alphaMask[idx] = distSq <= 1.0 ? 255 : 0;
        }
      }
      return alphaMask;
    }

    const cur = currentFrame.data;
    const bg = backgroundPlate.data;

    for (let i = 0, p = 0; i < cur.length; i += 4, p++) {
      const dr = Math.abs(cur[i] - bg[i]);
      const dg = Math.abs(cur[i + 1] - bg[i + 1]);
      const db = Math.abs(cur[i + 2] - bg[i + 2]);
      const diff = (dr + dg + db) / 3;

      alphaMask[p] = diff > threshold ? 255 : 0;
    }

    return alphaMask;
  }
}

