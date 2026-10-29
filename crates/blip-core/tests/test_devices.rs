//! Unit tests for camera device enumeration and priority selection in blip-core.

use blip_core::device::{
    build_display_label, get_best_default_camera, is_phone_bridge_name, is_virtual_camera_name,
    CameraDevice,
};

#[test]
fn test_is_virtual_camera_name() {
    assert!(is_virtual_camera_name("OBS Virtual Camera"));
    assert!(is_virtual_camera_name("obs-camera"));
    assert!(is_virtual_camera_name("ManyCam Video Device"));
    assert!(is_virtual_camera_name("v4l2loopback instance 0"));

    assert!(!is_virtual_camera_name("HP Wide Vision HD Camera"));
    assert!(!is_virtual_camera_name("Logitech Brio 4K"));
    assert!(!is_virtual_camera_name("Integrated Webcam"));
}

#[test]
fn test_is_phone_bridge_name() {
    assert!(is_phone_bridge_name("DroidCam Video"));
    assert!(is_phone_bridge_name("Iriun Webcam"));
    assert!(is_phone_bridge_name("EpocCam Camera"));
    assert!(is_phone_bridge_name("Reincubate Camo"));
    assert!(is_phone_bridge_name("iVCam"));

    assert!(!is_phone_bridge_name("HP Wide Vision HD Camera"));
    assert!(!is_phone_bridge_name("OBS Virtual Camera"));
}

#[test]
fn test_build_display_label() {
    assert_eq!(
        build_display_label("DroidCam Video", true, false, true),
        "DroidCam Video (Phone App)"
    );
    assert_eq!(
        build_display_label("OBS Virtual Camera", false, true, true),
        "OBS Virtual Camera (Virtual Device)"
    );
    assert_eq!(
        build_display_label("HP Wide Vision HD Camera", false, false, true),
        "HP Wide Vision HD Camera (Active)"
    );
    assert_eq!(
        build_display_label("USB Camera", false, false, false),
        "USB Camera (Offline)"
    );
}

#[test]
fn test_get_best_default_camera_prioritizes_hardware_over_phone_bridge() {
    let devices = vec![
        CameraDevice::new(0, "DroidCam Video".to_string(), true),
        CameraDevice::new(1, "HP Wide Vision HD Camera".to_string(), true),
        CameraDevice::new(2, "OBS Virtual Camera".to_string(), true),
    ];

    // Even though DroidCam is index 0, HP Wide Vision HD Camera must be chosen
    let best_idx = get_best_default_camera(&devices);
    assert_eq!(best_idx, 1);
}

#[test]
fn test_get_best_default_camera_fallback_when_only_phone_bridge() {
    let devices = vec![
        CameraDevice::new(0, "DroidCam Video".to_string(), true),
        CameraDevice::new(1, "OBS Virtual Camera".to_string(), true),
    ];

    let best_idx = get_best_default_camera(&devices);
    assert_eq!(best_idx, 0);
}

#[test]
fn test_get_best_default_camera_empty_list() {
    let devices = vec![];
    assert_eq!(get_best_default_camera(&devices), 0);
}

#[test]
fn test_query_camera_devices_does_not_panic() {
    // Tests that query_camera_devices runs and returns Ok or safe error on Windows
    let result = blip_core::device::query_camera_devices();
    assert!(result.is_ok());
    if let Ok(devs) = result {
        println!("Queried {} camera devices:", devs.len());
        for dev in &devs {
            println!("  [{}] {} -> {}", dev.index, dev.name, dev.display_label);
        }
    }
}
