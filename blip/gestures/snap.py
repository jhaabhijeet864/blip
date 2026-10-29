"""
Thanos finger snap gesture detector.
Tracks thumb-to-middle fingertip contact followed by an explosive velocity release.
"""

from __future__ import annotations

import math
import time
from collections import deque
from typing import Any

from blip.gestures.base import BaseGesture, GestureResult
from blip.vision.hand_tracker import (
    MIDDLE_TIP,
    THUMB_TIP,
    WRIST,
)


def euclidean_dist(p1, p2) -> float:
    """Calculate 3D Euclidean distance between two landmarks."""
    dx = p1.x - p2.x
    dy = p1.y - p2.y
    dz = getattr(p1, 'z', 0.0) - getattr(p2, 'z', 0.0)
    return math.sqrt(dx * dx + dy * dy + dz * dz)


class SnapGesture(BaseGesture):
    """
    Detects the classic finger snap by analyzing thumb-middle finger contact phase
    followed by rapid flick velocity into the palm.
    """

    def __init__(self, min_confidence: float = 0.8):
        super().__init__(name="snap", min_confidence=min_confidence)
        # History of thumb-to-middle distances: (timestamp, distance)
        self.history: deque[tuple[float, float]] = deque(maxlen=10)
        self.is_pinched = False
        self.pinch_start_time: float = 0.0

    def reset(self) -> None:
        """Reset internal history."""
        self.history.clear()
        self.is_pinched = False
        self.pinch_start_time = 0.0

    def detect(self, landmarks: list[Any], image_shape: tuple[int, int]) -> GestureResult:
        if len(landmarks) < 21:
            return GestureResult(gesture_name=self.name, is_detected=False, confidence=0.0)

        now = time.time()
        thumb_tip = landmarks[THUMB_TIP]
        middle_tip = landmarks[MIDDLE_TIP]
        wrist = landmarks[WRIST]

        # Normalization factor: hand span from wrist to middle knuckle
        hand_scale = euclidean_dist(wrist, landmarks[9])
        if hand_scale < 1e-4:
            return GestureResult(gesture_name=self.name, is_detected=False, confidence=0.0)

        # Normalized distance between thumb and middle fingertip
        dist = euclidean_dist(thumb_tip, middle_tip) / hand_scale
        self.history.append((now, dist))

        # Thresholds scaled to hand size
        PINCH_THRESHOLD = 0.32
        RELEASE_THRESHOLD = 0.65

        # Check if thumb and middle finger are currently in contact (pinched)
        if dist < PINCH_THRESHOLD:
            if not self.is_pinched:
                self.is_pinched = True
                self.pinch_start_time = now
            return GestureResult(gesture_name=self.name, is_detected=False, confidence=0.5)

        # If we were previously pinched and now distance exploded within 600ms
        if self.is_pinched and (now - self.pinch_start_time) < 0.6:
            # Check velocity of release in recent history
            if len(self.history) >= 2:
                prev_time, prev_dist = self.history[0]
                dt = max(1e-4, now - prev_time)
                velocity = (dist - prev_dist) / dt

                if dist > RELEASE_THRESHOLD and velocity > 1.5:
                    self.reset()
                    return GestureResult(
                        gesture_name=self.name,
                        is_detected=True,
                        confidence=0.92,
                        metadata={"velocity": velocity, "dist": dist}
                    )

        # If too much time has passed without release, reset pinch state
        if self.is_pinched and (now - self.pinch_start_time) >= 0.6:
            self.is_pinched = False

        return GestureResult(gesture_name=self.name, is_detected=False, confidence=0.0)
