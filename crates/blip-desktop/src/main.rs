#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use blip_core::capture::CaptureConfig;
use blip_core::device::{get_best_default_camera, query_camera_devices};
use blip_core::pipeline::VideoPipeline;
use commands::AppState;
use parking_lot::RwLock;
use std::sync::Arc;

fn main() {
    // Automatically select genuine hardware webcam over DroidCam/virtual devices
    let devices = query_camera_devices().unwrap_or_default();
    let default_cam_idx = get_best_default_camera(&devices);

    let config = CaptureConfig {
        camera_index: default_cam_idx,
        width: 1280,
        height: 720,
        fps: 30,
    };

    let pipeline = VideoPipeline::start(config).expect("Failed to start Blip video pipeline");
    let app_state = AppState {
        pipeline: Arc::new(RwLock::new(pipeline)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::get_cameras,
            commands::switch_camera,
            commands::get_preview_frame,
            commands::trigger_thanos_snap,
            commands::trigger_instant_transmission,
            commands::trigger_reappear,
            commands::start_calibration,
            commands::get_pipeline_status,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Blip desktop application");
}
