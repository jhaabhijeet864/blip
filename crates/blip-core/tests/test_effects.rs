use blip_core::effects::{
    goku::{GokuPhase, InstantTransmissionEffect},
    thanos::ThanosDisintegration,
};
use glam::Vec2;
use image::{Rgb, RgbImage};

#[test]
fn test_thanos_particle_pool_lifecycle() {
    let mut thanos = ThanosDisintegration::new();
    assert!(!thanos.is_active());
    assert_eq!(thanos.active_particle_count(), 0);
    assert_eq!(thanos.progress(), 0.0);

    thanos.trigger();
    assert!(thanos.is_active());
    assert!(!thanos.is_finished());

    // Create mock 720p frame and segmentation mask
    let width = 640;
    let height = 360;
    let frame = RgbImage::from_pixel(width, height, Rgb([120, 100, 80]));
    let bg = RgbImage::from_pixel(width, height, Rgb([30, 40, 50]));
    let mut target = RgbImage::new(width, height);

    // Subject is a center box
    let mut mask = vec![0u8; (width * height) as usize];
    for y in 100..300 {
        for x in 200..440 {
            mask[(y * width + x) as usize] = 255;
        }
    }

    // Step physics through initial frames
    for _ in 0..10 {
        thanos.step(0.033, Some(&mask), &frame, width, height);
    }

    assert!(thanos.progress() > 0.0);
    assert!(thanos.active_particle_count() > 0);

    // Render composite frame
    thanos.render(&mut target, &frame, &bg, Some(&mask));
    assert_eq!(target.dimensions(), (width, height));

    // Reset
    thanos.reset();
    assert!(!thanos.is_active());
    assert_eq!(thanos.active_particle_count(), 0);
}

#[test]
fn test_goku_instant_transmission_phases() {
    let mut goku = InstantTransmissionEffect::new();
    assert_eq!(goku.current_phase(), GokuPhase::Idle);
    assert!(!goku.is_active());
    assert!(!goku.is_vanished());

    // Trigger at center
    goku.trigger(Vec2::new(320.0, 180.0));
    assert!(goku.is_active());
    assert_eq!(goku.current_phase(), GokuPhase::ChargingSpeedlines);

    let width = 640;
    let height = 360;
    let frame = RgbImage::from_pixel(width, height, Rgb([100, 150, 200]));
    let bg = RgbImage::from_pixel(width, height, Rgb([20, 25, 30]));
    let mut target = RgbImage::new(width, height);

    // Step through Phase 1: Charge
    goku.step(0.06);
    assert_eq!(goku.current_phase(), GokuPhase::ChargingSpeedlines);
    goku.render(&mut target, &frame, &bg, None);

    // Step into Phase 2: Flash Bloom & Shockwave (>= 0.12s)
    goku.step(0.08); // total 0.14s
    assert_eq!(goku.current_phase(), GokuPhase::FlashShockwave);
    goku.render(&mut target, &frame, &bg, None);

    // Step into Phase 3: Vanished Dissipating (>= 0.18s)
    goku.step(0.08); // total 0.22s
    assert_eq!(goku.current_phase(), GokuPhase::VanishedDissipating);
    assert!(goku.is_vanished());
    goku.render(&mut target, &frame, &bg, None);

    // Step to completion (>= 0.35s)
    goku.step(0.15); // total 0.37s
    assert_eq!(goku.current_phase(), GokuPhase::Completed);
    assert!(goku.is_completed());

    goku.reset();
    assert_eq!(goku.current_phase(), GokuPhase::Idle);
}

#[test]
fn test_thanos_disintegration_completion() {
    let mut thanos = ThanosDisintegration::new();
    thanos.trigger();

    let width = 320;
    let height = 240;
    let frame = RgbImage::from_pixel(width, height, Rgb([180, 120, 90]));
    let bg = RgbImage::from_pixel(width, height, Rgb([10, 10, 10]));
    let mut target = RgbImage::new(width, height);

    // Step through entire duration (1.8s + extra for particles to die)
    for _ in 0..120 {
        thanos.step(0.033, None, &frame, width, height);
    }

    assert_eq!(thanos.progress(), 1.0);
    assert!(thanos.is_finished());

    thanos.render(&mut target, &frame, &bg, None);
    // When finished and mask is None, eroded background should dominate
    let sample = target.get_pixel(160, 120);
    assert_eq!(sample.0, [10, 10, 10]);
}
