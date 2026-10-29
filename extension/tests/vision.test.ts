import { describe, it, expect } from "vitest";
import { BrowserVisionDetector } from "../src/vision/vision-detector";
import { HandLandmarkIndex, HandLandmarks } from "../src/vision/types";

function createMockHand(): HandLandmarks {
  const landmarks: HandLandmarks = [];
  for (let i = 0; i < 21; i++) {
    landmarks.push({ x: 0.5, y: 0.5, z: 0.0 });
  }
  return landmarks;
}

describe("BrowserVisionDetector", () => {
  it("calculates accurate 2D and 3D Euclidean distances", () => {
    const p1 = { x: 0.0, y: 0.0, z: 0.0 };
    const p2 = { x: 0.3, y: 0.4, z: 0.0 };
    const dist2D = BrowserVisionDetector.calculateDistance2D(p1, p2);
    expect(dist2D).toBeCloseTo(0.5, 4);

    const p3 = { x: 0.0, y: 0.0, z: 1.2 };
    const dist3D = BrowserVisionDetector.calculateDistance3D(p1, p3);
    expect(dist3D).toBeCloseTo(1.2, 4);
  });

  it("calculates thumb-middle pinch distance accurately", () => {
    const hand = createMockHand();
    hand[HandLandmarkIndex.THUMB_TIP] = { x: 0.45, y: 0.5, z: 0 };
    hand[HandLandmarkIndex.MIDDLE_FINGER_TIP] = { x: 0.48, y: 0.5, z: 0 };

    const dist = BrowserVisionDetector.calculateThumbMiddleDistance(hand);
    expect(dist).toBeCloseTo(0.03, 3);
  });

  it("identifies authentic Goku temple-touch pose", () => {
    const hand = createMockHand();
    // Index and middle fingertips close together near temple/forehead (y = 0.22)
    hand[HandLandmarkIndex.INDEX_FINGER_TIP] = { x: 0.72, y: 0.22, z: 0 };
    hand[HandLandmarkIndex.MIDDLE_FINGER_TIP] = { x: 0.74, y: 0.23, z: 0 };

    // Ring and pinky curled down
    hand[HandLandmarkIndex.RING_FINGER_PIP] = { x: 0.68, y: 0.35, z: 0 };
    hand[HandLandmarkIndex.RING_FINGER_TIP] = { x: 0.68, y: 0.42, z: 0 };
    hand[HandLandmarkIndex.PINKY_PIP] = { x: 0.66, y: 0.38, z: 0 };
    hand[HandLandmarkIndex.PINKY_TIP] = { x: 0.66, y: 0.45, z: 0 };

    // Wrist low
    hand[HandLandmarkIndex.WRIST] = { x: 0.7, y: 0.55, z: 0 };

    const isTemple = BrowserVisionDetector.isTempleTouchPose(hand);
    expect(isTemple).toBe(true);
  });

  it("rejects temple pose when fingers are held too low in the frame", () => {
    const hand = createMockHand();
    hand[HandLandmarkIndex.INDEX_FINGER_TIP] = { x: 0.5, y: 0.65, z: 0 }; // Too low!
    hand[HandLandmarkIndex.MIDDLE_FINGER_TIP] = { x: 0.52, y: 0.65, z: 0 };

    const isTemple = BrowserVisionDetector.isTempleTouchPose(hand);
    expect(isTemple).toBe(false);
  });

  it("creates accurate silhouette alpha mask with plate subtraction", () => {
    const w = 10;
    const h = 10;
    const current = {
      width: w,
      height: h,
      data: new Uint8ClampedArray(w * h * 4),
    } as unknown as ImageData;

    const bg = {
      width: w,
      height: h,
      data: new Uint8ClampedArray(w * h * 4),
    } as unknown as ImageData;

    // Fill background with black (0) and person pixel at index 0 with bright white (255)
    current.data[0] = 255;
    current.data[1] = 255;
    current.data[2] = 255;
    current.data[3] = 255;

    const mask = BrowserVisionDetector.createSilhouetteAlphaMask(current, bg, 30);
    expect(mask[0]).toBe(255); // Person pixel foreground
    expect(mask[1]).toBe(0); // Identical background pixel
  });
});

