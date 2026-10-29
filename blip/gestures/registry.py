"""
Gesture registry and evaluator for Blip.
Aggregates registered gesture detectors and evaluates landmarks across hands.
"""

from __future__ import annotations

from blip.gestures.base import BaseGesture
from blip.gestures.instant_transmission import InstantTransmissionGesture
from blip.gestures.snap import SnapGesture
from blip.vision.hand_tracker import HandLandmarkData


class GestureRegistry:
    """
    Registry holding active gesture detectors and evaluating input hands.
    """

    def __init__(self):
        self.detectors: dict[str, BaseGesture] = {}
        # Register the two viral flagships
        self.register(SnapGesture())
        self.register(InstantTransmissionGesture())

    def register(self, detector: BaseGesture) -> None:
        """Register a new gesture detector."""
        self.detectors[detector.name] = detector

    def evaluate(self, hands: list[HandLandmarkData], image_shape: tuple[int, int]) -> str | None:
        """
        Evaluate landmarks across all detected hands.
        Returns the name of the first detected gesture, or None.
        """
        for hand in hands:
            for name, detector in self.detectors.items():
                result = detector.detect(hand.landmarks, image_shape)
                if result.is_detected and result.confidence >= detector.min_confidence:
                    return name
        return None

    def reset_all(self) -> None:
        """Reset state in all detectors."""
        for detector in self.detectors.values():
            if hasattr(detector, "reset"):
                detector.reset()

    def is_snap_armed(self) -> bool:
        """Check if any hand is currently holding the snap pinch tension."""
        snap_det = self.detectors.get("snap")
        return bool(snap_det and getattr(snap_det, "is_pinched", False))
