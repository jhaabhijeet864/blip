use image::RgbImage;
use rayon::prelude::*;

const REAPPEAR_DURATION: f32 = 0.30;

/// Transition style for reappearing back onto the camera feed.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReappearMode {
    SmoothDissolve,
    ReverseFlash,
}

/// Fluid subject reappearance transition engine.
pub struct ReappearEffect {
    active: bool,
    elapsed: f32,
    duration: f32,
    mode: ReappearMode,
}

impl ReappearEffect {
    /// Create a new ReappearEffect engine.
    pub fn new() -> Self {
        Self {
            active: false,
            elapsed: 0.0,
            duration: REAPPEAR_DURATION,
            mode: ReappearMode::SmoothDissolve,
        }
    }

    /// Trigger a reappear transition sequence.
    pub fn trigger(&mut self, mode: ReappearMode) {
        self.active = true;
        self.elapsed = 0.0;
        self.mode = mode;
    }

    /// Check if reappear animation is currently running.
    pub fn is_active(&self) -> bool {
        self.active
    }

    /// Check if reappear animation has finished.
    pub fn is_finished(&self) -> bool {
        !self.active || self.elapsed >= self.duration
    }

    /// Advance transition timeline by delta time (seconds).
    pub fn step(&mut self, dt: f32) {
        if !self.active {
            return;
        }
        self.elapsed += dt;
        if self.elapsed >= self.duration {
            self.active = false;
        }
    }

    /// Reset effect.
    pub fn reset(&mut self) {
        self.active = false;
        self.elapsed = 0.0;
    }

    /// Render composite reappear frame: blends subject back into the background plate.
    pub fn render(
        &self,
        target: &mut RgbImage,
        live_frame: &RgbImage,
        background: &RgbImage,
        mask: Option<&[u8]>,
    ) {
        if !self.active {
            target.as_flat_samples_mut().samples.copy_from_slice(live_frame.as_flat_samples().samples);
            return;
        }

        let (width, _height) = target.dimensions();
        let target_raw = target.as_flat_samples_mut().samples;
        let live_raw = live_frame.as_flat_samples().samples;
        let bg_raw = background.as_flat_samples().samples;

        // Progress 0.0 -> 1.0
        let linear_t = (self.elapsed / self.duration).clamp(0.0, 1.0);
        // Cubic ease-out: 1 - (1 - t)^3
        let ease_t = 1.0 - (1.0 - linear_t).powi(3);

        match self.mode {
            ReappearMode::SmoothDissolve => {
                target_raw
                    .par_chunks_exact_mut(width as usize * 3)
                    .enumerate()
                    .for_each(|(y, row)| {
                        let row_offset = y * width as usize * 3;
                        for x in 0..width as usize {
                            let pixel_idx = row_offset + x * 3;
                            let out_idx = x * 3;

                            let is_subject = match mask {
                                Some(m) => {
                                    let m_idx = y * width as usize + x;
                                    m_idx < m.len() && m[m_idx] > 120
                                }
                                None => true,
                            };

                            if is_subject {
                                let live_r = live_raw[pixel_idx] as f32;
                                let live_g = live_raw[pixel_idx + 1] as f32;
                                let live_b = live_raw[pixel_idx + 2] as f32;

                                let bg_r = bg_raw[pixel_idx] as f32;
                                let bg_g = bg_raw[pixel_idx + 1] as f32;
                                let bg_b = bg_raw[pixel_idx + 2] as f32;

                                row[out_idx] = (bg_r + (live_r - bg_r) * ease_t) as u8;
                                row[out_idx + 1] = (bg_g + (live_g - bg_g) * ease_t) as u8;
                                row[out_idx + 2] = (bg_b + (live_b - bg_b) * ease_t) as u8;
                            } else {
                                row[out_idx] = live_raw[pixel_idx];
                                row[out_idx + 1] = live_raw[pixel_idx + 1];
                                row[out_idx + 2] = live_raw[pixel_idx + 2];
                            }
                        }
                    });
            }
            ReappearMode::ReverseFlash => {
                let flash_intensity = if linear_t < 0.4 {
                    linear_t / 0.4
                } else {
                    (1.0 - linear_t) / 0.6
                };

                target_raw
                    .par_chunks_exact_mut(width as usize * 3)
                    .enumerate()
                    .for_each(|(y, row)| {
                        let row_offset = y * width as usize * 3;
                        for x in 0..width as usize {
                            let pixel_idx = row_offset + x * 3;
                            let out_idx = x * 3;

                            let is_subject = match mask {
                                Some(m) => {
                                    let m_idx = y * width as usize + x;
                                    m_idx < m.len() && m[m_idx] > 120
                                }
                                None => true,
                            };

                            if is_subject {
                                let base_r = if linear_t < 0.4 { bg_raw[pixel_idx] } else { live_raw[pixel_idx] } as f32;
                                let base_g = if linear_t < 0.4 { bg_raw[pixel_idx + 1] } else { live_raw[pixel_idx + 1] } as f32;
                                let base_b = if linear_t < 0.4 { bg_raw[pixel_idx + 2] } else { live_raw[pixel_idx + 2] } as f32;

                                row[out_idx] = (base_r + (255.0 - base_r) * flash_intensity) as u8;
                                row[out_idx + 1] = (base_g + (255.0 - base_g) * flash_intensity) as u8;
                                row[out_idx + 2] = (base_b + (255.0 - base_b) * flash_intensity) as u8;
                            } else {
                                row[out_idx] = live_raw[pixel_idx];
                                row[out_idx + 1] = live_raw[pixel_idx + 1];
                                row[out_idx + 2] = live_raw[pixel_idx + 2];
                            }
                        }
                    });
            }
        }
    }
}
