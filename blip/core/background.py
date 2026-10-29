"""
Background plate calibration and lighting compensation manager.
Handles empty-room snapshotting, multi-frame noise averaging, disk persistence,
and intelligent inpainting fallback when uncalibrated.
"""

from __future__ import annotations

from pathlib import Path
import time

import cv2
import numpy as np


class BackgroundManager:
    """
    Manages the reference background plate (empty room) used for seamless disappearance.
    Persists calibrated plates to ~/.blip/background_plate.png across app sessions.
    Provides intelligent inpainting fallback when no calibrated plate is available.
    """

    def __init__(self, target_frames: int = 15, plate_dir: Path | None = None):
        self.target_frames = target_frames
        self.calibrating = False
        self.countdown_start_time: float | None = None
        self.countdown_duration: float = 3.0
        self.accumulated_frames: list[np.ndarray] = []
        self.plate: np.ndarray | None = None
        self._plate_float: np.ndarray | None = None

        # Directory for disk persistence
        if plate_dir is None:
            plate_dir = Path.home() / ".blip"
        self.plate_path = plate_dir / "background_plate.png"
        self._load_plate_from_disk()

    def _load_plate_from_disk(self) -> None:
        """Attempt to restore previously calibrated room plate from disk."""
        try:
            if self.plate_path.exists():
                bgr = cv2.imread(str(self.plate_path))
                if bgr is not None and bgr.size > 0:
                    self.plate = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
                    self._plate_float = self.plate.astype(np.float32)
        except Exception:
            self.plate = None

    def _save_plate_to_disk(self) -> None:
        """Persist calibrated room plate to disk for instant availability."""
        if self.plate is None:
            return
        try:
            self.plate_path.parent.mkdir(parents=True, exist_ok=True)
            bgr = cv2.cvtColor(self.plate, cv2.COLOR_RGB2BGR)
            cv2.imwrite(str(self.plate_path), bgr)
        except Exception:
            pass

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
        """Returns True if a valid background plate has been calibrated or loaded."""
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
            self._save_plate_to_disk()
            self.calibrating = False
            self.accumulated_frames.clear()
            return True

        return False

    def get_plate(
        self,
        current_frame: np.ndarray | None = None,
        mask: np.ndarray | None = None,
        match_lighting: bool = True,
    ) -> np.ndarray:
        """
        Retrieve the current background plate.
        If plate is calibrated and current_frame is provided, adapts brightness.
        If no plate is calibrated, uses fast downscaled inpainting behind user mask
        to completely erase presence rather than displaying a blurry ghost.
        """
        if self.plate is None:
            if current_frame is not None:
                # If silhouette mask is provided, inpaint behind the user
                if mask is not None:
                    try:
                        h, w, _ = current_frame.shape
                        small_w, small_h = 320, 180
                        small_f = cv2.resize(current_frame, (small_w, small_h))
                        mask_u8 = (mask * 255.0).astype(np.uint8) if mask.dtype != np.uint8 else mask
                        small_m = cv2.resize(
                            mask_u8, (small_w, small_h), interpolation=cv2.INTER_NEAREST
                        )
                        # Dilate slightly to erase edges and hair fringes
                        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
                        dilated = cv2.dilate(small_m, kernel, iterations=1)
                        inpainted_small = cv2.inpaint(small_f, dilated, 5, cv2.INPAINT_TELEA)
                        return cv2.resize(inpainted_small, (w, h))
                    except Exception:
                        pass
                return cv2.GaussianBlur(current_frame, (51, 51), 0)
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
