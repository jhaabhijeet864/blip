//! Virtual Camera Sink: Streams processed frames to the OS-level OBS Virtual Camera driver.

use crate::BlipError;
use image::RgbImage;
use virtualcam::{BackendKind, Camera, PixelFormat};

/// Status of the virtual camera driver on the host system.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VCamDriverStatus {
    Ready,
    NotInstalled,
    PermissionDenied,
}

/// Checks whether the OBS Virtual Camera driver is registered and available on Windows.
pub fn check_vcam_driver() -> VCamDriverStatus {
    // Attempt building a dummy 320x240 probe camera to check driver availability
    match Camera::builder(320, 240, 30.0)
        .backend(BackendKind::Obs)
        .format(PixelFormat::RGB)
        .build()
    {
        Ok(_) => VCamDriverStatus::Ready,
        Err(e) => {
            let msg = e.to_string().to_lowercase();
            if msg.contains("permission") || msg.contains("access denied") {
                VCamDriverStatus::PermissionDenied
            } else {
                VCamDriverStatus::NotInstalled
            }
        }
    }
}

/// Managed Virtual Camera sink handle.
pub struct VirtualCamSink {
    inner: Option<Camera>,
    pub width: u32,
    pub height: u32,
    pub fps: f64,
}

impl VirtualCamSink {
    /// Opens connection to the OBS Virtual Camera DirectShow shared-memory queue.
    pub fn open(width: u32, height: u32, fps: f64) -> Result<Self, BlipError> {
        let camera = Camera::builder(width, height, fps)
            .backend(BackendKind::Obs)
            .format(PixelFormat::RGB)
            .build()
            .map_err(|e| {
                BlipError::VCamError(format!(
                    "Failed to open OBS Virtual Camera sink ({width}x{height} @ {fps}fps): {e}"
                ))
            })?;

        Ok(Self {
            inner: Some(camera),
            width,
            height,
            fps,
        })
    }

    /// Broadcasts an RGB frame buffer directly to the virtual camera device.
    pub fn send_frame(&mut self, frame: &RgbImage) -> Result<(), BlipError> {
        let camera = self
            .inner
            .as_mut()
            .ok_or_else(|| BlipError::VCamError("Virtual camera sink is closed".into()))?;

        // Send RGB frame bytes (virtualcam handles any backend color conversion/scaling automatically)
        camera.send(frame.as_raw()).map_err(|e| {
            BlipError::VCamError(format!("Failed to send frame to virtual camera: {e}"))
        })?;

        Ok(())
    }

    /// Explicitly closes the virtual camera handle.
    pub fn close(&mut self) {
        self.inner = None;
    }

    /// Returns true if the sink is currently open.
    pub fn is_open(&self) -> bool {
        self.inner.is_some()
    }
}

impl Drop for VirtualCamSink {
    fn drop(&mut self) {
        self.close();
    }
}
