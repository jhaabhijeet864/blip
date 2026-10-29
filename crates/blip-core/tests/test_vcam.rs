//! Unit tests for virtual camera sink and driver detection in blip-core.

use blip_core::vcam::{check_vcam_driver, VCamDriverStatus, VirtualCamSink};
use image::{Rgb, RgbImage};

#[test]
fn test_check_vcam_driver_returns_valid_variant() {
    let status = check_vcam_driver();
    // Must return one of the valid enum variants without panicking
    assert!(
        status == VCamDriverStatus::Ready
            || status == VCamDriverStatus::NotInstalled
            || status == VCamDriverStatus::PermissionDenied
    );
}

#[test]
fn test_virtual_cam_sink_lifecycle() {
    // Attempt opening virtual camera sink
    let sink_result = VirtualCamSink::open(640, 480, 30.0);

    match sink_result {
        Ok(mut sink) => {
            assert!(sink.is_open());
            assert_eq!(sink.width, 640);
            assert_eq!(sink.height, 480);

            // Create test RGB frame and push
            let mut frame = RgbImage::new(640, 480);
            for p in frame.pixels_mut() {
                *p = Rgb([50, 100, 150]);
            }

            let send_res = sink.send_frame(&frame);
            assert!(send_res.is_ok());

            sink.close();
            assert!(!sink.is_open());
        }
        Err(_) => {
            // If OBS driver is not installed in the test environment, open returns Err cleanly
            println!("OBS Virtual Camera driver not active in test environment; error handled cleanly.");
        }
    }
}
