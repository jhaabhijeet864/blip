export type BlipAction =
  | "BLIP_TRIGGER_SNAP"
  | "BLIP_TRIGGER_GOKU"
  | "BLIP_TRIGGER_REAPPEAR"
  | "BLIP_CALIBRATE"
  | "BLIP_CALIBRATE_START"
  | "BLIP_LOAD_PLATE"
  | "BLIP_TOGGLE_OVERLAY"
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
  autoSnapEnabled: boolean; // Automatic snap detection via audio/gesture
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
  autoSnapEnabled: true, // Default ON for seamless snapping
  dustDurationMs: 1500,
  dustDirection: "up",
  autoMute: true,
  gestureMode: "snap",
  showInMeetingOverlay: false, // Default opt-in
};

export interface BlipState {
  isIntercepted: boolean;
  isVanished: boolean;
  currentEffect: "none" | "snap" | "goku";
  hasBackgroundPlate: boolean;
  fps: number;
  lastGestureTime: number;
}

export interface BlipMessage {
  action: BlipAction;
  payload?: any;
  source?: string;
  timestamp?: number;
}
