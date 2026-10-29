//! Video pipeline coordinator: thread-safe capture, dynamic hot-swapping, and sink distribution.

use crate::capture::{CameraCapture, CaptureConfig};
use crate::diagnostics::render_offline_frame;
use crate::vcam::VirtualCamSink;
use crate::BlipError;
use crossbeam_channel::{bounded, Receiver, Sender};
use image::RgbImage;
use parking_lot::RwLock;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

/// Coordinates video capture worker thread and distribution to virtual camera and preview canvas.
pub struct VideoPipeline {
    switch_tx: Sender<u32>,
    is_running: Arc<AtomicBool>,
    preview_slot: Arc<RwLock<Option<RgbImage>>>,
    worker_handle: Option<JoinHandle<()>>,
    pub active_camera_index: Arc<RwLock<u32>>,
}

impl VideoPipeline {
    /// Starts the background video capture pipeline.
    pub fn start(config: CaptureConfig) -> Result<Self, BlipError> {
        let (switch_tx, switch_rx) = bounded::<u32>(4);
        let is_running = Arc::new(AtomicBool::new(true));
        let is_running_clone = is_running.clone();

        let preview_slot = Arc::new(RwLock::new(None));
        let preview_slot_clone = preview_slot.clone();

        let active_camera_index = Arc::new(RwLock::new(config.camera_index));
        let active_camera_index_clone = active_camera_index.clone();

        let initial_config = config.clone();

        let worker_handle = thread::spawn(move || {
            Self::pipeline_worker_loop(
                initial_config,
                switch_rx,
                is_running_clone,
                preview_slot_clone,
                active_camera_index_clone,
            );
        });

        Ok(Self {
            switch_tx,
            is_running,
            preview_slot,
            worker_handle: Some(worker_handle),
            active_camera_index,
        })
    }

    /// Dynamically switches the active input camera without restarting the pipeline.
    pub fn switch_camera(&self, new_index: u32) -> Result<(), BlipError> {
        self.switch_tx
            .send(new_index)
            .map_err(|e| BlipError::CaptureError(format!("Failed to send camera switch: {e}")))?;
        Ok(())
    }

    /// Fetches a clone of the latest processed preview frame for UI rendering.
    pub fn get_latest_preview_frame(&self) -> Option<RgbImage> {
        self.preview_slot.read().clone()
    }

    /// Gracefully stops the video pipeline worker thread.
    pub fn stop(&mut self) {
        self.is_running.store(false, Ordering::SeqCst);
        if let Some(handle) = self.worker_handle.take() {
            let _ = handle.join();
        }
    }

    fn pipeline_worker_loop(
        mut config: CaptureConfig,
        switch_rx: Receiver<u32>,
        is_running: Arc<AtomicBool>,
        preview_slot: Arc<RwLock<Option<RgbImage>>>,
        active_camera_index: Arc<RwLock<u32>>,
    ) {
        // Set initial placeholder frame so UI stage is never empty
        *preview_slot.write() = Some(render_offline_frame(
            config.width,
            config.height,
            "Initializing",
            "Connecting to camera stream...",
        ));

        let mut capture: Option<CameraCapture> = CameraCapture::open(config.clone()).ok();
        let mut vcam: Option<VirtualCamSink> =
            VirtualCamSink::open(config.width, config.height, config.fps as f64).ok();

        let target_frame_duration = Duration::from_micros(1_000_000 / config.fps.max(1) as u64);

        while is_running.load(Ordering::SeqCst) {
            let loop_start = Instant::now();

            // Check for hot-swap camera request
            if let Ok(new_index) = switch_rx.try_recv() {
                if new_index != config.camera_index || capture.is_none() {
                    // Explicitly drop old capture handle to release MSMF locks
                    if let Some(mut old_cap) = capture.take() {
                        old_cap.stop();
                    }
                    thread::sleep(Duration::from_millis(50));

                    config.camera_index = new_index;
                    *active_camera_index.write() = new_index;

                    capture = CameraCapture::open(config.clone()).ok();
                }
            }

            // Grab frame from capture device or generate diagnostic card
            let frame = match capture.as_mut() {
                Some(cap) => cap.read_frame().unwrap_or_else(|_| {
                    render_offline_frame(
                        config.width,
                        config.height,
                        "Active Camera",
                        "Frame capture failed",
                    )
                }),
                None => render_offline_frame(
                    config.width,
                    config.height,
                    "Camera Offline",
                    "Device could not be opened",
                ),
            };

            // Stream to Virtual Camera if sink is active
            if let Some(vcam_sink) = vcam.as_mut() {
                let _ = vcam_sink.send_frame(&frame);
            }

            // Update preview slot
            *preview_slot.write() = Some(frame);

            // Regulate frame rate
            let elapsed = loop_start.elapsed();
            if elapsed < target_frame_duration {
                thread::sleep(target_frame_duration - elapsed);
            }
        }

        // Clean teardown on loop exit
        if let Some(mut cap) = capture.take() {
            cap.stop();
        }
        if let Some(mut sink) = vcam.take() {
            sink.close();
        }
    }
}

impl Drop for VideoPipeline {
    fn drop(&mut self) {
        self.stop();
    }
}
