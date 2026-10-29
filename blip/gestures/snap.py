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
    INDEX_TIP,
    MIDDLE_MCP,
    MIDDLE_TIP,
    THUMB_TIP,
    WRIST,
)


def euclidean_dist(p1, p2) -> float:
    """Calculate 3D Euclidean distance between two landmarks."""
    dx = p1.x - p2.x
    dy = p1.y - p2.y
    dz = getattr(p1, "z", 0.0) - getattr(p2, "z", 0.0)
    return math.sqrt(dx * dx + dy * dy + dz * dz)


class SnapGesture(BaseGesture):
    """
    Precision two-phase finger snap gesture detector:
    Phase 1 (Tension/Loading): Thumb pad and middle fingertip press together (pinched).
            Index finger is excluded to prevent false positives from 'OK' gestures.
    Phase 2 (Snap/Strike): Rapid flick velocity where middle finger strikes down
            into the palm / releases away from thumb within 1-3 frames.
    """

    def __init__(self, min_confidence: float = 0.85):
        super().__init__(name="snap", min_confidence=min_confidence)
        # History stores tuples of (timestamp, thumb_middle_dist, wrist_x, wrist_y)
        self.history: deque[tuple[float, float, float, float]] = deque(maxlen=6)
        self.is_pinched: bool = False
        self.pinch_start_time: float = 0.0

    def reset(self) -> None:
        """Reset internal detector state."""
        self.history.clear()
        self.is_pinched = False
        self.pinch_start_time = 0.0

    def detect(self, landmarks: list[Any], image_shape: tuple[int, int]) -> GestureResult:
        if len(landmarks) < 21:
            self.reset()
            return GestureResult(gesture_name=self.name, is_detected=False, confidence=0.0)

        now = time.time()
        wrist = landmarks[WRIST]
        thumb_tip = landmarks[THUMB_TIP]
        middle_tip = landmarks[MIDDLE_TIP]
        index_tip = landmarks[INDEX_TIP]
        middle_mcp = landmarks[MIDDLE_MCP]

        # Normalization factor: hand span from wrist to middle knuckle
        hand_scale = euclidean_dist(wrist, middle_mcp)
        if hand_scale < 1e-4:
            self.reset()
            return GestureResult(gesture_name=self.name, is_detected=False, confidence=0.0)

        # Normalized distances
        dist_tm = euclidean_dist(thumb_tip, middle_tip) / hand_scale
        dist_ti = euclidean_dist(thumb_tip, index_tip) / hand_scale

        # Index finger exclusion: in a snap, index finger is NOT touching thumb
        index_free = dist_ti > (dist_tm * 1.15) or dist_ti > 0.28

        PINCH_THRESH = 0.36
        SNAP_RELEASE_THRESH = 0.48

        # 1. Phase 1: Contact / Tension loading
        if dist_tm < PINCH_THRESH and index_free:
            if not self.is_pinched:
                self.is_pinched = True
                self.pinch_start_time = now
            self.history.append((now, dist_tm, wrist.x, wrist.y))
            return GestureResult(
                gesture_name=self.name,
                is_detected=False,
                confidence=0.5,
                metadata={"is_armed": True, "dist": dist_tm},
            )

        # 2. Phase 2: Explosive Snap Release
        if self.is_pinched:
            pinch_duration = now - self.pinch_start_time

            # Must have held tension briefly (>= 30ms) to ensure deliberate gesture
            if 0.03 <= pinch_duration <= 2.5 and self.history:
                prev_time, prev_dist, prev_wx, prev_wy = self.history[-1]
                dt = max(0.01, now - prev_time)
                instant_velocity = (dist_tm - prev_dist) / dt
                single_frame_jump = dist_tm - prev_dist

                # Wrist stability check: reject camera shake / arm waving
                wrist_jump = math.hypot(wrist.x - prev_wx, wrist.y - prev_wy)

                # Snap firing criteria:
                # 1. Middle finger is now separated (>= SNAP_RELEASE_THRESH)
                # 2. Explosive single-frame or 2-frame jump (jump >= 0.20, velocity >= 4.5)
                # 3. Wrist did not violently jerk across screen (< 0.20)
                if (
                    dist_tm >= SNAP_RELEASE_THRESH
                    and single_frame_jump >= 0.20
                    and instant_velocity >= 4.5
                    and wrist_jump < 0.20
                ):
                    self.reset()
                    return GestureResult(
                        gesture_name=self.name,
                        is_detected=True,
                        confidence=0.95,
                        metadata={
                            "velocity": instant_velocity,
                            "dist": dist_tm,
                            "jump": single_frame_jump,
                            "is_armed": False,
                        },
                    )

            # If fingers separated beyond release threshold without meeting snap criteria, un-pinch
            if dist_tm >= SNAP_RELEASE_THRESH or pinch_duration > 2.5:
                self.is_pinched = False
                self.history.clear()

        # Update history with current non-pinched frame
        self.history.append((now, dist_tm, wrist.x, wrist.y))
        return GestureResult(
            gesture_name=self.name,
            is_detected=False,
            confidence=0.0,
            metadata={"is_armed": False, "dist": dist_tm},
        )
