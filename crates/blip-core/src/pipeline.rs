//! Video pipeline coordinator: thread-safe capture, dynamic hot-swapping, and sink distribution.

use crate::capture::{CameraCapture, CaptureConfig};
use crate::diagnostics::render_offline_frame;
use crate::effects::goku::InstantTransmissionEffect;
use crate::effects::plate::{CalibrationState, CleanPlateManager};
use crate::effects::reappear::{ReappearEffect, ReappearMode};
use crate::effects::thanos::ThanosDisintegration;
use crate::effects::EffectState;
use crate::vcam::VirtualCamSink;
use crate::BlipError;
use crossbeam_channel::{bounded, Receiver, Sender};
use glam::Vec2;
use image::RgbImage;
use parking_lot::RwLock;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

/// Commands sent from the UI/controller to the pipeline worker thread.
#[derive(Debug, Clone)]
pub enum PipelineCommand {
    SwitchCamera(u32),
    TriggerThanosSnap,
    TriggerInstantTransmission,
    TriggerReappear,
    StartCalibration,
}

/// Coordinates video capture worker thread and distribution to virtual camera and preview canvas.
pub struct VideoPipeline {
    cmd_tx: Sender<PipelineCommand>,
    is_running: Arc<AtomicBool>,
    preview_slot: Arc<RwLock<Option<RgbImage>>>,
    worker_handle: Option<JoinHandle<()>>,
    pub active_camera_index: Arc<RwLock<u32>>,
    calibration_slot: Arc<RwLock<CalibrationState>>,
    effect_slot: Arc<RwLock<EffectState>>,
}

impl VideoPipeline {
    /// Starts the background video capture pipeline.
    pub fn start(config: CaptureConfig) -> Result<Self, BlipError> {
        let (cmd_tx, cmd_rx) = bounded::<PipelineCommand>(16);
        let is_running = Arc::new(AtomicBool::new(true));
        let is_running_clone = is_running.clone();

        let preview_slot = Arc::new(RwLock::new(None));
        let preview_slot_clone = preview_slot.clone();

        let active_camera_index = Arc::new(RwLock::new(config.camera_index));
        let active_camera_index_clone = active_camera_index.clone();

        let calibration_slot = Arc::new(RwLock::new(CalibrationState::Uncalibrated));
        let calibration_slot_clone = calibration_slot.clone();

        let effect_slot = Arc::new(RwLock::new(EffectState::Idle));
        let effect_slot_clone = effect_slot.clone();

        let initial_config = config.clone();

        let worker_handle = thread::spawn(move || {
            Self::pipeline_worker_loop(
                initial_config,
                cmd_rx,
                is_running_clone,
                preview_slot_clone,
                active_camera_index_clone,
                calibration_slot_clone,
                effect_slot_clone,
            );
        });

        Ok(Self {
            cmd_tx,
            is_running,
            preview_slot,
            worker_handle: Some(worker_handle),
            active_camera_index,
            calibration_slot,
            effect_slot,
        })
    }

    /// Dynamically switches the active input camera without restarting the pipeline.
    pub fn switch_camera(&self, new_index: u32) -> Result<(), BlipError> {
        self.cmd_tx
            .send(PipelineCommand::SwitchCamera(new_index))
            .map_err(|e| BlipError::CaptureError(format!("Failed to send camera switch: {e}")))?;
        Ok(())
    }

    /// Trigger the Thanos ash disintegration sequence.
    pub fn trigger_thanos_snap(&self) -> Result<(), BlipError> {
        self.cmd_tx
            .send(PipelineCommand::TriggerThanosSnap)
            .map_err(|e| BlipError::CaptureError(format!("Failed to trigger Thanos snap: {e}")))?;
        Ok(())
    }

    /// Trigger the Goku Instant Transmission speedline and flash vanish sequence.
    pub fn trigger_instant_transmission(&self) -> Result<(), BlipError> {
        self.cmd_tx
            .send(PipelineCommand::TriggerInstantTransmission)
            .map_err(|e| {
                BlipError::CaptureError(format!("Failed to trigger Instant Transmission: {e}"))
            })?;
        Ok(())
    }

    /// Trigger fluid reappearance restoring the live camera subject.
    pub fn trigger_reappear(&self) -> Result<(), BlipError> {
        self.cmd_tx
            .send(PipelineCommand::TriggerReappear)
            .map_err(|e| BlipError::CaptureError(format!("Failed to trigger reappear: {e}")))?;
        Ok(())
    }

    /// Start a 3-second countdown to calibrate the empty room clean plate.
    pub fn start_calibration(&self) -> Result<(), BlipError> {
        self.cmd_tx
            .send(PipelineCommand::StartCalibration)
            .map_err(|e| BlipError::CaptureError(format!("Failed to start calibration: {e}")))?;
        Ok(())
    }

    /// Get the current background plate calibration state.
    pub fn calibration_state(&self) -> CalibrationState {
        *self.calibration_slot.read()
    }

    /// Get the current visual effect state.
    pub fn effect_state(&self) -> EffectState {
        *self.effect_slot.read()
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
        cmd_rx: Receiver<PipelineCommand>,
        is_running: Arc<AtomicBool>,
        preview_slot: Arc<RwLock<Option<RgbImage>>>,
        active_camera_index: Arc<RwLock<u32>>,
        calibration_slot: Arc<RwLock<CalibrationState>>,
        effect_slot: Arc<RwLock<EffectState>>,
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

        let mut plate_manager = CleanPlateManager::new();
        let mut thanos = ThanosDisintegration::new();
        let mut goku = InstantTransmissionEffect::new();
        let mut reappear = ReappearEffect::new();

        let mut output_frame = RgbImage::new(config.width, config.height);
        let mut is_subject_vanished = false;

        let target_frame_duration = Duration::from_micros(1_000_000 / config.fps.max(1) as u64);
        let mut last_instant = Instant::now();

        while is_running.load(Ordering::SeqCst) {
            let loop_start = Instant::now();
            let dt = loop_start
                .duration_since(last_instant)
                .as_secs_f32()
                .min(0.1);
            last_instant = loop_start;

            // Handle incoming pipeline commands
            while let Ok(cmd) = cmd_rx.try_recv() {
                match cmd {
                    PipelineCommand::SwitchCamera(new_index) => {
                        if new_index != config.camera_index || capture.is_none() {
                            if let Some(mut old_cap) = capture.take() {
                                old_cap.stop();
                            }
                            thread::sleep(Duration::from_millis(50));

                            config.camera_index = new_index;
                            *active_camera_index.write() = new_index;

                            capture = CameraCapture::open(config.clone()).ok();
                        }
                    }
                    PipelineCommand::TriggerThanosSnap => {
                        thanos.trigger();
                        goku.reset();
                        reappear.reset();
                        is_subject_vanished = false;
                    }
                    PipelineCommand::TriggerInstantTransmission => {
                        let center_focal =
                            Vec2::new(config.width as f32 * 0.5, config.height as f32 * 0.3);
                        goku.trigger(center_focal);
                        thanos.reset();
                        reappear.reset();
                        is_subject_vanished = false;
                    }
                    PipelineCommand::TriggerReappear => {
                        reappear.trigger(ReappearMode::SmoothDissolve);
                        thanos.reset();
                        goku.reset();
                        is_subject_vanished = false;
                    }
                    PipelineCommand::StartCalibration => {
                        plate_manager.start_countdown();
                    }
                }
            }

            // Grab frame from capture device or generate diagnostic card
            let raw_frame = match capture.as_mut() {
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

            // Ensure frame resolution strictly conforms to pipeline target geometry
            let live_frame = if raw_frame.dimensions() != (config.width, config.height) {
                image::imageops::resize(
                    &raw_frame,
                    config.width,
                    config.height,
                    image::imageops::FilterType::Triangle,
                )
            } else {
                raw_frame
            };

            // Step clean plate calibration
            plate_manager.step(dt, &live_frame);
            *calibration_slot.write() = plate_manager.state();

            // Obtain clean background plate (compensated for room lighting)
            let background_plate = plate_manager
                .get_compensated_plate(&live_frame, None)
                .unwrap_or_else(|| live_frame.clone());

            // Process visual effects and compositing
            if thanos.is_active() {
                thanos.step(dt, None, &live_frame, config.width, config.height);
                thanos.render(&mut output_frame, &live_frame, &background_plate, None);

                if thanos.is_finished() {
                    is_subject_vanished = true;
                    *effect_slot.write() = EffectState::Vanished;
                } else {
                    *effect_slot.write() = EffectState::Disintegrating {
                        progress: thanos.progress(),
                    };
                }
            } else if goku.is_active() {
                goku.step(dt);
                goku.render(&mut output_frame, &live_frame, &background_plate, None);

                if goku.is_completed() {
                    is_subject_vanished = true;
                    *effect_slot.write() = EffectState::Vanished;
                } else if goku.is_vanished() {
                    is_subject_vanished = true;
                    *effect_slot.write() = EffectState::Vanished;
                } else {
                    *effect_slot.write() = EffectState::Disintegrating { progress: 0.5 };
                }
            } else if reappear.is_active() {
                reappear.step(dt);
                reappear.render(&mut output_frame, &live_frame, &background_plate, None);

                if reappear.is_finished() {
                    is_subject_vanished = false;
                    *effect_slot.write() = EffectState::Idle;
                } else {
                    *effect_slot.write() = EffectState::Reappearing { progress: 0.5 };
                }
            } else if is_subject_vanished {
                // Completely vanished: stream clean plate
                output_frame
                    .as_flat_samples_mut()
                    .samples
                    .copy_from_slice(background_plate.as_flat_samples().samples);
                *effect_slot.write() = EffectState::Vanished;
            } else {
                // Live camera stream
                output_frame
                    .as_flat_samples_mut()
                    .samples
                    .copy_from_slice(live_frame.as_flat_samples().samples);
                *effect_slot.write() = EffectState::Idle;
            }

            // Stream to Virtual Camera if sink is active
            if let Some(vcam_sink) = vcam.as_mut() {
                let _ = vcam_sink.send_frame(&output_frame);
            }

            // Update preview slot for Tauri frontend
            *preview_slot.write() = Some(output_frame.clone());

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
