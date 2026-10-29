//! Hardware webcam capture using nokhwa with Microsoft Media Foundation (MSMF).

use crate::BlipError;
use image::RgbImage;
use nokhwa::pixel_format::RgbFormat;
use nokhwa::utils::{CameraIndex, RequestedFormat, RequestedFormatType, Resolution};
use nokhwa::Camera;

/// Configuration for camera capture parameters.
#[derive(Debug, Clone)]
pub struct CaptureConfig {
    pub camera_index: u32,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
}

impl Default for CaptureConfig {
    fn default() -> Self {
        Self {
            camera_index: 0,
            width: 1280,
            height: 720,
            fps: 30,
        }
    }
}

/// Managed hardware camera capture handle.
pub struct CameraCapture {
    inner: Option<Camera>,
    pub config: CaptureConfig,
}

impl CameraCapture {
    /// Opens the specified camera device and initiates the video stream.
    pub fn open(config: CaptureConfig) -> Result<Self, BlipError> {
        let index = CameraIndex::Index(config.camera_index);

        // Try exact requested resolution, fallback to standard resolution
        let format = RequestedFormat::new::<RgbFormat>(RequestedFormatType::Exact(
            nokhwa::utils::CameraFormat::new(
                Resolution::new(config.width, config.height),
                nokhwa::utils::FrameFormat::RAWRGB,
                config.fps,
            ),
        ));

        let mut camera = Camera::new(index.clone(), format).or_else(|_| {
            let fallback_format = RequestedFormat::new::<RgbFormat>(
                RequestedFormatType::AbsoluteHighestFrameRate,
            );
            Camera::new(index, fallback_format)
        }).map_err(|e| {
            BlipError::CaptureError(format!(
                "Failed to initialize camera at index {}: {e}",
                config.camera_index
            ))
        })?;

        camera.open_stream().map_err(|e| {
            BlipError::CaptureError(format!(
                "Failed to start camera stream on device {}: {e}",
                config.camera_index
            ))
        })?;

        Ok(Self {
            inner: Some(camera),
            config,
        })
    }

    /// Captures the latest frame and decodes it directly into an RGB image buffer.
    pub fn read_frame(&mut self) -> Result<RgbImage, BlipError> {
        let camera = self
            .inner
            .as_mut()
            .ok_or_else(|| BlipError::CaptureError("Camera stream is closed".into()))?;

        let frame = camera.frame().map_err(|e| {
            BlipError::CaptureError(format!("Failed to grab camera frame: {e}"))
        })?;

        let decoded = frame.decode_image::<RgbFormat>().map_err(|e| {
            BlipError::FormatUnsupported(format!("Failed to decode RGB frame: {e}"))
        })?;

        Ok(decoded)
    }

    /// Explicitly stops the camera stream and releases the OS hardware handle.
    pub fn stop(&mut self) {
        if let Some(mut camera) = self.inner.take() {
            let _ = camera.stop_stream();
            // Camera dropped here, immediately releasing DirectShow / MSMF COM handles
        }
    }

    /// Returns true if the camera stream is currently active.
    pub fn is_streaming(&self) -> bool {
        self.inner.as_ref().map_or(false, |c| c.is_stream_open())
    }
}

impl Drop for CameraCapture {
    fn drop(&mut self) {
        self.stop();
    }
}

