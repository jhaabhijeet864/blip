use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use blip_core::device::{get_best_default_camera, query_camera_devices};
use blip_core::effects::plate::CalibrationState;
use blip_core::effects::EffectState;
use blip_core::pipeline::VideoPipeline;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use std::sync::Arc;
use tauri::State;

/// Shared application state managed by Tauri.
pub struct AppState {
    pub pipeline: Arc<RwLock<VideoPipeline>>,
}

/// Camera device metadata payload for the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraDevicePayload {
    pub index: u32,
    pub name: String,
    pub display_label: String,
    pub is_phone_bridge: bool,
    pub is_virtual: bool,
    pub is_default: bool,
}

/// Pipeline status payload for UI telemetry badges.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineStatusPayload {
    pub active_camera_index: u32,
    pub effect_state: String,
    pub calibration_state: String,
    pub calibration_countdown: Option<f32>,
}

/// Query connected webcams, categorize them, and flag the best hardware camera as default.
#[tauri::command]
pub fn get_cameras() -> Vec<CameraDevicePayload> {
    let devices = query_camera_devices().unwrap_or_default();
    let best_default = get_best_default_camera(&devices);

    devices
        .into_iter()
        .map(|dev| {
            let is_default = dev.index == best_default;

            CameraDevicePayload {
                index: dev.index,
                name: dev.name,
                display_label: dev.display_label,
                is_phone_bridge: dev.is_phone_bridge,
                is_virtual: dev.is_virtual,
                is_default,
            }
        })
        .collect()
}

/// Hot-swap active input camera device.
#[tauri::command]
pub fn switch_camera(index: u32, state: State<'_, AppState>) -> Result<(), String> {
    state
        .pipeline
        .read()
        .switch_camera(index)
        .map_err(|e| e.to_string())
}

/// Fetch latest processed preview frame encoded as a Base64 JPEG data URL.
#[tauri::command]
pub fn get_preview_frame(state: State<'_, AppState>) -> Option<String> {
    let frame = state.pipeline.read().get_latest_preview_frame()?;
    let mut buffer = Cursor::new(Vec::with_capacity(32768));

    // Fast JPEG encoding for 30+ FPS preview stream
    frame.write_to(&mut buffer, image::ImageFormat::Jpeg).ok()?;

    let b64 = BASE64.encode(buffer.into_inner());
    Some(format!("data:image/jpeg;base64,{b64}"))
}

/// Trigger Thanos ash disintegration.
#[tauri::command]
pub fn trigger_thanos_snap(state: State<'_, AppState>) -> Result<(), String> {
    state
        .pipeline
        .read()
        .trigger_thanos_snap()
        .map_err(|e| e.to_string())
}

/// Trigger Goku Instant Transmission anime speedlines and flash vanish.
#[tauri::command]
pub fn trigger_instant_transmission(state: State<'_, AppState>) -> Result<(), String> {
    state
        .pipeline
        .read()
        .trigger_instant_transmission()
        .map_err(|e| e.to_string())
}

/// Trigger fluid subject reappearance.
#[tauri::command]
pub fn trigger_reappear(state: State<'_, AppState>) -> Result<(), String> {
    state
        .pipeline
        .read()
        .trigger_reappear()
        .map_err(|e| e.to_string())
}

/// Start empty room background calibration countdown (3 seconds).
#[tauri::command]
pub fn start_calibration(state: State<'_, AppState>) -> Result<(), String> {
    state
        .pipeline
        .read()
        .start_calibration()
        .map_err(|e| e.to_string())
}

/// Fetch current telemetry and pipeline status.
#[tauri::command]
pub fn get_pipeline_status(state: State<'_, AppState>) -> PipelineStatusPayload {
    let pipe = state.pipeline.read();
    let active_camera_index = *pipe.active_camera_index.read();

    let effect_str = match pipe.effect_state() {
        EffectState::Idle => "Idle",
        EffectState::Disintegrating { .. } => "Disintegrating",
        EffectState::Vanished => "Vanished",
        EffectState::Reappearing { .. } => "Reappearing",
    };

    let (cal_str, countdown) = match pipe.calibration_state() {
        CalibrationState::Uncalibrated => ("Uncalibrated", None),
        CalibrationState::Countdown { remaining_secs } => ("Countdown", Some(remaining_secs)),
        CalibrationState::Sampling { .. } => ("Sampling", None),
        CalibrationState::Ready => ("Ready", None),
    };

    PipelineStatusPayload {
        active_camera_index,
        effect_state: effect_str.to_string(),
        calibration_state: cal_str.to_string(),
        calibration_countdown: countdown,
    }
}
