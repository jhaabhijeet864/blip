"""
Reappearance visual effect for Blip.
Smoothly fades live camera silhouette back into the empty room view.
"""

from __future__ import annotations

import cv2
import numpy as np

from blip.effects.base import BaseEffect


class ReappearEffect(BaseEffect):
    """
    Renders a smooth reverse materialization back into the frame.
    """

    def __init__(self, duration_frames: int = 20):
        super().__init__(name="Reappearance", duration_frames=duration_frames)

    def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
        p = self.progress
        if p >= 1.0:
            return frame

        # Progressive alpha blend of person silhouette
        alpha = p
        mask_3d = (mask * alpha)[:, :, None]
        rendered = (
            frame.astype(np.float32) * mask_3d + background.astype(np.float32) * (1.0 - mask_3d)
        ).astype(np.uint8)

        # Subtle shimmer ring around the returning person
        if p < 0.8:
            h, w, _ = frame.shape
            ring_alpha = 1.0 - (p / 0.8)
            overlay = rendered.copy()
            cv2.ellipse(
                overlay,
                (w // 2, h // 2),
                (int(w * 0.3 * p), int(h * 0.4 * p)),
                0,
                0,
                360,
                (200, 255, 255),
                3,
            )
            rendered = cv2.addWeighted(
                rendered, 1.0 - ring_alpha * 0.5, overlay, ring_alpha * 0.5, 0
            )

        return rendered
