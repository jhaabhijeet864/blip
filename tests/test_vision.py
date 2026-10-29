"""
Unit tests for vision modules: MediaPipe HandTracker and SelfieSegmenter.
"""

from unittest.mock import MagicMock

import numpy as np

from blip.vision.hand_tracker import (
    INDEX_TIP,
    MIDDLE_TIP,
    THUMB_TIP,
    HandLandmarkData,
    HandTracker,
)
from blip.vision.segmenter import SelfieSegmenter


class MockLandmarkPoint:
    def __init__(self, x: float, y: float, z: float = 0.0):
        self.x = x
        self.y = y
        self.z = z


def test_hand_tracker_process_with_mock_results():
    """Verify HandTracker parses MediaPipe detection landmarks and handedness."""
    tracker = HandTracker()

    # Mock internal hands solution
    mock_results = MagicMock()
    # 21 points
    mock_landmarks = [MockLandmarkPoint(0.5, 0.5) for _ in range(21)]
    mock_hand = MagicMock()
    mock_hand.landmark = mock_landmarks
    mock_results.multi_hand_landmarks = [mock_hand]

    mock_classification = MagicMock()
    mock_classification.label = "Left"
    mock_classification.score = 0.98
    mock_handedness = MagicMock()
    mock_handedness.classification = [mock_classification]
    mock_results.multi_handedness = [mock_handedness]

    tracker.hands.process = MagicMock(return_value=mock_results)

    synth_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
    hands = tracker.process(synth_frame)

    assert len(hands) == 1
    assert hands[0].handedness == "Left"
    assert hands[0].confidence == 0.98
    assert len(hands[0].landmarks) == 21

    tracker.close()


def test_hand_tracker_draw_landmarks():
    """Verify draw_landmarks annotates fingertip coordinates onto the frame."""
    tracker = HandTracker()
    frame = np.zeros((720, 1280, 3), dtype=np.uint8)

    pts = [MockLandmarkPoint(0.0, 0.0) for _ in range(21)]
    pts[THUMB_TIP] = MockLandmarkPoint(0.2, 0.3)
    pts[INDEX_TIP] = MockLandmarkPoint(0.4, 0.5)
    pts[MIDDLE_TIP] = MockLandmarkPoint(0.6, 0.7)

    hand_data = [HandLandmarkData(landmarks=pts, handedness="Right", confidence=0.9)]
    annotated = tracker.draw_landmarks(frame, hand_data)

    assert annotated.shape == frame.shape
    # Frame should have circles drawn (non-zero pixels)
    assert np.any(annotated > 0)

    tracker.close()


def test_selfie_segmenter_with_and_without_feathering():
    """Verify SelfieSegmenter produces valid alpha mask with feathering options."""
    segmenter = SelfieSegmenter(model_selection=1, threshold=0.5)

    synth_frame = np.zeros((240, 320, 3), dtype=np.uint8)
    mask_feathered = segmenter.process(synth_frame, feather=True)
    assert mask_feathered.shape == (240, 320)
    assert mask_feathered.dtype == np.float32
    assert 0.0 <= np.min(mask_feathered) <= 1.0
    assert 0.0 <= np.max(mask_feathered) <= 1.0

    mask_unfeathered = segmenter.process(synth_frame, feather=False)
    assert mask_unfeathered.shape == (240, 320)

    # Test fallback when raw_mask is None
    mock_res = MagicMock()
    mock_res.segmentation_mask = None
    segmenter.segmenter.process = MagicMock(return_value=mock_res)
    fallback_mask = segmenter.process(synth_frame)
    assert fallback_mask.shape == (240, 320)
    np.testing.assert_array_equal(fallback_mask, np.ones((240, 320), dtype=np.float32))

    segmenter.close()
