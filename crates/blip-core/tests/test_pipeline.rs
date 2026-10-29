//! Integration tests for VideoPipeline execution, preview fetching, effects, and camera switching.

use blip_core::capture::CaptureConfig;
use blip_core::diagnostics::render_offline_frame;
use blip_core::effects::plate::CalibrationState;
use blip_core::effects::EffectState;
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

#[test]
fn test_pipeline_effects_and_calibration_triggers() {
    let config = CaptureConfig {
        camera_index: 99,
        width: 320,
        height: 240,
        fps: 30,
    };

    let mut pipeline = VideoPipeline::start(config).expect("Pipeline should start");

    // Poll until preview frame is available (pipeline loop is active)
    for _ in 0..20 {
        if pipeline.get_latest_preview_frame().is_some() {
            break;
        }
        thread::sleep(Duration::from_millis(50));
    }

    // Initial effect state is Idle
    assert_eq!(pipeline.effect_state(), EffectState::Idle);

    // Trigger Thanos Snap
    assert!(pipeline.trigger_thanos_snap().is_ok());
    // Wait for pipeline loop to become active and process the initial frame
    let mut thanos_triggered = false;
    for _ in 0..60 {
        match pipeline.effect_state() {
            EffectState::Disintegrating { .. } | EffectState::Vanished => {
                thanos_triggered = true;
                break;
            }
            _ => thread::sleep(Duration::from_millis(100)),
        }
    }
    assert!(
        thanos_triggered,
        "Thanos effect did not transition to Disintegrating or Vanished"
    );

    // Trigger Goku Instant Transmission
    assert!(pipeline.trigger_instant_transmission().is_ok());
    thread::sleep(Duration::from_millis(100));

    // Trigger Reappear
    assert!(pipeline.trigger_reappear().is_ok());
    thread::sleep(Duration::from_millis(100));

    // Trigger Calibration
    assert!(pipeline.start_calibration().is_ok());
    let mut calibration_started = false;
    let mut last_cal_state = pipeline.calibration_state();
    for _ in 0..40 {
        last_cal_state = pipeline.calibration_state();
        match last_cal_state {
            CalibrationState::Countdown { .. }
            | CalibrationState::Sampling { .. }
            | CalibrationState::Ready => {
                calibration_started = true;
                break;
            }
            _ => thread::sleep(Duration::from_millis(50)),
        }
    }
    assert!(
        calibration_started,
        "Calibration did not transition; last state: {:?}",
        last_cal_state
    );

    pipeline.stop();
}
