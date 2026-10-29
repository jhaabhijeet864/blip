"""
MediaPipe Hands tracking wrapper for Blip.
Processes RGB camera frames and extracts normalized 3D landmarks for hand gesture detection.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import cv2
import numpy as np

# Landmark index constants for quick reference
WRIST = 0
THUMB_CMC = 1
THUMB_MCP = 2
THUMB_IP = 3
THUMB_TIP = 4
INDEX_MCP = 5
INDEX_PIP = 6
INDEX_DIP = 7
INDEX_TIP = 8
MIDDLE_MCP = 9
MIDDLE_PIP = 10
MIDDLE_DIP = 11
MIDDLE_TIP = 12
RING_MCP = 13
RING_PIP = 14
RING_DIP = 15
RING_TIP = 16
PINKY_MCP = 17
PINKY_PIP = 18
PINKY_DIP = 19
PINKY_TIP = 20


@dataclass
class HandLandmarkData:
    """Normalized 3D coordinates for a detected hand."""

    landmarks: list[Any]  # 21 points with .x, .y, .z
    handedness: str  # "Left" or "Right"
    confidence: float


class HandTracker:
    """
    Encapsulates MediaPipe Hands solution with automatic resource management.
    """

    def __init__(
        self,
        max_num_hands: int = 2,
        min_detection_confidence: float = 0.7,
        min_tracking_confidence: float = 0.5,
    ):
        import mediapipe as mp

        self.mp_hands = mp.solutions.hands
        self.mp_draw = mp.solutions.drawing_utils
        self.mp_draw_styles = mp.solutions.drawing_styles

        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=max_num_hands,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

    def process(self, frame_rgb: np.ndarray) -> list[HandLandmarkData]:
        """
        Process an RGB image and return detected hands data.
        """
        results = self.hands.process(frame_rgb)
        detected_hands: list[HandLandmarkData] = []

        if not results.multi_hand_landmarks:
            return detected_hands

        handedness_list = results.multi_handedness or []

        for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
            label = "Right"
            score = 1.0
            if idx < len(handedness_list):
                classification = handedness_list[idx].classification[0]
                label = classification.label
                score = classification.score

            detected_hands.append(
                HandLandmarkData(
                    landmarks=hand_landmarks.landmark, handedness=label, confidence=score
                )
            )

        return detected_hands

    def draw_landmarks(
        self,
        frame: np.ndarray,
        hands_data: list[HandLandmarkData],
        is_snap_armed: bool = False,
    ) -> np.ndarray:
        """
        Draw landmarks and skeleton connections onto a copy of the frame for GUI preview.
        Highlights thumb and middle fingertip when snap is armed.
        """
        annotated = frame.copy()
        h, w, _ = annotated.shape

        for hand in hands_data:
            # Draw circles on key tips: thumb, index, middle
            for tip_idx in (THUMB_TIP, INDEX_TIP, MIDDLE_TIP):
                pt = hand.landmarks[tip_idx]
                cx, cy = int(pt.x * w), int(pt.y * h)

                if is_snap_armed and tip_idx in (THUMB_TIP, MIDDLE_TIP):
                    # Glowing amber pulse for armed snap gesture
                    cv2.circle(annotated, (cx, cy), 14, (30, 160, 255), 2, cv2.LINE_AA)  # BGR Amber
                    cv2.circle(annotated, (cx, cy), 7, (0, 215, 255), -1, cv2.LINE_AA)
                    cv2.circle(annotated, (cx, cy), 9, (255, 255, 255), 1, cv2.LINE_AA)
                else:
                    cv2.circle(annotated, (cx, cy), 6, (0, 255, 255), -1)
                    cv2.circle(annotated, (cx, cy), 8, (255, 255, 255), 1)

            if is_snap_armed:
                # Draw subtle HUD pill above hand
                m_pt = hand.landmarks[MIDDLE_TIP]
                mx, my = int(m_pt.x * w), max(25, int(m_pt.y * h) - 25)
                cv2.putText(
                    annotated,
                    "SNAP ARMED",
                    (mx - 40, my),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (30, 200, 255),
                    2,
                    cv2.LINE_AA,
                )

        return annotated

    def close(self) -> None:
        """Release MediaPipe resources."""
        if hasattr(self, "hands") and self.hands:
            self.hands.close()
