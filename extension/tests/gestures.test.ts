import { describe, it, expect, vi } from "vitest";
import { DualTriggerSnapKinematics } from "../src/gestures/snap-kinematics";
import { AudioClickDetector } from "../src/audio/click-detector";
import { HandLandmarkIndex, HandLandmarks } from "../src/vision/types";

function createHandWithPinch(dist: number): HandLandmarks {
  const hand: HandLandmarks = [];
  for (let i = 0; i < 21; i++) {
    hand.push({ x: 0.5, y: 0.5, z: 0.0 });
  }
  // Thumb and middle separated by dist
  hand[HandLandmarkIndex.THUMB_TIP] = { x: 0.5, y: 0.5, z: 0 };
  hand[HandLandmarkIndex.MIDDLE_FINGER_TIP] = { x: 0.5 + dist, y: 0.5, z: 0 };
  return hand;
}

function createGokuTempleHand(): HandLandmarks {
  const hand: HandLandmarks = [];
  for (let i = 0; i < 21; i++) {
    hand.push({ x: 0.5, y: 0.5, z: 0.0 });
  }
  hand[HandLandmarkIndex.INDEX_FINGER_TIP] = { x: 0.72, y: 0.22, z: 0 };
  hand[HandLandmarkIndex.MIDDLE_FINGER_TIP] = { x: 0.74, y: 0.23, z: 0 };
  hand[HandLandmarkIndex.RING_FINGER_PIP] = { x: 0.68, y: 0.35, z: 0 };
  hand[HandLandmarkIndex.RING_FINGER_TIP] = { x: 0.68, y: 0.42, z: 0 };
  hand[HandLandmarkIndex.PINKY_PIP] = { x: 0.66, y: 0.38, z: 0 };
  hand[HandLandmarkIndex.PINKY_TIP] = { x: 0.66, y: 0.45, z: 0 };
  hand[HandLandmarkIndex.WRIST] = { x: 0.7, y: 0.55, z: 0 };
  return hand;
}

describe("DualTriggerSnapKinematics", () => {
  it("does NOT trigger snap on visual pinch release without audio click", () => {
    const kinematics = new DualTriggerSnapKinematics(0.06, 1500);
    const triggerSpy = vi.fn();
    kinematics.setOnGestureTriggered(triggerSpy);

    // Frame 1: Pinch armed
    kinematics.processHandFrame(createHandWithPinch(0.03), 1000);
    expect(kinematics.getIsArmed()).toBe(true);

    // Frame 2: Release (no audio click registered)
    kinematics.processHandFrame(createHandWithPinch(0.18), 1050);
    expect(kinematics.getIsArmed()).toBe(false);

    expect(triggerSpy).not.toHaveBeenCalled();
  });

  it("does NOT trigger snap on audio click without prior visual pinch", () => {
    const kinematics = new DualTriggerSnapKinematics(0.06, 1500);
    const triggerSpy = vi.fn();
    kinematics.setOnGestureTriggered(triggerSpy);

    // Clapping sound or talking
    kinematics.registerAudioClick(1000);
    kinematics.processHandFrame(createHandWithPinch(0.3), 1000);

    expect(triggerSpy).not.toHaveBeenCalled();
  });

  it("TRIGGERS snap when visual release and acoustic click align within 200ms", () => {
    const kinematics = new DualTriggerSnapKinematics(0.06, 1500);
    const triggerSpy = vi.fn();
    kinematics.setOnGestureTriggered(triggerSpy);

    // Step 1: Arm pinch
    kinematics.processHandFrame(createHandWithPinch(0.03), 1000);
    expect(kinematics.getIsArmed()).toBe(true);

    // Step 2: Release at t = 1060ms
    kinematics.processHandFrame(createHandWithPinch(0.18), 1060);

    // Step 3: Audio click registered at t = 1080ms (20ms delta)
    kinematics.registerAudioClick(1080);

    expect(triggerSpy).toHaveBeenCalledTimes(1);
    expect(triggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "snap",
        confidence: 1.0,
      })
    );
  });

  it("rejects snap when audio click arrives too late (>200ms delta)", () => {
    const kinematics = new DualTriggerSnapKinematics(0.06, 1500);
    const triggerSpy = vi.fn();
    kinematics.setOnGestureTriggered(triggerSpy);

    // Step 1: Arm pinch
    kinematics.processHandFrame(createHandWithPinch(0.03), 1000);

    // Step 2: Release at t = 1050ms
    kinematics.processHandFrame(createHandWithPinch(0.18), 1050);

    // Step 3: Late click at t = 1400ms (350ms delta)
    kinematics.registerAudioClick(1400);

    expect(triggerSpy).not.toHaveBeenCalled();
  });

  it("triggers Goku Instant Transmission upon 3-frame temple hold", () => {
    const kinematics = new DualTriggerSnapKinematics(0.06, 1500);
    const triggerSpy = vi.fn();
    kinematics.setOnGestureTriggered(triggerSpy);

    const gokuHand = createGokuTempleHand();

    kinematics.processHandFrame(gokuHand, 1000); // Frame 1
    expect(triggerSpy).not.toHaveBeenCalled();

    kinematics.processHandFrame(gokuHand, 1033); // Frame 2
    expect(triggerSpy).not.toHaveBeenCalled();

    kinematics.processHandFrame(gokuHand, 1066); // Frame 3 (Streak fulfilled!)
    expect(triggerSpy).toHaveBeenCalledTimes(1);
    expect(triggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "goku",
      })
    );
  });

  it("debounces subsequent triggers during 1.5s cooldown", () => {
    const kinematics = new DualTriggerSnapKinematics(0.06, 1500);
    const triggerSpy = vi.fn();
    kinematics.setOnGestureTriggered(triggerSpy);

    const gokuHand = createGokuTempleHand();

    // Trigger first gesture at t = 1000ms
    kinematics.processHandFrame(gokuHand, 1000);
    kinematics.processHandFrame(gokuHand, 1033);
    kinematics.processHandFrame(gokuHand, 1066);
    expect(triggerSpy).toHaveBeenCalledTimes(1);

    // Immediate next frames at t = 1100ms (inside cooldown)
    kinematics.processHandFrame(gokuHand, 1100);
    kinematics.processHandFrame(gokuHand, 1133);
    kinematics.processHandFrame(gokuHand, 1166);
    expect(triggerSpy).toHaveBeenCalledTimes(1); // Blocked by debounce!
  });
});

describe("AudioClickDetector", () => {
  it("detects sharp transient frequency spike in snap acoustic band", () => {
    const detector = new AudioClickDetector(0.65);
    const clickSpy = vi.fn();
    detector.setOnClickCallback(clickSpy);

    const freqData = new Uint8Array(256);
    // Baseline quiet
    detector.evaluateFrequencySpike(freqData, 1000);

    // Simulate high-frequency snap spike (bins 40 to 120 filled with high energy)
    for (let i = 35; i < 150; i++) {
      freqData[i] = 220;
    }

    const detected = detector.evaluateFrequencySpike(freqData, 1020);
    expect(detected).toBe(true);
    expect(clickSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        intensity: expect.any(Number),
        frequencyBand: 4000,
      })
    );
  });
});
