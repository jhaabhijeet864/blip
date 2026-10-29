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

  public static calculateDualFingertipDistance(hand: HandLandmarks): number {
    if (!hand || hand.length < 21) {
      return 1.0;
    }
    const indexTip = hand[HandLandmarkIndex.INDEX_FINGER_TIP];
    const middleTip = hand[HandLandmarkIndex.MIDDLE_FINGER_TIP];
    return this.calculateDistance2D(indexTip, middleTip);
  }

  public static isTempleTouchPose(hand: HandLandmarks): boolean {
    if (!hand || hand.length < 21) {
      return false;
    }

    const indexTip = hand[HandLandmarkIndex.INDEX_FINGER_TIP];
    const middleTip = hand[HandLandmarkIndex.MIDDLE_FINGER_TIP];
    const ringTip = hand[HandLandmarkIndex.RING_FINGER_TIP];
    const pinkyTip = hand[HandLandmarkIndex.PINKY_TIP];
    const ringPip = hand[HandLandmarkIndex.RING_FINGER_PIP];
    const pinkyPip = hand[HandLandmarkIndex.PINKY_PIP];
    const wrist = hand[HandLandmarkIndex.WRIST];

    // 1. Index and middle tips close together
    const dualTipDist = this.calculateDistance2D(indexTip, middleTip);
    if (dualTipDist > 0.08) {
      return false;
    }

    // 2. Fingertips raised high in head/temple zone (upper 45% of camera frame)
    if (indexTip.y > 0.45 || middleTip.y > 0.45) {
      return false;
    }

    // 3. Wrist is distinctly lower than fingertips
    if (wrist.y < indexTip.y + 0.12) {
      return false;
    }

    // 4. Ring and pinky fingers are curled downward
    const ringCurled = ringTip.y >= ringPip.y - 0.04;
    const pinkyCurled = pinkyTip.y >= pinkyPip.y - 0.04;
    return ringCurled && pinkyCurled;
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

