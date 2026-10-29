"""
MediaPipe Selfie Segmentation wrapper for Blip.
Generates real-time soft alpha masks of the user's silhouette for clean background replacement.
"""

from __future__ import annotations

import cv2
import numpy as np


class SelfieSegmenter:
    """
    Provides real-time person vs background segmentation masks with edge feathering.
    """

    def __init__(self, model_selection: int = 1, threshold: float = 0.5):
        """
        model_selection: 0 for general portrait (256x256), 1 for landscape video (256x144, faster).
        threshold: Confidence threshold for person classification.
        """
        import mediapipe as mp

        self.threshold = threshold
        self.mp_selfie = mp.solutions.selfie_segmentation
        self.segmenter = self.mp_selfie.SelfieSegmentation(model_selection=model_selection)

    def process(self, frame_rgb: np.ndarray, feather: bool = True) -> np.ndarray:
        """
        Compute float32 alpha mask for the person in the frame.

        Args:
            frame_rgb: (H, W, 3) uint8 RGB image.
            feather: Apply slight Gaussian smoothing to reduce pixel staircasing.

        Returns:
            Alpha mask (H, W) float32 in range [0.0, 1.0], where 1.0 = person, 0.0 = background.
        """
        results = self.segmenter.process(frame_rgb)
        raw_mask = results.segmentation_mask  # shape (H, W), float32

        if raw_mask is None:
            # Fallback full silhouette if detection momentarily drops
            return np.ones((frame_rgb.shape[0], frame_rgb.shape[1]), dtype=np.float32)

        if feather:
            # Soften silhouette boundaries
            raw_mask = cv2.GaussianBlur(raw_mask, (7, 7), 0)

        return np.clip(raw_mask, 0.0, 1.0)

    def close(self) -> None:
        """Release MediaPipe segmenter resources."""
        if hasattr(self, "segmenter") and self.segmenter:
            self.segmenter.close()
