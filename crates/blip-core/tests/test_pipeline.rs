//! Integration tests for VideoPipeline execution, preview fetching, and camera switching.

use blip_core::capture::CaptureConfig;
use blip_core::diagnostics::render_offline_frame;
use blip_core::pipeline::VideoPipeline;
use std::thread;
use std::time::Duration;

#[test]
fn test_render_offline_frame() {
    let frame = render_offline_frame(640, 480, "Test Cam", "Offline test");
    assert_eq!(frame.width(), 640);
    assert_eq!(frame.height(), 480);
}

#[test]
fn test_pipeline_start_preview_and_switch_lifecycle() {
    let config = CaptureConfig {
        camera_index: 0,
        width: 640,
        height: 480,
        fps: 30,
    };

    let mut pipeline = VideoPipeline::start(config).expect("Pipeline should start cleanly");

    // Poll until preview frame is available
    let mut preview = None;
    for _ in 0..20 {
        if let Some(p) = pipeline.get_latest_preview_frame() {
            preview = Some(p);
            break;
        }
        thread::sleep(Duration::from_millis(50));
    }

    assert!(preview.is_some());
    let frame = preview.unwrap();
    assert_eq!(frame.width(), 640);
    assert_eq!(frame.height(), 480);

    // Test camera switching
    let switch_res = pipeline.switch_camera(1);
    assert!(switch_res.is_ok());

    for _ in 0..20 {
        if *pipeline.active_camera_index.read() == 1 {
            break;
        }
        thread::sleep(Duration::from_millis(50));
    }
    assert_eq!(*pipeline.active_camera_index.read(), 1);

    // Stop pipeline gracefully
    pipeline.stop();
}
