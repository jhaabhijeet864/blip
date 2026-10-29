"""
Unit tests for core video pipeline, background calibration, and driver checking.
"""

from unittest.mock import MagicMock, patch

import numpy as np

from blip.config import BlipConfig
from blip.core.background import BackgroundManager
from blip.core.pipeline import PipelineState, VideoPipeline
from blip.core.vcam import check_virtual_camera_driver
from blip.effects.base import BaseEffect
from blip.effects.thanos_dust import ThanosSnapEffect
from blip.gestures.base import GestureResult, Landmark3D
from blip.vision.hand_tracker import HandLandmarkData


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


def test_background_manager_disk_persistence(tmp_path):
    """Verify background plate saves to disk upon calibration and auto-loads."""
    # 1. Calibrate in tmp directory
    bg1 = BackgroundManager(target_frames=1, plate_dir=tmp_path, auto_load=False)
    assert not bg1.has_plate()

    bg1.start_calibration(countdown_seconds=0.0)
    frame = np.full((720, 1280, 3), 150, dtype=np.uint8)
    assert bg1.update(frame)
    assert bg1.has_plate()
    assert (tmp_path / "background_plate.png").exists()

    # 2. Instantiate new BackgroundManager with auto_load=True in same dir
    bg2 = BackgroundManager(plate_dir=tmp_path, auto_load=True)
    assert bg2.has_plate()
    loaded_plate = bg2.get_plate(match_lighting=False)
    assert loaded_plate.shape == (720, 1280, 3)
    assert np.isclose(np.mean(loaded_plate), 150.0, atol=2.0)


def test_background_manager_inpainting_fallback():
    """Verify uncalibrated background uses inpainting when mask is provided."""
    bg = BackgroundManager(auto_load=False)
    assert not bg.has_plate()

    # Frame with user silhouette
    frame = np.full((720, 1280, 3), 200, dtype=np.uint8)
    frame[200:500, 400:800] = 50  # Dark silhouette
    mask = np.zeros((720, 1280), dtype=np.float32)
    mask[200:500, 400:800] = 1.0

    plate = bg.get_plate(current_frame=frame, mask=mask)
    assert plate.shape == (720, 1280, 3)
    assert plate.dtype == np.uint8
    # Inpainted silhouette area should be filled in with surrounding color (~200) instead of remaining dark
    inpaint_region_mean = np.mean(plate[200:500, 400:800])
    assert inpaint_region_mean > 120.0


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


def test_pipeline_process_frame_normal_feed():
    """Verify process_frame passes through frame in NORMAL state."""
    pipeline = VideoPipeline()
    frame = np.full((720, 1280, 3), 150, dtype=np.uint8)

    out = pipeline.process_frame(frame)
    assert out.shape == frame.shape
    np.testing.assert_array_equal(out, frame)
    assert pipeline.latest_preview_frame is not None


def test_pipeline_process_frame_calibration():
    """Verify process_frame updates calibration and completes."""
    pipeline = VideoPipeline()
    pipeline.bg_manager = BackgroundManager(target_frames=2)
    pipeline.trigger_calibration(countdown_seconds=0.0)
    assert pipeline.state == PipelineState.CALIBRATING

    frame = np.full((720, 1280, 3), 50, dtype=np.uint8)
    pipeline.process_frame(frame)
    assert pipeline.state == PipelineState.CALIBRATING

    pipeline.process_frame(frame)
    assert pipeline.state == PipelineState.NORMAL
    assert pipeline.bg_manager.has_plate()


def test_pipeline_disappearing_and_disappeared_lifecycle():
    """Verify full gesture trigger to disappearing, disappeared, and reappear."""
    pipeline = VideoPipeline()
    pipeline.config.auto_gestures_enabled = True
    effect = ThanosSnapEffect(duration_frames=2, particle_count=100)
    pipeline.effects_map = {"thanos_dust": effect}

    # Mock hand tracker and gesture evaluator
    pipeline.hand_tracker = MagicMock()
    pipeline.hand_tracker.process.return_value = [
        HandLandmarkData(landmarks=[], handedness="Right", confidence=0.9)
    ]
    pipeline.hand_tracker.draw_landmarks = lambda f, h: f
    pipeline.gesture_evaluator = MagicMock(return_value="snap")

    frame = np.full((720, 1280, 3), 120, dtype=np.uint8)

    # Frame 1: Triggers snap -> state becomes DISAPPEARING
    pipeline.process_frame(frame, now=10.0)
    assert pipeline.state == PipelineState.DISAPPEARING
    assert pipeline.active_effect is not None

    # Frame 2: Effect finishes -> state becomes DISAPPEARED
    pipeline.process_frame(frame, now=10.05)
    assert pipeline.state == PipelineState.DISAPPEARED

    # Frame 3: Sustained DISAPPEARED state returns background plate
    out3 = pipeline.process_frame(frame, now=10.10)
    assert pipeline.state == PipelineState.DISAPPEARED
    assert out3.shape == frame.shape

    # Reappear trigger
    pipeline.trigger_reappear()
    assert pipeline.state == PipelineState.NORMAL


def test_pipeline_reappear_with_effect():
    """Verify reappearance when a reappear effect is attached."""

    class DummyReappearEffect(BaseEffect):
        def __init__(self):
            super().__init__("DummyReappear", duration_frames=2)

        def render(self, frame, mask, bg):
            return frame

    pipeline = VideoPipeline()
    dummy_reappear = DummyReappearEffect()
    pipeline.reappear_effect = dummy_reappear

    frame = np.full((720, 1280, 3), 80, dtype=np.uint8)
    pipeline.state = PipelineState.DISAPPEARED

    pipeline.trigger_reappear()
    assert pipeline.state == PipelineState.REAPPEARING
    assert pipeline.active_effect is dummy_reappear

    # Step frame
    pipeline.process_frame(frame)
    assert pipeline.state == PipelineState.REAPPEARING
    # Step frame to completion
    pipeline.process_frame(frame)
    assert pipeline.state == PipelineState.NORMAL


def test_pipeline_gesture_cooldown():
    """Verify rapid consecutive gestures are suppressed by cooldown."""
    pipeline = VideoPipeline()
    pipeline.config.auto_gestures_enabled = True
    pipeline.config.cooldown_seconds = 2.0
    pipeline.hand_tracker = MagicMock()
    pipeline.hand_tracker.process.return_value = [
        HandLandmarkData(landmarks=[], handedness="Right", confidence=0.9)
    ]
    pipeline.gesture_evaluator = MagicMock(return_value="snap")

    frame = np.full((720, 1280, 3), 100, dtype=np.uint8)

    # First trigger at t=10.0
    pipeline.process_frame(frame, now=10.0)
    assert pipeline.last_trigger_time == 10.0

    # Second trigger at t=10.5 (within 2s cooldown) - evaluator must NOT be called
    pipeline.gesture_evaluator.reset_mock()
    pipeline.process_frame(frame, now=10.5)
    pipeline.gesture_evaluator.assert_not_called()

    # Third trigger at t=12.1 (cooldown passed) - evaluator must be called
    pipeline.process_frame(frame, now=12.1)
    pipeline.gesture_evaluator.assert_called_once()


def test_pipeline_vcam_streaming():
    """Verify frame is sent to virtual camera when active."""
    pipeline = VideoPipeline()
    mock_sink = MagicMock()
    mock_sink.is_active = True
    pipeline.vcam_sink = mock_sink

    frame = np.full((720, 1280, 3), 200, dtype=np.uint8)
    pipeline.process_frame(frame)

    mock_sink.send.assert_called_once()


def test_pipeline_thread_start_stop():
    """Verify thread start and stop methods behave safely without hardware."""
    pipeline = VideoPipeline()
    assert not pipeline._running
    # Call stop when not started
    pipeline.stop()
    assert not pipeline._running


def test_pipeline_switch_camera_and_diagnostics():
    """Verify switch_camera updates pending target and diagnostic frame generation."""
    pipeline = VideoPipeline()
    assert pipeline._pending_camera_index is None

    pipeline.switch_camera(2, "Test External Camera")
    assert pipeline._pending_camera_index == 2
    assert pipeline.config.camera_index == 2
    assert pipeline.active_camera_name == "Test External Camera"

    diag = pipeline.create_offline_diagnostic_frame()
    assert diag.shape == (pipeline.config.camera_height, pipeline.config.camera_width, 3)
    assert diag.dtype == np.uint8


def test_pipeline_open_camera_fallback():
    """Verify _open_camera falls back to best default if target index is closed."""
    pipeline = VideoPipeline()
    mock_bad_cap = MagicMock()
    mock_bad_cap.isOpened.return_value = False

    mock_good_cap = MagicMock()
    mock_good_cap.isOpened.return_value = True

    with patch("cv2.VideoCapture", side_effect=[mock_bad_cap, mock_good_cap]):
        with patch("blip.core.pipeline.get_best_default_camera", return_value=1):
            cap = pipeline._open_camera(index=None)
            assert cap is mock_good_cap
            assert pipeline.config.camera_index == 1


def test_pipeline_auto_gestures_disabled_prevents_firing():
    """Verify gestures are ignored when auto_gestures_enabled is False."""
    pipeline = VideoPipeline()
    pipeline.config.auto_gestures_enabled = False
    pipeline.hand_tracker = MagicMock()
    pipeline.gesture_evaluator = MagicMock(return_value="snap")
    frame = np.full((720, 1280, 3), 100, dtype=np.uint8)
    pipeline.process_frame(frame, now=10.0)
    assert pipeline.state == PipelineState.NORMAL
    pipeline.hand_tracker.process.assert_not_called()
