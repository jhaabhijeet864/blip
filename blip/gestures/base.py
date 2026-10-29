"""
Base abstractions for hand gesture recognition in Blip.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class Landmark3D:
    """Normalized 3D hand landmark coordinate."""
    x: float
    y: float
    z: float


@dataclass
class GestureResult:
    """Output of a gesture recognition evaluation."""
    gesture_name: str
    is_detected: bool
    confidence: float = 1.0
    metadata: dict | None = None


class BaseGesture(ABC):
    """Abstract base class for all hand gesture detectors."""

    def __init__(self, name: str, min_confidence: float = 0.75):
        self.name = name
        self.min_confidence = min_confidence

    @abstractmethod
    def detect(self, landmarks: list[Any], image_shape: tuple[int, int]) -> GestureResult:
        """
        Evaluate normalized hand landmarks.
        landmarks: List of 21 landmark objects with x, y, z attributes.
        image_shape: (height, width) of the video frame.
        """
