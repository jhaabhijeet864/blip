"""
Unit tests for webcam device enumeration, friendly name resolution, and smart camera routing.
"""

import sys
from unittest.mock import MagicMock, patch

import numpy as np

from blip.core.devices import (
    CameraDevice,
    _is_virtual_camera_name,
    get_best_default_camera,
    get_camera_devices,
    get_camera_resolution,
    list_available_cameras,
)


def test_camera_device_display_label():
    """Verify display_label reflects active, offline, phone app, and virtual status correctly."""
    d1 = CameraDevice(index=1, name="HP Wide Vision HD Camera", is_active=True, is_virtual=False)
    assert d1.display_label == "HP Wide Vision HD Camera (Active)"
    assert d1.is_phone_bridge is False

    d2 = CameraDevice(index=0, name="DroidCam Video", is_active=False, is_virtual=False)
    assert d2.display_label == "DroidCam Video (Phone App - Offline)"
    assert d2.is_phone_bridge is True

    d3 = CameraDevice(index=2, name="OBS Virtual Camera", is_active=True, is_virtual=True)
    assert d3.display_label == "OBS Virtual Camera (Virtual Device)"


def test_is_virtual_camera_name():
    """Verify virtual camera name pattern recognition."""
    assert _is_virtual_camera_name("OBS Virtual Camera") is True
    assert _is_virtual_camera_name("Unity Video Capture") is True
    assert _is_virtual_camera_name("v4l2loopback") is True
    assert _is_virtual_camera_name("HP Wide Vision HD Camera") is False
    assert _is_virtual_camera_name("Logitech Brio 4K") is False


def test_get_camera_devices_with_directshow():
    """Verify get_camera_devices parses pygrabber device names and probes status."""
    mock_names = ["DroidCam Video", "HP Wide Vision HD Camera", "OBS Virtual Camera"]

    # Mock pygrabber
    mock_graph = MagicMock()
    mock_graph.get_input_devices.return_value = mock_names

    # Mock cv2.VideoCapture so index 0 fails, index 1 succeeds, index 2 is skipped (virtual)
    def mock_video_capture(idx, backend=None):
        cap = MagicMock()
        if idx == 1:
            cap.isOpened.return_value = True
            cap.read.return_value = (True, np.ones((720, 1280, 3), dtype=np.uint8))
            cap.get.side_effect = lambda prop: 1280 if prop == 3 else 720
        else:
            cap.isOpened.return_value = False
            cap.read.return_value = (False, None)
        return cap

    mock_pygrabber = MagicMock()
    mock_pygrabber.dshow_graph.FilterGraph.return_value = mock_graph

    with patch.dict(
        sys.modules,
        {"pygrabber": mock_pygrabber, "pygrabber.dshow_graph": mock_pygrabber.dshow_graph},
    ):
        with patch("sys.platform", "win32"):
            with patch("cv2.VideoCapture", side_effect=mock_video_capture):
                devices = get_camera_devices()

    assert len(devices) == 3
    assert devices[0].name == "DroidCam Video"
    assert devices[0].is_active is False
    assert devices[0].is_virtual is False

    assert devices[1].name == "HP Wide Vision HD Camera"
    assert devices[1].is_active is True
    assert devices[1].is_virtual is False
    assert devices[1].resolution == (1280, 720)

    assert devices[2].name == "OBS Virtual Camera"
    assert devices[2].is_virtual is True


def test_get_best_default_camera():
    """Verify smart default selects active physical camera over offline or virtual devices."""
    devices = [
        CameraDevice(index=0, name="DroidCam Video", is_active=False, is_virtual=False),
        CameraDevice(index=1, name="HP Wide Vision HD Camera", is_active=True, is_virtual=False),
        CameraDevice(index=2, name="OBS Virtual Camera", is_active=True, is_virtual=True),
    ]

    best_idx = get_best_default_camera(devices)
    assert best_idx == 1

    # If no active physical camera, fallback to active virtual or first
    devices_all_offline = [
        CameraDevice(index=0, name="Cam0", is_active=False, is_virtual=False),
        CameraDevice(index=1, name="Cam1", is_active=False, is_virtual=False),
    ]
    assert get_best_default_camera(devices_all_offline) == 0


def test_list_available_cameras_fallback():
    """Verify list_available_cameras returns fallback list."""
    cameras = list_available_cameras(max_tested=2)
    assert isinstance(cameras, list)
    assert len(cameras) >= 1
    assert all(isinstance(idx, int) for idx in cameras)


def test_get_camera_resolution():
    """Verify camera resolution query returns valid positive dimensions."""
    w, h = get_camera_resolution(0)
    assert isinstance(w, int) and w > 0
    assert isinstance(h, int) and h > 0
