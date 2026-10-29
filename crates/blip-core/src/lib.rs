//! Native Rust engine for Blip: Video Capture, Kinematics, and Virtual Camera sink.

pub mod capture;
pub mod device;
pub mod diagnostics;
pub mod pipeline;
pub mod vcam;

use thiserror::Error;

#[derive(Error, Debug)]
pub enum BlipError {
    #[error("Camera at index {0} not found")]
    CameraNotFound(u32),

    #[error("Camera capture error: {0}")]
    CaptureError(String),

    #[error("Unsupported frame format: {0}")]
    FormatUnsupported(String),

    #[error("Virtual camera sink error: {0}")]
    VCamError(String),

    #[error("Device is locked or busy: {0}")]
    DeviceBusy(String),
}
