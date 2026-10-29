"""
Goku Instant Transmission visual effect.
Renders anime radial speed lines, chromatic distortion, and a blinding teleport flash pop.
"""

from __future__ import annotations

import math

import cv2
import numpy as np

from blip.effects.base import BaseEffect


class InstantTransmissionEffect(BaseEffect):
    """
    Renders the iconic Dragon Ball Z teleport vanish:
    - Frames 1-7: Radial anime speedlines and chromatic vibration.
    - Frames 8-10: Blinding white/cyan flash explosion.
    - Frames 11+: User has vanished; leaves clean background plate.
    """

    def __init__(self, duration_frames: int = 18):
        super().__init__(name="Instant Transmission Vanish", duration_frames=duration_frames)
        self.center_x = 0
        self.center_y = 0
        self.num_speed_lines = 40
        self.speed_line_angles: np.ndarray | None = None

    def start(self, initial_frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> None:
        super().start(initial_frame, mask, background)
        h, w, _ = initial_frame.shape

        # Find center of mass of person
        person_pts = np.argwhere(mask > 0.4)
        if len(person_pts) > 0:
            self.center_y = int(np.mean(person_pts[:, 0]))
            self.center_x = int(np.mean(person_pts[:, 1]))
        else:
            self.center_x = w // 2
            self.center_y = h // 2

        self.speed_line_angles = np.random.uniform(0, 2 * math.pi, size=self.num_speed_lines)

    def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
        h, w, _ = frame.shape
        f = self.current_frame

        # Phase 3: Vanished (after frame 10)
        if f >= 11:
            return background

        # Phase 2: Blinding Teleport Flash (frames 8-10)
        if 8 <= f <= 10:
            flash_intensity = 1.0 - ((f - 8) * 0.35)
            # Create bright flash frame with electric cyan/white tint
            flash_overlay = np.full_like(background, (220, 255, 255), dtype=np.uint8)
            rendered = cv2.addWeighted(background, 1.0 - flash_intensity, flash_overlay, flash_intensity, 0)

            # Expanding shockwave circle
            radius = int((f - 7) * (w // 10))
            cv2.circle(rendered, (self.center_x, self.center_y), radius, (255, 255, 255), 6)
            cv2.circle(rendered, (self.center_x, self.center_y), radius + 4, (0, 255, 255), 2)
            return rendered

        # Phase 1: Charging anime speed lines & chromatic aberration (frames 1-7)
        # Apply chromatic aberration by shifting channels
        shift = int(f * 2)
        r = np.roll(frame[:, :, 0], shift, axis=1)
        g = frame[:, :, 1]
        b = np.roll(frame[:, :, 2], -shift, axis=1)
        chroma = np.stack([r, g, b], axis=2)

        # Blend person over background
        mask_3d = mask[:, :, None]
        rendered = (chroma.astype(np.float32) * mask_3d + background.astype(np.float32) * (1.0 - mask_3d)).astype(np.uint8)

        # Draw dynamic anime speed lines radiating outward
        if self.speed_line_angles is not None:
            max_len = int(math.hypot(w, h))
            line_color = (255, 255, 200)

            for angle in self.speed_line_angles:
                # Add slight angle jitter
                a = angle + np.random.uniform(-0.05, 0.05)
                inner_r = np.random.randint(60, 140)
                outer_r = inner_r + np.random.randint(100, max_len // 2)

                x1 = int(self.center_x + inner_r * math.cos(a))
                y1 = int(self.center_y + inner_r * math.sin(a))
                x2 = int(self.center_x + outer_r * math.cos(a))
                y2 = int(self.center_y + outer_r * math.sin(a))

                cv2.line(rendered, (x1, y1), (x2, y2), line_color, 2, cv2.LINE_AA)

        return rendered
