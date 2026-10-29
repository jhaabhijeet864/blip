"""
Goku Instant Transmission gesture detector.
Recognizes index and middle fingers extended together toward the forehead/temple.
"""

from __future__ import annotations

from typing import Any

from blip.gestures.base import BaseGesture, GestureResult
from blip.gestures.snap import euclidean_dist
from blip.vision.hand_tracker import (
    INDEX_MCP,
    INDEX_PIP,
    INDEX_TIP,
    MIDDLE_MCP,
    MIDDLE_PIP,
    MIDDLE_TIP,
    PINKY_PIP,
    PINKY_TIP,
    RING_PIP,
    RING_TIP,
    WRIST,
)


class InstantTransmissionGesture(BaseGesture):
    """
    Detects Dragon Ball Z Instant Transmission pose:
    - Index and middle fingers extended straight upward in parallel.
    - Ring and pinky fingers folded tight into palm.
    - Hand raised near temple / upper frame area.
    """

    def __init__(self, min_confidence: float = 0.85):
        super().__init__(name="instant_transmission", min_confidence=min_confidence)
        self.consecutive_frames = 0
        self.REQUIRED_CONSECUTIVE_FRAMES = 3

    def reset(self) -> None:
        self.consecutive_frames = 0

    def detect(self, landmarks: list[Any], image_shape: tuple[int, int]) -> GestureResult:
        if len(landmarks) < 21:
            self.reset()
            return GestureResult(gesture_name=self.name, is_detected=False, confidence=0.0)

        wrist = landmarks[WRIST]
        hand_scale = euclidean_dist(wrist, landmarks[MIDDLE_MCP])
        if hand_scale < 1e-4:
            self.reset()
            return GestureResult(gesture_name=self.name, is_detected=False, confidence=0.0)

        # 1. Check if index & middle fingers are extended upward (tips higher/lower y than PIPs)
        index_up = landmarks[INDEX_TIP].y < landmarks[INDEX_PIP].y < landmarks[INDEX_MCP].y
        middle_up = landmarks[MIDDLE_TIP].y < landmarks[MIDDLE_PIP].y < landmarks[MIDDLE_MCP].y

        # 2. Check if ring & pinky are folded down
        ring_folded = landmarks[RING_TIP].y > landmarks[RING_PIP].y
        pinky_folded = landmarks[PINKY_TIP].y > landmarks[PINKY_PIP].y

        # 3. Check distance between index tip and middle tip (must be pressed close together)
        tips_dist = euclidean_dist(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]) / hand_scale
        fingers_together = tips_dist < 0.35

        # 4. Check hand position: raised in upper half of frame (near head level)
        hand_raised = landmarks[INDEX_TIP].y < 0.55

        is_pose = index_up and middle_up and ring_folded and pinky_folded and fingers_together and hand_raised

        if is_pose:
            self.consecutive_frames += 1
            if self.consecutive_frames >= self.REQUIRED_CONSECUTIVE_FRAMES:
                confidence = min(1.0, 0.85 + (self.consecutive_frames * 0.05))
                return GestureResult(
                    gesture_name=self.name,
                    is_detected=True,
                    confidence=confidence,
                    metadata={"frames": self.consecutive_frames}
                )
        else:
            self.consecutive_frames = 0

        return GestureResult(gesture_name=self.name, is_detected=False, confidence=0.0)
