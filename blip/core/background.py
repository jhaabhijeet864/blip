"""
Background plate calibration and lighting compensation manager.
Handles empty-room snapshotting, multi-frame noise averaging, and lighting matching.
"""

from __future__ import annotations

import time

import cv2
import numpy as np


class BackgroundManager:
    """
    Manages the reference background plate (empty room) used for seamless disappearance.
    """

    def __init__(self, target_frames: int = 15):
        self.target_frames = target_frames
        self.calibrating = False
        self.countdown_start_time: float | None = None
        self.countdown_duration: float = 3.0
        self.accumulated_frames: list[np.ndarray] = []
        self.plate: np.ndarray | None = None
        self._plate_float: np.ndarray | None = None

    def start_calibration(self, countdown_seconds: float = 3.0) -> None:
        """Begin calibration sequence with a countdown timer."""
        self.calibrating = True
        self.countdown_duration = countdown_seconds
        self.countdown_start_time = time.time()
        self.accumulated_frames.clear()

    @property
    def countdown_remaining(self) -> float:
        """Returns seconds remaining before frame capture begins."""
        if not self.calibrating or self.countdown_start_time is None:
            return 0.0
        elapsed = time.time() - self.countdown_start_time
        remaining = self.countdown_duration - elapsed
        return max(0.0, remaining)

    def is_calibrating(self) -> bool:
        """Returns True if countdown or frame accumulation is active."""
        return self.calibrating

    def has_plate(self) -> bool:
        """Returns True if a valid background plate has been captured."""
        return self.plate is not None

    def update(self, frame: np.ndarray) -> bool:
        """
        Process the incoming frame during calibration.
        Returns True when calibration completes on this frame.
        """
        if not self.calibrating or self.countdown_start_time is None:
            return False

        # If countdown is still running, wait for user to step out of frame
        if self.countdown_remaining > 0:
            return False

        # Accumulate frames for high-quality denoised average
        self.accumulated_frames.append(frame.astype(np.float32))

        if len(self.accumulated_frames) >= self.target_frames:
            # Compute average plate
            stacked = np.stack(self.accumulated_frames, axis=0)
            avg = np.mean(stacked, axis=0)
            self._plate_float = avg
            self.plate = np.clip(avg, 0, 255).astype(np.uint8)
            self.calibrating = False
            self.accumulated_frames.clear()
            return True

        return False

    def get_plate(
        self, current_frame: np.ndarray | None = None, match_lighting: bool = True
    ) -> np.ndarray:
        """
        Retrieve the current background plate.
        If current_frame is provided and match_lighting is True, adapts plate brightness
        to compensate for dynamic room lighting changes.
        """
        if self.plate is None:
            if current_frame is not None:
                # Fallback: heavily blur the current frame if no calibration done yet
                return cv2.GaussianBlur(current_frame, (51, 51), 0)
            # Black frame fallback
            return np.zeros((720, 1280, 3), dtype=np.uint8)

        if not match_lighting or current_frame is None:
            return self.plate

        # Quick lighting compensation via mean luminance matching in LAB space
        try:
            curr_lab = cv2.cvtColor(current_frame, cv2.COLOR_RGB2LAB)
            plate_lab = cv2.cvtColor(self.plate, cv2.COLOR_RGB2LAB)

            curr_l_mean = np.mean(curr_lab[:, :, 0])
            plate_l_mean = np.mean(plate_lab[:, :, 0])

            # Ratio bound between 0.7 and 1.3 to avoid extreme washouts
            ratio = np.clip(curr_l_mean / (plate_l_mean + 1e-5), 0.7, 1.3)

            adjusted_l = np.clip(plate_lab[:, :, 0].astype(np.float32) * ratio, 0, 255).astype(
                np.uint8
            )
            plate_lab[:, :, 0] = adjusted_l

            return cv2.cvtColor(plate_lab, cv2.COLOR_LAB2RGB)
        except Exception:
            return self.plate
