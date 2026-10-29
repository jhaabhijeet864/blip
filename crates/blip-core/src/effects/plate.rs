use image::RgbImage;
use std::sync::Arc;

/// Calibration state for capturing an empty room clean background plate.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum CalibrationState {
    Uncalibrated,
    Countdown { remaining_secs: f32 },
    Sampling { frames_collected: usize },
    Ready,
}

/// Manages background plate capture, multi-frame noise filtering, and LAB luminance compensation.
pub struct CleanPlateManager {
    state: CalibrationState,
    plate: Option<Arc<RgbImage>>,
    sample_accumulator: Vec<u32>,
    samples_count: usize,
    target_samples: usize,
    baseline_luma: f32,
}

impl CleanPlateManager {
    /// Create a new CleanPlateManager.
    pub fn new() -> Self {
        Self {
            state: CalibrationState::Uncalibrated,
            plate: None,
            sample_accumulator: Vec::new(),
            samples_count: 0,
            target_samples: 10,
            baseline_luma: 128.0,
        }
    }

    /// Current calibration state.
    pub fn state(&self) -> CalibrationState {
        self.state
    }

    /// Check if a clean plate has been calibrated and is ready.
    pub fn is_ready(&self) -> bool {
        self.state == CalibrationState::Ready && self.plate.is_some()
    }

    /// Start a 3-second countdown to calibrate an empty room plate.
    pub fn start_countdown(&mut self) {
        self.state = CalibrationState::Countdown {
            remaining_secs: 3.0,
        };
        self.sample_accumulator.clear();
        self.samples_count = 0;
    }

    /// Advance countdown timer and ingest frame samples when ready.
    pub fn step(&mut self, dt: f32, live_frame: &RgbImage) {
        match self.state {
            CalibrationState::Countdown { remaining_secs } => {
                let next_remaining = remaining_secs - dt;
                if next_remaining <= 0.0 {
                    self.state = CalibrationState::Sampling {
                        frames_collected: 0,
                    };
                    let len = (live_frame.width() * live_frame.height() * 3) as usize;
                    self.sample_accumulator = vec![0u32; len];
                    self.samples_count = 0;
                } else {
                    self.state = CalibrationState::Countdown {
                        remaining_secs: next_remaining,
                    };
                }
            }
            CalibrationState::Sampling { .. } => {
                let (width, height) = live_frame.dimensions();
                let raw = live_frame.as_flat_samples().samples;

                if self.sample_accumulator.len() == raw.len() {
                    for (acc, &sample) in self.sample_accumulator.iter_mut().zip(raw.iter()) {
                        *acc += sample as u32;
                    }
                    self.samples_count += 1;
                    self.state = CalibrationState::Sampling {
                        frames_collected: self.samples_count,
                    };

                    if self.samples_count >= self.target_samples {
                        // Average accumulated samples into clean plate
                        let mut averaged = RgbImage::new(width, height);
                        let avg_raw = averaged.as_flat_samples_mut().samples;
                        for (out, &acc) in avg_raw.iter_mut().zip(self.sample_accumulator.iter()) {
                            *out = (acc / self.samples_count as u32) as u8;
                        }

                        self.baseline_luma = compute_average_luma(&averaged, None);
                        self.plate = Some(Arc::new(averaged));
                        self.state = CalibrationState::Ready;
                        self.sample_accumulator.clear();
                    }
                }
            }
            _ => {}
        }
    }

    /// Set a pre-existing clean plate directly.
    pub fn set_plate(&mut self, plate: RgbImage) {
        self.baseline_luma = compute_average_luma(&plate, None);
        self.plate = Some(Arc::new(plate));
        self.state = CalibrationState::Ready;
    }

    /// Get reference to clean plate if calibrated.
    pub fn get_plate(&self) -> Option<Arc<RgbImage>> {
        self.plate.clone()
    }

    /// Compensate clean plate for ambient luminance drift compared to live frame.
    pub fn get_compensated_plate(
        &self,
        live_frame: &RgbImage,
        mask: Option<&[u8]>,
    ) -> Option<RgbImage> {
        let plate = self.plate.as_ref()?;
        if self.baseline_luma <= 1.0 {
            return Some((**plate).clone());
        }

        // Compute current ambient luminance from peripheral non-subject pixels
        let live_luma = compute_average_luma(live_frame, mask);
        let scale = (live_luma / self.baseline_luma).clamp(0.65, 1.45);

        let (width, height) = plate.dimensions();
        let mut compensated = RgbImage::new(width, height);
        let out_raw = compensated.as_flat_samples_mut().samples;
        let plate_raw = plate.as_flat_samples().samples;

        for (out, &src) in out_raw.iter_mut().zip(plate_raw.iter()) {
            *out = ((src as f32) * scale).clamp(0.0, 255.0) as u8;
        }

        Some(compensated)
    }
}

/// Compute average luminance (Y in standard RGB -> YIQ/YUV) across background/peripheral pixels.
fn compute_average_luma(frame: &RgbImage, mask: Option<&[u8]>) -> f32 {
    let (width, height) = frame.dimensions();
    let raw = frame.as_flat_samples().samples;
    let mut total_luma = 0.0;
    let mut count = 0usize;

    let step = 8; // Downsample for fast <0.1ms computation
    for y in (0..height).step_by(step) {
        for x in (0..width).step_by(step) {
            let is_background = match mask {
                Some(m) => {
                    let idx = (y * width + x) as usize;
                    idx >= m.len() || m[idx] <= 100
                }
                None => true,
            };

            if is_background {
                let idx = (y * width + x) as usize * 3;
                let r = raw[idx] as f32;
                let g = raw[idx + 1] as f32;
                let b = raw[idx + 2] as f32;
                // Standard Rec. 601 luma formula
                let luma = 0.299 * r + 0.587 * g + 0.114 * b;
                total_luma += luma;
                count += 1;
            }
        }
    }

    if count > 0 {
        total_luma / (count as f32)
    } else {
        128.0
    }
}
