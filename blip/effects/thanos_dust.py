"""
Thanos Finger Snap ash disintegration visual effect.
Decomposes user silhouette into thousands of wind-blown particles drifting into the empty room.
"""

from __future__ import annotations

import cv2
import numpy as np

from blip.effects.base import BaseEffect


class ThanosSnapEffect(BaseEffect):
    """
    Renders the Avengers Thanos Snap disintegration effect:
    1. Organically dissolves the user's silhouette from head to toe using SIMD-accelerated noise erosion.
    2. Synchronously peels thousands of ash particles directly off the disintegrating surface.
    3. Particles drift upward and diagonally with wind turbulence, transitioning from ember to ash.
    4. By 80% progress, the user's presence is 100% erased, leaving only the clean background room plate.
    """

    def __init__(self, duration_frames: int = 50, particle_count: int = 1500):
        super().__init__(name="Thanos Dust Dissolve", duration_frames=duration_frames)
        self.particle_count = particle_count

        # Particle state arrays
        self.particle_pos: np.ndarray | None = None  # (N, 2) [x, y] float32
        self.particle_vel: np.ndarray | None = None  # (N, 2) [vx, vy] float32
        self.particle_color: np.ndarray | None = None  # (N, 3) float32 RGB
        self.particle_life: np.ndarray | None = None  # (N,) float32 [0.0 to 1.0]
        self.particle_size: np.ndarray | None = None  # (N,) int32
        self.particle_release_p: np.ndarray | None = None  # (N,) float32 [0.0 to 0.78]
        self.dissolve_field_u8: np.ndarray | None = None  # (H, W) uint8 for organic erosion
        self.ash_target = np.array([55.0, 50.0, 50.0], dtype=np.float32)
        self.ember_target = np.array([255.0, 130.0, 30.0], dtype=np.float32)

    def start(self, initial_frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> None:
        super().start(initial_frame, mask, background)
        h, w, _ = initial_frame.shape

        # Precompute gradient map, organic noise, and normalized erosion field
        y_grad = np.linspace(0.0, 0.45, h, dtype=np.float32)[:, None]
        small_noise = np.random.rand(max(1, h // 8), max(1, w // 8)).astype(np.float32)
        noise_map = cv2.resize(small_noise, (w, h), interpolation=cv2.INTER_CUBIC)
        raw_field = (noise_map * 0.55) + y_grad
        min_v, max_v = float(raw_field.min()), float(raw_field.max())
        norm_field = (raw_field - min_v) / max(1e-4, max_v - min_v)
        self.dissolve_field_u8 = np.clip(norm_field * 255.0, 0, 255).astype(np.uint8)

        # Find coordinates of person's silhouette
        mask_f = mask if mask.dtype == np.float32 else (mask.astype(np.float32) / 255.0)
        person_indices = np.argwhere(mask_f > 0.35)  # (M, 2) [y, x]

        if len(person_indices) > 0:
            count = min(self.particle_count, len(person_indices))
            chosen = np.random.choice(len(person_indices), size=count, replace=False)
            sampled_coords = person_indices[chosen]  # (N, 2) [y, x]

            px = sampled_coords[:, 1].astype(np.float32)
            py = sampled_coords[:, 0].astype(np.float32)
            self.particle_pos = np.column_stack((px, py))

            # Initial velocities: float upwards (negative vy) and drift to the right/wind
            vx = np.random.uniform(0.5, 4.0, size=(count,)).astype(np.float32)
            vy = np.random.uniform(-1.5, -6.0, size=(count,)).astype(np.float32)
            self.particle_vel = np.column_stack((vx, vy))

            # Sample colors from person's live frame
            self.particle_color = initial_frame[sampled_coords[:, 0], sampled_coords[:, 1]].astype(
                np.float32
            )
            self.particle_life = np.ones((count,), dtype=np.float32)
            self.particle_size = np.random.randint(2, 5, size=(count,), dtype=np.int32)

            # Schedule particle release at the exact moment its coordinate erodes
            field_values = self.dissolve_field_u8[sampled_coords[:, 0], sampled_coords[:, 1]]
            self.particle_release_p = (field_values.astype(np.float32) / 255.0) * 0.78
        else:
            self.particle_pos = None

    def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
        h, w, _ = frame.shape
        p = self.progress

        if p >= 1.0:
            return background

        # 1. Compute organic dissolve mask using SIMD bitwise operations
        # By p = 0.80, the person is completely erased (0% visibility)
        if p >= 0.80:
            rendered = background.copy()
        else:
            thresh_u8 = int(min(1.0, p / 0.80) * 255.0)
            _, body_visible_u8 = cv2.threshold(
                self.dissolve_field_u8, thresh_u8, 255, cv2.THRESH_BINARY
            )

            mask_u8 = (mask * 255.0).astype(np.uint8) if mask.dtype != np.uint8 else mask
            fg_mask_u8 = cv2.bitwise_and(body_visible_u8, mask_u8)
            inv_fg_mask_u8 = cv2.bitwise_not(fg_mask_u8)

            fg = cv2.bitwise_and(frame, frame, mask=fg_mask_u8)
            bg_part = cv2.bitwise_and(background, background, mask=inv_fg_mask_u8)
            rendered = cv2.add(fg, bg_part)

        # 2. Vectorized peeling ash particle simulation and buffer drawing
        if self.particle_pos is not None and len(self.particle_pos) > 0:
            count = len(self.particle_pos)

            # Only update particles whose release threshold has arrived
            released = p >= self.particle_release_p

            if np.any(released):
                # Turbulence on released particles
                turb_x = np.random.uniform(-0.6, 0.6, size=count).astype(np.float32)
                self.particle_vel[released, 0] += turb_x[released] * 0.12
                self.particle_pos[released] += self.particle_vel[released]

                # Decay life on released particles
                decay_rate = 1.0 / (float(self.duration_frames) * 0.55)
                self.particle_life[released] -= decay_rate

                active = released & (self.particle_life > 0.0)
                px = self.particle_pos[:, 0].astype(np.int32)
                py = self.particle_pos[:, 1].astype(np.int32)
                valid = active & (px >= 1) & (px < w - 1) & (py >= 1) & (py < h - 1)

                if np.any(valid):
                    l_v = self.particle_life[valid, None]
                    orig_c = self.particle_color[valid]

                    # Transition: birth ember glow -> original cloth/skin color -> ash grey
                    ember_factor = np.clip((l_v - 0.70) / 0.30, 0.0, 1.0)
                    ash_factor = 1.0 - l_v

                    colored = orig_c * (1.0 - ember_factor) + self.ember_target * ember_factor
                    c_v = np.clip(
                        colored * (1.0 - ash_factor) + self.ash_target * ash_factor, 0, 255
                    ).astype(np.uint8)

                    vx = px[valid]
                    vy = py[valid]
                    sz_v = (
                        self.particle_size[valid] * np.maximum(0.5, self.particle_life[valid])
                    ).astype(np.int32)

                    # Base particle point
                    rendered[vy, vx] = c_v

                    # Radius >= 2: cross pattern (adjacent pixels)
                    r2 = sz_v >= 2
                    if np.any(r2):
                        r2_x, r2_y, r2_c = vx[r2], vy[r2], c_v[r2]
                        rendered[r2_y - 1, r2_x] = r2_c
                        rendered[r2_y + 1, r2_x] = r2_c
                        rendered[r2_y, r2_x - 1] = r2_c
                        rendered[r2_y, r2_x + 1] = r2_c

                    # Radius >= 3: diagonal corners for fuller ash volume
                    r3 = sz_v >= 3
                    if np.any(r3):
                        r3_x, r3_y, r3_c = vx[r3], vy[r3], c_v[r3]
                        rendered[r3_y - 1, r3_x - 1] = r3_c
                        rendered[r3_y - 1, r3_x + 1] = r3_c
                        rendered[r3_y + 1, r3_x - 1] = r3_c
                        rendered[r3_y + 1, r3_x + 1] = r3_c

        return rendered
