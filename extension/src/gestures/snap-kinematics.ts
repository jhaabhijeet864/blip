import { BrowserVisionDetector } from "../vision/vision-detector";
import { HandLandmarks } from "../vision/types";

export type GestureEventType = "snap";

export interface GestureTriggerEvent {
  type: GestureEventType;
  timestamp: number;
  confidence: number;
}

export type GestureCallback = (event: GestureTriggerEvent) => void;

export class DualTriggerSnapKinematics {
  private pinchThreshold = 0.06; // Normalized distance for thumb-middle pinch
  private releaseThreshold = 0.12; // Normalized distance indicating snap release
  private alignmentWindowMs = 200; // Temporal window for audio click matching
  private cooldownMs = 1500; // Cooldown after a confirmed gesture

  private isArmed = false;
  private armTimestamp = 0;
  private releaseTimestamp = 0;
  private recentClickTimestamp = 0;
  private lastTriggerTimestamp = 0;

  private onGestureTriggered: GestureCallback | null = null;
  private onArmedChange: ((armed: boolean) => void) | null = null;

  constructor(pinchThreshold = 0.06, cooldownMs = 1500) {
    this.pinchThreshold = pinchThreshold;
    this.cooldownMs = cooldownMs;
  }

  public setOnGestureTriggered(cb: GestureCallback): void {
    this.onGestureTriggered = cb;
  }

  public setOnArmedChange(cb: (armed: boolean) => void): void {
    this.onArmedChange = cb;
  }

  public registerAudioClick(clickTime: number): void {
    this.recentClickTimestamp = clickTime;
    this.evaluateSnapConditions(clickTime);
  }

  public processHandFrame(hand: HandLandmarks | null, now: number): void {
    if (this.lastTriggerTimestamp > 0 && now - this.lastTriggerTimestamp < this.cooldownMs) {
      return; // Debounce cooldown in effect
    }

    if (!hand) {
      this.resetArmState();
      return;
    }

    // Evaluate Thanos Finger Snap kinematics
    const pinchDist = BrowserVisionDetector.calculateThumbMiddleDistance(hand);

    if (pinchDist < this.pinchThreshold) {
      // Thumb and middle finger touching - Snap is ARMED
      if (!this.isArmed) {
        this.isArmed = true;
        this.armTimestamp = now;
        if (this.onArmedChange) {
          this.onArmedChange(true);
        }
      }
    } else if (this.isArmed && pinchDist > this.releaseThreshold) {
      // Snap RELEASE detected
      this.isArmed = false;
      this.releaseTimestamp = now;
      if (this.onArmedChange) {
        this.onArmedChange(false);
      }
      this.evaluateSnapConditions(now);
    }
  }

  private evaluateSnapConditions(now: number): void {
    if (this.lastTriggerTimestamp > 0 && now - this.lastTriggerTimestamp < this.cooldownMs) {
      return;
    }

    // Must have a recent release
    const timeSinceRelease = Math.abs(now - this.releaseTimestamp);
    const timeSinceClick = Math.abs(now - this.recentClickTimestamp);
    const clickReleaseDelta = Math.abs(this.releaseTimestamp - this.recentClickTimestamp);

    // Both visual release and acoustic click occurred within the alignment window
    if (
      this.releaseTimestamp > 0 &&
      this.recentClickTimestamp > 0 &&
      clickReleaseDelta <= this.alignmentWindowMs &&
      timeSinceRelease <= 300 &&
      timeSinceClick <= 300
    ) {
      this.fireTrigger("snap", now, 1.0);
      this.resetArmState();
      this.releaseTimestamp = 0;
      this.recentClickTimestamp = 0;
    }
  }

  private fireTrigger(type: GestureEventType, now: number, confidence: number): void {
    this.lastTriggerTimestamp = now;
    if (this.onGestureTriggered) {
      this.onGestureTriggered({
        type,
        timestamp: now,
        confidence,
      });
    }
  }

  private resetArmState(): void {
    if (this.isArmed) {
      this.isArmed = false;
      if (this.onArmedChange) {
        this.onArmedChange(false);
      }
    }
  }

  public getIsArmed(): boolean {
    return this.isArmed;
  }
}
