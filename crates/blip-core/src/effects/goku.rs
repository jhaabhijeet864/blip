use glam::Vec2;
use image::RgbImage;
use rayon::prelude::*;

const GOKU_DURATION: f32 = 0.35;
const CHARGE_END: f32 = 0.12;
const FLASH_END: f32 = 0.18;

/// Animation phase of the Goku Instant Transmission effect.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GokuPhase {
    Idle,
    ChargingSpeedlines,
    FlashShockwave,
    VanishedDissipating,
    Completed,
}

/// Instant Transmission anime speedlines, exposure flash bloom, and vanish engine.
pub struct InstantTransmissionEffect {
    active: bool,
    elapsed: f32,
    origin: Vec2,
    num_speedlines: usize,
    speedline_angles: Vec<f32>,
}

impl Default for InstantTransmissionEffect {
    fn default() -> Self {
        Self::new()
    }
}

impl InstantTransmissionEffect {
    /// Create a new Instant Transmission effect engine.
    pub fn new() -> Self {
        let num_speedlines = 36;
        let mut speedline_angles = Vec::with_capacity(num_speedlines);
        for i in 0..num_speedlines {
            let angle = (i as f32 / num_speedlines as f32) * std::f32::consts::TAU;
            speedline_angles.push(angle);
        }

        Self {
            active: false,
            elapsed: 0.0,
            origin: Vec2::new(640.0, 360.0),
            num_speedlines,
            speedline_angles,
        }
    }

    /// Trigger the Instant Transmission sequence from a focal coordinate (e.g. forehead/temple).
    pub fn trigger(&mut self, focal_point: Vec2) {
        self.active = true;
        self.elapsed = 0.0;
        self.origin = focal_point;

        // Shuffle line angles slightly for dynamic variety
        for (i, angle) in self.speedline_angles.iter_mut().enumerate() {
            let base = (i as f32 / self.num_speedlines as f32) * std::f32::consts::TAU;
            let jitter = (((i * 17) % 7) as f32 - 3.0) * 0.03;
            *angle = base + jitter;
        }
    }

    /// Check if the effect is currently animating.
    pub fn is_active(&self) -> bool {
        self.active
    }

    /// Check if the subject has vanished from view.
    pub fn is_vanished(&self) -> bool {
        self.active && self.elapsed >= FLASH_END
    }

    /// Check if the entire effect sequence has completed.
    pub fn is_completed(&self) -> bool {
        !self.active || self.elapsed >= GOKU_DURATION
    }

    /// Current phase of the animation.
    pub fn current_phase(&self) -> GokuPhase {
        if !self.active {
            GokuPhase::Idle
        } else if self.elapsed < CHARGE_END {
            GokuPhase::ChargingSpeedlines
        } else if self.elapsed < FLASH_END {
            GokuPhase::FlashShockwave
        } else if self.elapsed < GOKU_DURATION {
            GokuPhase::VanishedDissipating
        } else {
            GokuPhase::Completed
        }
    }

    /// Advance effect timeline by delta time (seconds).
    pub fn step(&mut self, dt: f32) {
        if !self.active {
            return;
        }
        self.elapsed += dt;
        if self.elapsed >= GOKU_DURATION {
            // Sequence completed
        }
    }

    /// Reset effect back to idle.
    pub fn reset(&mut self) {
        self.active = false;
        self.elapsed = 0.0;
    }

    /// Render effect onto the target frame buffer.
    pub fn render(
        &self,
        target: &mut RgbImage,
        live_frame: &RgbImage,
        background: &RgbImage,
        mask: Option<&[u8]>,
    ) {
        if !self.active {
            target
                .as_flat_samples_mut()
                .samples
                .copy_from_slice(live_frame.as_flat_samples().samples);
            return;
        }

        let (width, height) = target.dimensions();
        let phase = self.current_phase();

        let target_raw = target.as_flat_samples_mut().samples;
        let live_raw = live_frame.as_flat_samples().samples;
        let bg_raw = background.as_flat_samples().samples;

        match phase {
            GokuPhase::ChargingSpeedlines => {
                // Copy live frame
                target_raw.copy_from_slice(live_raw);

                // Render high-contrast radial anime speedlines
                let progress = (self.elapsed / CHARGE_END).clamp(0.0, 1.0);
                let line_len_max = (width.max(height) as f32) * (0.4 + 0.6 * progress);
                let line_inner_radius = 40.0 + 30.0 * (1.0 - progress);

                for &angle in &self.speedline_angles {
                    let dir = Vec2::new(angle.cos(), angle.sin());
                    let p_start = self.origin + dir * line_inner_radius;
                    let p_end = self.origin + dir * line_len_max;

                    draw_line(
                        target_raw,
                        width,
                        height,
                        p_start.x as i32,
                        p_start.y as i32,
                        p_end.x as i32,
                        p_end.y as i32,
                        [220, 245, 255],
                        2,
                    );
                }
            }
            GokuPhase::FlashShockwave => {
                let flash_progress =
                    ((self.elapsed - CHARGE_END) / (FLASH_END - CHARGE_END)).clamp(0.0, 1.0);
                let flash_intensity = (1.0 - (flash_progress - 0.5).abs() * 2.0).clamp(0.0, 1.0);

                // Blend subject region toward bright whiteout bloom
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
                                let r = live_raw[pixel_idx] as f32;
                                let g = live_raw[pixel_idx + 1] as f32;
                                let b = live_raw[pixel_idx + 2] as f32;

                                row[out_idx] = (r + (255.0 - r) * flash_intensity) as u8;
                                row[out_idx + 1] = (g + (255.0 - g) * flash_intensity) as u8;
                                row[out_idx + 2] = (b + (255.0 - b) * flash_intensity) as u8;
                            } else {
                                row[out_idx] = live_raw[pixel_idx];
                                row[out_idx + 1] = live_raw[pixel_idx + 1];
                                row[out_idx + 2] = live_raw[pixel_idx + 2];
                            }
                        }
                    });

                // Draw expanding shockwave ring
                let shock_radius = 50.0 + flash_progress * 350.0;
                draw_shockwave_ring(
                    target_raw,
                    width,
                    height,
                    self.origin,
                    shock_radius,
                    12.0,
                    1.0,
                );
            }
            GokuPhase::VanishedDissipating | GokuPhase::Completed => {
                // Subject is completely vanished: show clean background plate
                target_raw.copy_from_slice(bg_raw);

                // Residual shockwave dissipating to edge of screen
                let vanish_progress =
                    ((self.elapsed - FLASH_END) / (GOKU_DURATION - FLASH_END)).clamp(0.0, 1.0);
                if vanish_progress < 1.0 {
                    let shock_radius = 400.0 + vanish_progress * 500.0;
                    let alpha = (1.0 - vanish_progress).clamp(0.0, 1.0);
                    draw_shockwave_ring(
                        target_raw,
                        width,
                        height,
                        self.origin,
                        shock_radius,
                        16.0,
                        alpha,
                    );
                }
            }
            GokuPhase::Idle => {
                target_raw.copy_from_slice(live_raw);
            }
        }
    }
}

/// Draw an anti-aliased Bresenham line for anime speedlines.
#[allow(clippy::too_many_arguments)]
fn draw_line(
    raw: &mut [u8],
    width: u32,
    height: u32,
    mut x0: i32,
    mut y0: i32,
    x1: i32,
    y1: i32,
    color: [u8; 3],
    thickness: i32,
) {
    let dx = (x1 - x0).abs();
    let sx = if x0 < x1 { 1 } else { -1 };
    let dy = -(y1 - y0).abs();
    let sy = if y0 < y1 { 1 } else { -1 };
    let mut err = dx + dy;

    loop {
        for tx in -thickness..=thickness {
            for ty in -thickness..=thickness {
                let px = x0 + tx;
                let py = y0 + ty;
                if px >= 0 && px < width as i32 && py >= 0 && py < height as i32 {
                    let idx = (py as u32 * width + px as u32) as usize * 3;
                    raw[idx] = color[0];
                    raw[idx + 1] = color[1];
                    raw[idx + 2] = color[2];
                }
            }
        }

        if x0 == x1 && y0 == y1 {
            break;
        }
        let e2 = 2 * err;
        if e2 >= dy {
            err += dy;
            x0 += sx;
        }
        if e2 <= dx {
            err += dx;
            y0 += sy;
        }
    }
}

/// Draw an expanding high-energy shockwave ring with soft falloff.
fn draw_shockwave_ring(
    raw: &mut [u8],
    width: u32,
    height: u32,
    center: Vec2,
    radius: f32,
    thickness: f32,
    alpha: f32,
) {
    let min_y = ((center.y - radius - thickness).max(0.0)) as u32;
    let max_y = ((center.y + radius + thickness).min((height - 1) as f32)) as u32;
    let min_x = ((center.x - radius - thickness).max(0.0)) as u32;
    let max_x = ((center.x + radius + thickness).min((width - 1) as f32)) as u32;

    let rad_sq_inner = (radius - thickness * 0.5).max(0.0).powi(2);
    let rad_sq_outer = (radius + thickness * 0.5).powi(2);

    for y in min_y..=max_y {
        let dy = y as f32 - center.y;
        let dy_sq = dy * dy;

        for x in min_x..=max_x {
            let dx = x as f32 - center.x;
            let dist_sq = dx * dx + dy_sq;

            if dist_sq >= rad_sq_inner && dist_sq <= rad_sq_outer {
                let dist = dist_sq.sqrt();
                let edge_dist = (dist - radius).abs();
                let ring_intensity = (1.0 - edge_dist / (thickness * 0.5)).clamp(0.0, 1.0) * alpha;

                let idx = (y * width + x) as usize * 3;
                let inv = 1.0 - ring_intensity;

                raw[idx] = (240.0 * ring_intensity + raw[idx] as f32 * inv) as u8;
                raw[idx + 1] = (250.0 * ring_intensity + raw[idx + 1] as f32 * inv) as u8;
                raw[idx + 2] = (255.0 * ring_intensity + raw[idx + 2] as f32 * inv) as u8;
            }
        }
    }
}
