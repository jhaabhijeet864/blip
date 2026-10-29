"""
Unit tests for Thanos Snap and Goku Instant Transmission gesture detectors.
"""

import time
from dataclasses import dataclass

from blip.gestures.instant_transmission import InstantTransmissionGesture
from blip.gestures.registry import GestureRegistry
from blip.gestures.snap import SnapGesture
from blip.vision.hand_tracker import HandLandmarkData


@dataclass
class MockPoint:
    x: float
    y: float
    z: float = 0.0


def create_flat_hand() -> list[MockPoint]:
    """Create landmarks for a relaxed resting hand (all fingers open, no gesture)."""
    landmarks = [MockPoint(0.5, 0.8, 0.0)]  # 0: Wrist
    # Thumb (1-4)
    landmarks.extend([MockPoint(0.45, 0.75), MockPoint(0.40, 0.70), MockPoint(0.38, 0.65), MockPoint(0.35, 0.60)])
    # Index (5-8)
    landmarks.extend([MockPoint(0.48, 0.65), MockPoint(0.48, 0.55), MockPoint(0.48, 0.48), MockPoint(0.48, 0.40)])
    # Middle (9-12)
    landmarks.extend([MockPoint(0.52, 0.64), MockPoint(0.52, 0.54), MockPoint(0.52, 0.46), MockPoint(0.52, 0.38)])
    # Ring (13-16)
    landmarks.extend([MockPoint(0.56, 0.66), MockPoint(0.56, 0.57), MockPoint(0.56, 0.50), MockPoint(0.56, 0.43)])
    # Pinky (17-20)
    landmarks.extend([MockPoint(0.60, 0.70), MockPoint(0.60, 0.62), MockPoint(0.60, 0.56), MockPoint(0.60, 0.50)])
    return landmarks


def create_it_hand() -> list[MockPoint]:
    """
    Create landmarks for Goku's Instant Transmission pose:
    Index and Middle fingers extended upward close together near temple;
    Ring and Pinky curled down into palm; Hand in upper frame.
    """
    landmarks = [MockPoint(0.5, 0.45, 0.0)]  # 0: Wrist raised high
    # Thumb (1-4) curled
    landmarks.extend([MockPoint(0.48, 0.42), MockPoint(0.46, 0.40), MockPoint(0.45, 0.38), MockPoint(0.46, 0.36)])
    # Index (5-8) extended up
    landmarks.extend([MockPoint(0.49, 0.35), MockPoint(0.49, 0.25), MockPoint(0.49, 0.18), MockPoint(0.49, 0.12)])
    # Middle (9-12) extended up right beside index
    landmarks.extend([MockPoint(0.52, 0.35), MockPoint(0.52, 0.25), MockPoint(0.52, 0.18), MockPoint(0.52, 0.12)])
    # Ring (13-16) folded tight (tip y > pip y)
    landmarks.extend([MockPoint(0.55, 0.38), MockPoint(0.55, 0.40), MockPoint(0.55, 0.42), MockPoint(0.54, 0.44)])
    # Pinky (17-20) folded tight (tip y > pip y)
    landmarks.extend([MockPoint(0.58, 0.40), MockPoint(0.58, 0.42), MockPoint(0.58, 0.44), MockPoint(0.57, 0.46)])
    return landmarks


def test_snap_gesture_no_false_positive():
    """Verify resting hand does not trigger a snap."""
    detector = SnapGesture()
    flat = create_flat_hand()
    res = detector.detect(flat, (720, 1280))
    assert not res.is_detected


def test_snap_gesture_pinch_and_flick():
    """Verify that a pinch followed by rapid separation triggers snap."""
    detector = SnapGesture()
    hand = create_flat_hand()

    # 1. Pinch thumb (idx 4) and middle (idx 12) together
    hand[4] = MockPoint(0.45, 0.50)
    hand[12] = MockPoint(0.46, 0.50)  # Close distance
    res1 = detector.detect(hand, (720, 1280))
    assert not res1.is_detected
    assert detector.is_pinched

    # 2. Explosive release: middle finger flicks away
    time.sleep(0.05)
    hand[12] = MockPoint(0.58, 0.72)  # Flicks down/away
    res2 = detector.detect(hand, (720, 1280))
    assert res2.is_detected
    assert res2.gesture_name == "snap"


def test_instant_transmission_detection():
    """Verify Goku pose triggers after required consecutive frames."""
    detector = InstantTransmissionGesture()
    flat = create_flat_hand()
    assert not detector.detect(flat, (720, 1280)).is_detected

    it_hand = create_it_hand()
    # Frames 1 and 2: accumulating streak
    res1 = detector.detect(it_hand, (720, 1280))
    assert not res1.is_detected
    res2 = detector.detect(it_hand, (720, 1280))
    assert not res2.is_detected

    # Frame 3: confirmed!
    res3 = detector.detect(it_hand, (720, 1280))
    assert res3.is_detected
    assert res3.gesture_name == "instant_transmission"


def test_gesture_registry_evaluation():
    """Verify registry aggregates and detects gestures across hands."""
    registry = GestureRegistry()
    it_hand = create_it_hand()
    hand_data = [HandLandmarkData(landmarks=it_hand, handedness="Right", confidence=0.9)]

    # Run 3 consecutive frames to satisfy IT threshold
    registry.evaluate(hand_data, (720, 1280))
    registry.evaluate(hand_data, (720, 1280))
    detected = registry.evaluate(hand_data, (720, 1280))
    assert detected == "instant_transmission"
