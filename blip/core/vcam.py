"""
Virtual camera device manager and streaming sink for Blip.
Interfaces with pyvirtualcam (OBS VirtualCam / DirectShow / v4l2loopback).
"""

from __future__ import annotations

import os
import sys

import numpy as np


class VirtualCameraDriverNotFoundError(Exception):
    """Raised when no compatible OS virtual camera driver is installed."""


def check_virtual_camera_driver() -> tuple[bool, str]:
    """
    Check if a compatible virtual camera driver is available on the system.
    Returns (is_available, status_message).
    """
    import importlib.util

    if importlib.util.find_spec("pyvirtualcam") is None:
        return False, "pyvirtualcam library is not installed."

    # On Windows, check for OBS Virtual Camera or Unity DirectShow device
    if sys.platform == "win32":
        obs_path_default = (
            r"C:\Program Files\obs-studio\data\obs-plugins\win-dshow\virtualcam-install.bat"
        )
        if os.path.exists(obs_path_default):
            return True, "OBS Virtual Camera driver ready."
        return True, "Virtual camera subsystem ready (Windows Virtual Camera / OBS)."

    elif sys.platform.startswith("linux"):
        has_v4l2 = os.path.exists("/dev/video0") or os.path.exists("/sys/module/v4l2loopback")
        return has_v4l2, "Linux v4l2loopback device check."

    elif sys.platform == "darwin":
        return True, "macOS DAL Plugin virtual camera ready."

    return False, f"Unsupported operating system: {sys.platform}"


class VirtualCameraSink:
    """
    Manages outputting RGB video frames to the OS virtual camera.
    """

    def __init__(
        self, width: int = 1280, height: int = 720, fps: int = 30, backend: str | None = None
    ):
        self.width = width
        self.height = height
        self.fps = fps
        self.backend = backend
        self._cam = None
        self._is_active = False

    @property
    def is_active(self) -> bool:
        return self._is_active

    def start(self) -> None:
        """Initialize and open the virtual camera device."""
        if self._is_active:
            return

        import pyvirtualcam

        try:
            # Let pyvirtualcam pick the best available backend if not specified
            kwargs = {
                "width": self.width,
                "height": self.height,
                "fps": self.fps,
                "fmt": pyvirtualcam.PixelFormat.RGB,
            }
            if self.backend:
                kwargs["backend"] = self.backend

            self._cam = pyvirtualcam.Camera(**kwargs)
            self._is_active = True
            print(
                f"🎥 Virtual Camera started: {self._cam.device} ({self._cam.width}x{self._cam.height} @ {self._cam.fps} FPS)"
            )

        except Exception as e:
            self._is_active = False
            self._cam = None
            raise VirtualCameraDriverNotFoundError(
                f"Failed to start virtual camera: {e}\n"
                "Please verify that OBS Studio (with OBS Virtual Camera) is installed, "
                "or that a DirectShow virtual camera is registered."
            ) from e

    def send(self, frame: np.ndarray) -> None:
        """
        Send a single RGB frame (H, W, 3) to the virtual camera.
        """
        if not self._is_active or self._cam is None:
            return

        # Ensure correct dimensions
        if frame.shape[0] != self.height or frame.shape[1] != self.width:
            import cv2

            frame = cv2.resize(frame, (self.width, self.height))

        self._cam.send(frame)

    def sleep_until_next_frame(self) -> None:
        """Rate limit frame delivery to match camera target FPS."""
        if self._is_active and self._cam is not None:
            self._cam.sleep_until_next_frame()

    def stop(self) -> None:
        """Close the virtual camera device."""
        if self._cam is not None:
            try:
                self._cam.close()
            except Exception:
                pass
            self._cam = None
        self._is_active = False

    def __enter__(self) -> VirtualCameraSink:
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.stop()
