"""
Unit tests for core video pipeline, background calibration, and driver checking.
"""

import numpy as np

from blip.config import BlipConfig
from blip.core.background import BackgroundManager
from blip.core.pipeline import PipelineState, VideoPipeline
from blip.core.vcam import check_virtual_camera_driver
from blip.gestures.base import GestureResult, Landmark3D


def test_config_defaults_and_serialization(tmp_path):
    """Verify configuration loads default values and round-trips to JSON."""
    cfg = BlipConfig()
    assert cfg.camera_index == 0
    assert cfg.camera_width == 1280
    assert cfg.camera_height == 720
    assert "snap" in cfg.gesture_mappings
    assert cfg.gesture_mappings["snap"] == "thanos_dust"

    # Test save and load
    test_file = tmp_path / "test_config.json"
    cfg.camera_index = 2
    cfg.save(test_file)

    loaded = BlipConfig.load(test_file)
    assert loaded.camera_index == 2
    assert loaded.camera_width == 1280
    assert loaded.to_dict()["camera_index"] == 2


def test_background_manager_calibration_lifecycle():
    """Verify background calibration countdown, accumulation, and plate extraction."""
    bg = BackgroundManager(target_frames=3)
    assert not bg.has_plate()
    assert not bg.is_calibrating()

    # Fallback when no plate
    fallback = bg.get_plate()
    assert fallback.shape == (720, 1280, 3)

    # Start countdown with 0s for immediate capture
    bg.start_calibration(countdown_seconds=0.0)
    assert bg.is_calibrating()

    frame1 = np.ones((720, 1280, 3), dtype=np.uint8) * 100
    frame2 = np.ones((720, 1280, 3), dtype=np.uint8) * 110
    frame3 = np.ones((720, 1280, 3), dtype=np.uint8) * 120

    assert not bg.update(frame1)
    assert not bg.update(frame2)
    # Third frame should finish calibration
    done = bg.update(frame3)
    assert done
    assert not bg.is_calibrating()
    assert bg.has_plate()

    plate = bg.get_plate(match_lighting=False)
    assert plate.shape == (720, 1280, 3)
    assert np.isclose(np.mean(plate), 110.0, atol=1.0)

    # Test adaptive lighting compensation branch
    light_adjusted = bg.get_plate(current_frame=frame1, match_lighting=True)
    assert light_adjusted.shape == (720, 1280, 3)


def test_virtual_camera_driver_check():
    """Verify virtual camera driver detection runs without exceptions."""
    is_avail, msg = check_virtual_camera_driver()
    assert isinstance(is_avail, bool)
    assert isinstance(msg, str)
    assert len(msg) > 0


def test_landmark_data_structures():
    """Verify landmark abstraction."""
    pt = Landmark3D(x=0.5, y=0.5, z=0.0)
    assert pt.x == 0.5
    res = GestureResult(gesture_name="snap", is_detected=True, confidence=0.95)
    assert res.is_detected
    assert res.confidence == 0.95


def test_hand_tracker_and_segmenter_inference():
    """Verify MediaPipe solutions initialize and process synthetic RGB frame."""
    from blip.vision.hand_tracker import HandTracker
    from blip.vision.segmenter import SelfieSegmenter

    tracker = HandTracker()
    segmenter = SelfieSegmenter()

    synth_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
    hands = tracker.process(synth_frame)
    assert isinstance(hands, list)

    mask = segmenter.process(synth_frame)
    assert mask.shape == (720, 1280)
    assert mask.dtype == np.float32

    tracker.close()
    segmenter.close()


def test_pipeline_state_transitions():
    """Verify video pipeline calibration and reappear state changes."""
    pipeline = VideoPipeline()
    assert pipeline.state == PipelineState.NORMAL

    # Calibration trigger
    pipeline.trigger_calibration(countdown_seconds=2.0)
    assert pipeline.state == PipelineState.CALIBRATING
    assert pipeline.bg_manager.is_calibrating()

    # Disappear state simulation
    pipeline.state = PipelineState.DISAPPEARED
    pipeline.trigger_reappear()
    assert pipeline.state == PipelineState.NORMAL
