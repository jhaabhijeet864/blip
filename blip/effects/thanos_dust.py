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

    def __init__(self, duration_frames: int = 50, particle_count: int = 3000):
        super().__init__(name="Thanos Dust Dissolve", duration_frames=duration_frames)
        self.particle_count = particle_count

        # Particle state arrays
        self.particle_pos: np.ndarray | None = None  # (N, 2) [x, y] float32
        self.particle_vel: np.ndarray | None = None  # (N, 2) [vx, vy] float32
        self.particle_color: np.ndarray | None = None  # (N, 3) uint8 RGB
        self.particle_life: np.ndarray | None = None  # (N,) float32 [0.0 to 1.0]
        self.particle_size: np.ndarray | None = None  # (N,) int32
        self.noise_map: np.ndarray | None = None  # (H, W) float32 for organic erosion

    def start(self, initial_frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> None:
        super().start(initial_frame, mask, background)
        h, w, _ = initial_frame.shape

        # Generate smooth organic noise map for uneven silhouette erosion
        small_noise = np.random.rand(h // 8, w // 8).astype(np.float32)
        self.noise_map = cv2.resize(small_noise, (w, h), interpolation=cv2.INTER_CUBIC)

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
            self.particle_size = np.random.randint(1, 4, size=(count,), dtype=np.int32)
        else:
            self.particle_pos = None

    def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
        h, w, _ = frame.shape
        p = self.progress

        if p >= 1.0:
            return background

        # 1. Compute organic dissolve mask
        # Vertical gradient (top dissolves faster) + organic noise
        y_grad = np.linspace(0.0, 0.4, h, dtype=np.float32)[:, None]
        dissolve_threshold = p * 1.4

        if self.noise_map is not None:
            dissolve_field = (self.noise_map * 0.6) + y_grad
        else:
            dissolve_field = y_grad

        # Pixels where dissolve_field < threshold get dissolved into background
        dissolve_mask = np.clip(
            (mask - np.maximum(0.0, dissolve_field - (1.0 - dissolve_threshold))) * 2.0, 0.0, 1.0
        )
        dissolve_mask_3d = dissolve_mask[:, :, None]

        # Blend person with background plate
        rendered = (
            frame.astype(np.float32) * dissolve_mask_3d
            + background.astype(np.float32) * (1.0 - dissolve_mask_3d)
        ).astype(np.uint8)

        # 2. Update and render ash particles
        if self.particle_pos is not None and len(self.particle_pos) > 0:
            # Turbulence
            turbulence_x = np.random.uniform(-0.8, 0.8, size=self.particle_vel.shape[0]).astype(
                np.float32
            )
            self.particle_vel[:, 0] += turbulence_x * 0.1
            self.particle_pos += self.particle_vel

            # Fade particles to dark ash gray (60, 60, 60)
            self.particle_life -= 1.0 / float(self.duration_frames)
            ash_target = np.array([55.0, 50.0, 50.0], dtype=np.float32)

            for i in range(len(self.particle_pos)):
                life = self.particle_life[i]
                if life <= 0.0:
                    continue

                px, py = int(self.particle_pos[i, 0]), int(self.particle_pos[i, 1])
                if 0 <= px < w and 0 <= py < h:
                    rad = int(self.particle_size[i] * max(0.5, life))
                    # Color shifts to ash gray as it ages
                    c = (self.particle_color[i] * life + ash_target * (1.0 - life)).astype(int)
                    color = (int(c[0]), int(c[1]), int(c[2]))
                    cv2.circle(rendered, (px, py), max(1, rad), color, -1)

        return rendered
