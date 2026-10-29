"""
Unit tests for webcam device enumeration.
"""

from blip.core.devices import get_camera_resolution, list_available_cameras


def test_list_available_cameras():
    """Verify camera probing returns a list of integer indices."""
    cameras = list_available_cameras(max_tested=2)
    assert isinstance(cameras, list)
    assert len(cameras) >= 1
    assert all(isinstance(idx, int) for idx in cameras)


def test_get_camera_resolution():
    """Verify camera resolution query returns valid positive dimensions."""
    w, h = get_camera_resolution(0)
    assert isinstance(w, int) and w > 0
    assert isinstance(h, int) and h > 0
