export type BlipActionType =
  | "BLIP_TRIGGER_SNAP"
  | "BLIP_TRIGGER_GOKU"
  | "BLIP_TRIGGER_REAPPEAR"
  | "BLIP_CALIBRATE"
  | "BLIP_CALIBRATE_START"
  | "BLIP_UPDATE_CONFIG"
  | "BLIP_STATUS_REQUEST"
  | "BLIP_STATUS_RESPONSE"
  | "BLIP_AUTO_MUTE"
  | "BLIP_LOG";

export type DustDirection = "up" | "left" | "right" | "radial";
export type GestureEffectType = "snap" | "goku";

export interface BlipConfig {
  enabled: boolean;
  snapSensitivity: number; // 0.0 to 1.0
  audioClickThreshold: number; // 0.0 to 1.0
  dustDurationMs: number; // e.g. 1500ms
  dustDirection: DustDirection;
  autoMute: boolean;
  gestureMode: GestureEffectType;
  showInMeetingOverlay: boolean;
}

export const DEFAULT_BLIP_CONFIG: BlipConfig = {
  enabled: true,
  snapSensitivity: 0.75,
  audioClickThreshold: 0.65,
  dustDurationMs: 1500,
  dustDirection: "up",
  autoMute: true,
  gestureMode: "snap",
  showInMeetingOverlay: true,
};

export interface BlipState {
  isIntercepted: boolean;
  isVanished: boolean;
  currentEffect: "none" | "snap" | "goku";
  hasBackgroundPlate: boolean;
  fps: number;
  lastGestureTime: number;
}

export interface BlipMessage<T = unknown> {
  source: "blip-extension-content" | "blip-extension-injected" | "blip-extension-popup" | "blip-extension-overlay";
  action: BlipActionType;
  payload?: T;
  timestamp: number;
}
