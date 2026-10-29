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
    1. Progressively dissolves the body silhouette from top to bottom with noise.
    2. Spawns thousands of ash particles sampled directly from the person's clothing and skin.
    3. Particles drift upward and diagonally with randomized wind turbulence.
    4. Seamlessly leaves only the clean empty background plate.
    """

    def __init__(self, duration_frames: int = 50, particle_count: int = 1500):
        super().__init__(name="Thanos Dust Dissolve", duration_frames=duration_frames)
        self.particle_count = particle_count

        # Particle state arrays
        self.particle_pos: np.ndarray | None = None  # (N, 2) [x, y] float32
        self.particle_vel: np.ndarray | None = None  # (N, 2) [vx, vy] float32
        self.particle_color: np.ndarray | None = None  # (N, 3) uint8 RGB
        self.particle_life: np.ndarray | None = None  # (N,) float32 [0.0 to 1.0]
        self.particle_size: np.ndarray | None = None  # (N,) int32
        self.noise_map: np.ndarray | None = None  # (H, W) float32 for organic erosion
        self.y_grad: np.ndarray | None = None
        self.ash_target = np.array([55.0, 50.0, 50.0], dtype=np.float32)

    def start(self, initial_frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> None:
        super().start(initial_frame, mask, background)
        h, w, _ = initial_frame.shape

        # Precompute gradient map, organic noise, and composite erosion field
        self.y_grad = np.linspace(0.0, 0.4, h, dtype=np.float32)[:, None]
        small_noise = np.random.rand(h // 8, w // 8).astype(np.float32)
        self.noise_map = cv2.resize(small_noise, (w, h), interpolation=cv2.INTER_CUBIC)
        field = (self.noise_map * 0.6) + self.y_grad
        self.dissolve_field_u8 = np.clip(field * 255.0, 0, 255).astype(np.uint8)

        # Find coordinates of person's silhouette
        person_indices = np.argwhere(mask > 0.4)  # (M, 2) [y, x]

        if len(person_indices) > 0:
            count = min(self.particle_count, len(person_indices))
            chosen = np.random.choice(len(person_indices), size=count, replace=False)
            sampled_coords = person_indices[chosen]  # (N, 2) [y, x]

            # [x, y] float positions
            self.particle_pos = np.column_stack(
                (sampled_coords[:, 1].astype(np.float32), sampled_coords[:, 0].astype(np.float32))
            )

            # Initial velocities: float upwards (negative vy) and drift to the right/wind
            vx = np.random.uniform(0.5, 4.0, size=(count,)).astype(np.float32)
            vy = np.random.uniform(-1.5, -6.5, size=(count,)).astype(np.float32)
            self.particle_vel = np.column_stack((vx, vy))

            # Sample colors from person's live frame
            colors = initial_frame[sampled_coords[:, 0], sampled_coords[:, 1]].astype(np.float32)
            self.particle_color = colors
            self.particle_life = np.ones((count,), dtype=np.float32)
            self.particle_size = np.random.randint(2, 5, size=(count,), dtype=np.int32)
        else:
            self.particle_pos = None

    def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
        h, w, _ = frame.shape
        p = self.progress

        if p >= 1.0:
            return background

        # 1. Compute organic dissolve mask using fast vectorized erosion
        thresh_offset = int(np.clip(p * 1.4, 0.0, 1.0) * 255.0)
        field_erosion = cv2.subtract(self.dissolve_field_u8, thresh_offset)
        mask_u8 = (mask * 255.0).astype(np.uint8) if mask.dtype != np.uint8 else mask
        dissolve_mask_u8 = cv2.subtract(mask_u8, field_erosion)

        # Fast 3-channel blend with cv2.multiply / add
        mask_3 = cv2.merge([dissolve_mask_u8, dissolve_mask_u8, dissolve_mask_u8])
        inv_mask_3 = cv2.bitwise_not(mask_3)
        fg = cv2.multiply(frame, mask_3, scale=1.0 / 255.0)
        bg = cv2.multiply(background, inv_mask_3, scale=1.0 / 255.0)
        rendered = cv2.add(fg, bg)

        # 2. Vectorized ash particle simulation and direct buffer drawing
        if self.particle_pos is not None and len(self.particle_pos) > 0:
            count = len(self.particle_pos)
            # Turbulence
            turbulence_x = np.random.uniform(-0.8, 0.8, size=count).astype(np.float32)
            self.particle_vel[:, 0] += turbulence_x * 0.1
            self.particle_pos += self.particle_vel

            # Decay life
            self.particle_life -= 1.0 / float(self.duration_frames)
            active = self.particle_life > 0.0

            px = self.particle_pos[:, 0].astype(np.int32)
            py = self.particle_pos[:, 1].astype(np.int32)
            valid = active & (px >= 1) & (px < w - 1) & (py >= 1) & (py < h - 1)

            if np.any(valid):
                l_v = self.particle_life[valid, None]
                c_v = (self.particle_color[valid] * l_v + self.ash_target * (1.0 - l_v)).astype(np.uint8)
                vx = px[valid]
                vy = py[valid]
                sz_v = (self.particle_size[valid] * np.maximum(0.5, self.particle_life[valid])).astype(np.int32)

                # Base particle
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
