use blip_core::effects::{
    plate::{CalibrationState, CleanPlateManager},
    reappear::{ReappearEffect, ReappearMode},
};
use image::{Rgb, RgbImage};

#[test]
fn test_clean_plate_countdown_and_sampling() {
    let mut manager = CleanPlateManager::new();
    assert_eq!(manager.state(), CalibrationState::Uncalibrated);
    assert!(!manager.is_ready());

    manager.start_countdown();
    match manager.state() {
        CalibrationState::Countdown { remaining_secs } => {
            assert!((remaining_secs - 3.0).abs() < 0.01);
        }
        _ => panic!("Expected Countdown state"),
    }

    let width = 320;
    let height = 240;
    let frame = RgbImage::from_pixel(width, height, Rgb([100, 150, 200]));

    // Step countdown past 3.0 seconds (e.g. 3.1s)
    manager.step(3.1, &frame);

    // Should now be sampling
    match manager.state() {
        CalibrationState::Sampling { frames_collected } => {
            assert_eq!(frames_collected, 0);
        }
        _ => panic!("Expected Sampling state after countdown completion"),
    }

    // Ingest 10 frames to complete sampling
    for i in 1..=10 {
        manager.step(0.033, &frame);
        if i < 10 {
            match manager.state() {
                CalibrationState::Sampling { frames_collected } => {
                    assert_eq!(frames_collected, i);
                }
                _ => panic!("Expected Sampling at step {i}"),
            }
        }
    }

    // Now state should be Ready and plate should exist
    assert_eq!(manager.state(), CalibrationState::Ready);
    assert!(manager.is_ready());

    let plate = manager.get_plate().expect("Plate should be available");
    assert_eq!(plate.dimensions(), (width, height));
    assert_eq!(plate.get_pixel(100, 100).0, [100, 150, 200]);
}

#[test]
fn test_lab_luminance_compensation() {
    let mut manager = CleanPlateManager::new();
    let width = 160;
    let height = 120;

    // Baseline plate with mid-gray (100)
    let baseline = RgbImage::from_pixel(width, height, Rgb([100, 100, 100]));
    manager.set_plate(baseline);
    assert!(manager.is_ready());

    // Live frame is significantly brighter (150)
    let bright_frame = RgbImage::from_pixel(width, height, Rgb([150, 150, 150]));
    let compensated = manager
        .get_compensated_plate(&bright_frame, None)
        .expect("Compensated plate should be generated");

    // Pixels should be scaled up to match ambient brightness
    let px = compensated.get_pixel(50, 50).0;
    assert!(
        px[0] > 100,
        "Compensated pixel should be brighter than baseline"
    );
    assert_eq!(px[0], px[1]);
    assert_eq!(px[1], px[2]);
}

#[test]
fn test_reappear_transition_lifecycle() {
    let mut reappear = ReappearEffect::new();
    assert!(!reappear.is_active());
    assert!(reappear.is_finished());

    reappear.trigger(ReappearMode::SmoothDissolve);
    assert!(reappear.is_active());
    assert!(!reappear.is_finished());

    let width = 160;
    let height = 120;
    let live = RgbImage::from_pixel(width, height, Rgb([200, 200, 200]));
    let bg = RgbImage::from_pixel(width, height, Rgb([50, 50, 50]));
    let mut target = RgbImage::new(width, height);

    // Step halfway (0.15s)
    reappear.step(0.15);
    reappear.render(&mut target, &live, &bg, None);
    let mid_px = target.get_pixel(80, 60).0[0];
    assert!(
        mid_px > 50 && mid_px < 200,
        "Pixel should be blended between bg and live: got {mid_px}"
    );

    // Step to completion (0.35s total)
    reappear.step(0.20);
    assert!(reappear.is_finished());
    assert!(!reappear.is_active());
}
