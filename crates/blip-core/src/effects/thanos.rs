use glam::Vec2;
use image::RgbImage;
use rayon::prelude::*;

const MAX_PARTICLES: usize = 3500;
const DEFAULT_DURATION: f32 = 1.8;

/// Single ash particle in the disintegration simulation.
#[derive(Debug, Clone, Copy)]
pub struct Particle {
    pub pos: Vec2,
    pub vel: Vec2,
    pub color: [u8; 3],
    pub alpha: f32,
    pub size: f32,
    pub life: f32,
    pub max_life: f32,
    pub active: bool,
}

impl Default for Particle {
    fn default() -> Self {
        Self {
            pos: Vec2::ZERO,
            vel: Vec2::ZERO,
            color: [0, 0, 0],
            alpha: 0.0,
            size: 2.0,
            life: 0.0,
            max_life: 1.0,
            active: false,
        }
    }
}

/// Thanos finger snap ash disintegration engine.
pub struct ThanosDisintegration {
    particles: Vec<Particle>,
    progress: f32,
    duration: f32,
    active: bool,
    seed: f32,
    spawn_cursor: usize,
}

impl Default for ThanosDisintegration {
    fn default() -> Self {
        Self::new()
    }
}

impl ThanosDisintegration {
    /// Create a new pre-allocated particle pool.
    pub fn new() -> Self {
        let mut particles = Vec::with_capacity(MAX_PARTICLES);
        particles.resize_with(MAX_PARTICLES, Particle::default);
        Self {
            particles,
            progress: 0.0,
            duration: DEFAULT_DURATION,
            active: false,
            seed: 0.0,
            spawn_cursor: 0,
        }
    }

    /// Trigger a new disintegration animation sequence.
    pub fn trigger(&mut self) {
        self.progress = 0.0;
        self.active = true;
        self.spawn_cursor = 0;
        self.seed += 13.37;
        for p in &mut self.particles {
            p.active = false;
        }
    }

    /// Check if the disintegration animation is currently active.
    pub fn is_active(&self) -> bool {
        self.active
    }

    /// Check if the disintegration has finished (progress >= 1.0 and all particles dead).
    pub fn is_finished(&self) -> bool {
        !self.active || (self.progress >= 1.0 && self.active_particle_count() == 0)
    }

    /// Current progress of the erosion front from 0.0 to 1.0.
    pub fn progress(&self) -> f32 {
        self.progress
    }

    /// Number of active particles currently simulated.
    pub fn active_particle_count(&self) -> usize {
        self.particles.iter().filter(|p| p.active).count()
    }

    /// Reset disintegration state.
    pub fn reset(&mut self) {
        self.active = false;
        self.progress = 0.0;
        for p in &mut self.particles {
            p.active = false;
        }
    }

    /// Advance particle physics and emit new particles along the erosion line.
    pub fn step(
        &mut self,
        dt: f32,
        mask: Option<&[u8]>,
        frame: &RgbImage,
        width: u32,
        height: u32,
    ) {
        if !self.active {
            return;
        }

        self.progress = (self.progress + dt / self.duration).min(1.0);

        // Vertical erosion line sweeps upwards from bottom (height) to top (0)
        let erosion_y = height as f32 * (1.0 - self.progress);
        let band_height = (height as f32 * 0.06).max(6.0);

        // Spawn particles in the active erosion band
        if self.progress < 1.0 && width > 0 && height > 0 {
            let y_start = (erosion_y - band_height).max(0.0) as u32;
            let y_end = erosion_y.min((height - 1) as f32) as u32;

            let step_x = 4.max(width / 160);
            let step_y = 3.max((y_end - y_start) / 10);

            for y in (y_start..=y_end).step_by(step_y as usize) {
                for x in (0..width).step_by(step_x as usize) {
                    let is_subject = match mask {
                        Some(m) => {
                            let idx = (y * width + x) as usize;
                            idx < m.len() && m[idx] > 120
                        }
                        None => true,
                    };

                    if is_subject {
                        let p = &mut self.particles[self.spawn_cursor];
                        if !p.active {
                            let px = frame.get_pixel(x, y);
                            p.pos = Vec2::new(x as f32, y as f32);
                            p.color = px.0;
                            p.alpha = 1.0;
                            p.size = 2.5 + ((x + y) % 3) as f32;
                            p.life = 0.0;
                            p.max_life = 0.8 + (((x * 13 + y * 7) % 10) as f32) * 0.08;
                            // Initial upward burst with random horizontal dispersion
                            let disperse_x = (((x % 11) as f32) - 5.0) * 12.0;
                            p.vel = Vec2::new(disperse_x, -50.0 - (((y % 7) as f32) * 15.0));
                            p.active = true;

                            self.spawn_cursor = (self.spawn_cursor + 1) % MAX_PARTICLES;
                        }
                    }
                }
            }
        }

        // Parallel SIMD particle physics update via Rayon
        let seed = self.seed;
        self.particles.par_iter_mut().for_each(|p| {
            if !p.active {
                return;
            }

            // Pseudo-curl noise field: sin(y) and cos(x) turbulence
            let curl_x = ((p.pos.y * 0.025 + seed).sin() * 45.0) + ((p.pos.x * 0.01).cos() * 15.0);
            let curl_y = -95.0 + ((p.pos.x * 0.02 + seed).cos() * 25.0);

            p.vel.x += curl_x * dt;
            p.vel.y += curl_y * dt;

            // Fluid drag damping
            p.vel *= (1.0 - 0.08 * dt).clamp(0.85, 0.99);
            p.pos += p.vel * dt;

            p.life += dt;
            if p.life >= p.max_life {
                p.active = false;
                p.alpha = 0.0;
            } else {
                p.alpha = (1.0 - p.life / p.max_life).clamp(0.0, 1.0);
                p.size = (p.size * (1.0 - dt * 0.5)).max(1.0);
            }
        });
    }

    /// Render composite frame: remaining subject + background plate + active ash particles.
    pub fn render(
        &self,
        target: &mut RgbImage,
        live_frame: &RgbImage,
        background: &RgbImage,
        mask: Option<&[u8]>,
    ) {
        let (width, height) = target.dimensions();
        let erosion_y = height as f32 * (1.0 - self.progress);

        let target_raw = target.as_flat_samples_mut().samples;
        let live_raw = live_frame.as_flat_samples().samples;
        let bg_raw = background.as_flat_samples().samples;

        // 1. Base compositing: subject above erosion line, background below erosion line
        target_raw
            .par_chunks_exact_mut(width as usize * 3)
            .enumerate()
            .for_each(|(y, row)| {
                let y_f32 = y as f32;
                let is_eroded = y_f32 >= erosion_y;
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

                    if is_subject && is_eroded {
                        // Eroded away: reveal clean background plate
                        row[out_idx] = bg_raw[pixel_idx];
                        row[out_idx + 1] = bg_raw[pixel_idx + 1];
                        row[out_idx + 2] = bg_raw[pixel_idx + 2];
                    } else if is_subject && !is_eroded {
                        // Still intact subject: show live frame
                        row[out_idx] = live_raw[pixel_idx];
                        row[out_idx + 1] = live_raw[pixel_idx + 1];
                        row[out_idx + 2] = live_raw[pixel_idx + 2];
                    } else {
                        // Peripheral background: show live or background
                        row[out_idx] = live_raw[pixel_idx];
                        row[out_idx + 1] = live_raw[pixel_idx + 1];
                        row[out_idx + 2] = live_raw[pixel_idx + 2];
                    }
                }
            });

        // 2. Draw active ash particles on top with alpha blending
        for p in &self.particles {
            if !p.active || p.alpha <= 0.05 {
                continue;
            }

            let px = p.pos.x as i32;
            let py = p.pos.y as i32;
            let radius = (p.size * 0.5).round() as i32;
            let alpha = p.alpha;
            let inv_alpha = 1.0 - alpha;

            for dy in -radius..=radius {
                for dx in -radius..=radius {
                    let cx = px + dx;
                    let cy = py + dy;

                    if cx >= 0 && cx < width as i32 && cy >= 0 && cy < height as i32 {
                        let idx = (cy as u32 * width + cx as u32) as usize * 3;
                        let r =
                            (p.color[0] as f32 * alpha + target_raw[idx] as f32 * inv_alpha) as u8;
                        let g = (p.color[1] as f32 * alpha + target_raw[idx + 1] as f32 * inv_alpha)
                            as u8;
                        let b = (p.color[2] as f32 * alpha + target_raw[idx + 2] as f32 * inv_alpha)
                            as u8;

                        target_raw[idx] = r;
                        target_raw[idx + 1] = g;
                        target_raw[idx + 2] = b;
                    }
                }
            }
        }
    }
}
