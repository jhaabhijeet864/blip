"""
Unit tests for VirtualCameraSink and driver checking.
"""

from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from blip.core.vcam import (
    VirtualCameraDriverNotFoundError,
    VirtualCameraSink,
    check_virtual_camera_driver,
)


def test_driver_check_platforms():
    """Verify check_virtual_camera_driver handles different platforms."""
    with patch("sys.platform", "win32"):
        avail, msg = check_virtual_camera_driver()
        assert isinstance(avail, bool)
        assert "Virtual Camera" in msg

    with patch("sys.platform", "linux"):
        avail, msg = check_virtual_camera_driver()
        assert isinstance(avail, bool)
        assert "v4l2loopback" in msg

    with patch("sys.platform", "darwin"):
        avail, msg = check_virtual_camera_driver()
        assert avail is True
        assert "macOS" in msg

    with patch("sys.platform", "solaris"):
        avail, msg = check_virtual_camera_driver()
        assert avail is False
        assert "Unsupported" in msg


def test_vcam_sink_lifecycle_and_send():
    """Verify VirtualCameraSink starts, sends frames, resizes if needed, and stops."""
    mock_camera_instance = MagicMock()
    mock_camera_instance.width = 1280
    mock_camera_instance.height = 720
    mock_camera_instance.fps = 30
    mock_camera_instance.device = "TestCamera"

    with patch("pyvirtualcam.Camera", return_value=mock_camera_instance):
        sink = VirtualCameraSink(width=1280, height=720, fps=30)
        assert not sink.is_active

        sink.start()
        assert sink.is_active

        # Calling start again when already active is a no-op
        sink.start()
        assert sink.is_active

        # Send frame matching dimensions
        frame_normal = np.zeros((720, 1280, 3), dtype=np.uint8)
        sink.send(frame_normal)
        mock_camera_instance.send.assert_called_once()

        # Send frame with different dimensions (forces internal resize)
        frame_small = np.zeros((360, 640, 3), dtype=np.uint8)
        sink.send(frame_small)
        assert mock_camera_instance.send.call_count == 2

        # Sleep until next frame
        sink.sleep_until_next_frame()
        mock_camera_instance.sleep_until_next_frame.assert_called_once()

        sink.stop()
        assert not sink.is_active
        mock_camera_instance.close.assert_called_once()


def test_vcam_sink_context_manager():
    """Verify VirtualCameraSink context management protocol."""
    mock_cam = MagicMock()
    with patch("pyvirtualcam.Camera", return_value=mock_cam):
        with VirtualCameraSink(width=640, height=480) as sink:
            assert sink.is_active
        assert not sink.is_active


def test_vcam_sink_start_failure():
    """Verify start raises VirtualCameraDriverNotFoundError when camera init fails."""
    with patch("pyvirtualcam.Camera", side_effect=RuntimeError("Device not found")):
        sink = VirtualCameraSink()
        with pytest.raises(VirtualCameraDriverNotFoundError):
            sink.start()
        assert not sink.is_active
