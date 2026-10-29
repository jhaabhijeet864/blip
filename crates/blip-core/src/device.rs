//! Hardware camera device enumeration, classification, and priority selection.

use crate::BlipError;
use nokhwa::utils::ApiBackend;

/// Represents an enumerated camera device on the host system.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CameraDevice {
    pub index: u32,
    pub name: String,
    pub display_label: String,
    pub is_active: bool,
    pub is_virtual: bool,
    pub is_phone_bridge: bool,
}

impl CameraDevice {
    pub fn new(index: u32, name: String, is_active: bool) -> Self {
        let is_virtual = is_virtual_camera_name(&name);
        let is_phone_bridge = is_phone_bridge_name(&name);
        let display_label = build_display_label(&name, is_phone_bridge, is_virtual, is_active);

        Self {
            index,
            name,
            display_label,
            is_active,
            is_virtual,
            is_phone_bridge,
        }
    }
}

/// Returns true if the device name indicates a software virtual camera loopback.
pub fn is_virtual_camera_name(name: &str) -> bool {
    let lower = name.to_lowercase();
    const VIRTUAL_SUBSTRINGS: &[&str] = &[
        "obs virtual camera",
        "obs-camera",
        "v4l2loopback",
        "virtual camera",
        "unity video capture",
        "screen capture",
        "splitcam video",
        "manycam video device",
    ];

    VIRTUAL_SUBSTRINGS.iter().any(|&sub| lower.contains(sub))
}

/// Returns true if the device name indicates a phone streaming bridge.
pub fn is_phone_bridge_name(name: &str) -> bool {
    let lower = name.to_lowercase();
    const PHONE_BRIDGE_SUBSTRINGS: &[&str] = &[
        "droidcam",
        "iriun",
        "epoccam",
        "camo",
        "reincubate camo",
        "ivcam",
    ];

    PHONE_BRIDGE_SUBSTRINGS.iter().any(|&sub| lower.contains(sub))
}

/// Formats a friendly label for user interface dropdowns.
pub fn build_display_label(
    name: &str,
    is_phone_bridge: bool,
    is_virtual: bool,
    is_active: bool,
) -> String {
    if is_phone_bridge {
        format!("{name} (Phone App)")
    } else if is_virtual {
        format!("{name} (Virtual Device)")
    } else if is_active {
        format!("{name} (Active)")
    } else {
        format!("{name} (Offline)")
    }
}

/// Query connected video capture devices on Windows via Media Foundation.
pub fn query_camera_devices() -> Result<Vec<CameraDevice>, BlipError> {
    let mut devices = Vec::new();

    // Query native Media Foundation backend
    let queried = nokhwa::query(ApiBackend::MediaFoundation)
        .or_else(|_| nokhwa::query(ApiBackend::Auto))
        .map_err(|e| BlipError::CaptureError(format!("Failed to query camera devices: {e}")))?;

    for (idx, cam_info) in queried.into_iter().enumerate() {
        let name = cam_info.human_name();
        let index = idx as u32;
        // In MSMF enumeration, enumerated devices are active hardware endpoints
        let dev = CameraDevice::new(index, name, true);
        devices.push(dev);
    }

    Ok(devices)
}

/// Selects the best default camera index.
/// Strictly prioritizes genuine built-in or USB physical webcams over phone bridges and virtual cameras.
pub fn get_best_default_camera(devices: &[CameraDevice]) -> u32 {
    if devices.is_empty() {
        return 0;
    }

    // Tier 1: Active genuine physical hardware webcams
    if let Some(dev) = devices
        .iter()
        .find(|d| !d.is_virtual && !d.is_phone_bridge && d.is_active)
    {
        return dev.index;
    }

    // Tier 2: Any genuine physical hardware webcam
    if let Some(dev) = devices
        .iter()
        .find(|d| !d.is_virtual && !d.is_phone_bridge)
    {
        return dev.index;
    }

    // Tier 3: Phone bridge if available
    if let Some(dev) = devices.iter().find(|d| d.is_phone_bridge && d.is_active) {
        return dev.index;
    }

    // Tier 4: First available camera
    devices[0].index
}
