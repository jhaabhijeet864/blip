"""
Base abstractions for cinematic visual effects in Blip.
"""

from abc import ABC, abstractmethod

import numpy as np


class BaseEffect(ABC):
    """
    Abstract base class for all visual disappearance effects.
    Subclasses implement custom shader math, particle simulations, or pixel transformations.
    """

    def __init__(self, name: str, duration_frames: int = 45):
        self.name = name
        self.duration_frames = duration_frames
        self.current_frame = 0
        self.is_active = False

    def start(self, initial_frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> None:
        """
        Triggered when the effect is first activated.
        Subclasses can initialize particles, cache frames, or compute color palettes.
        """
        self.current_frame = 0
        self.is_active = True

    def stop(self) -> None:
        """Terminate the effect."""
        self.is_active = False
        self.current_frame = 0

    def update(self) -> None:
        """Advance animation frame."""
        if self.is_active:
            self.current_frame += 1

    @property
    def progress(self) -> float:
        """Return animation progress from 0.0 (start) to 1.0 (finished)."""
        if self.duration_frames <= 0:
            return 1.0
        return min(1.0, float(self.current_frame) / float(self.duration_frames))

    def is_finished(self) -> bool:
        """Returns True if the animation cycle has completed."""
        return self.current_frame >= self.duration_frames

    @abstractmethod
    def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
        """
        Apply effect onto the current frame.

        Args:
            frame: Live RGB frame (H, W, 3) uint8.
            mask: Soft segmentation alpha mask (H, W) float32 in range [0.0, 1.0],
                  where 1.0 represents person and 0.0 represents background.
            background: Clean room plate (H, W, 3) uint8.

        Returns:
            Rendered RGB frame (H, W, 3) uint8.
        """
