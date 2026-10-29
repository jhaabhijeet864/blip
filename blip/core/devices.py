"""
Webcam device detection and friendly name enumeration utilities for Blip.
Discovers active hardware cameras, friendly names, and handles DirectShow device routing.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from typing import List

import cv2


@dataclass
class CameraDevice:
    """Represents a discovered video input device."""

    index: int
    name: str
    is_active: bool
    is_virtual: bool
    resolution: tuple[int, int] = (1280, 720)

    @property
    def is_phone_bridge(self) -> bool:
        """Check if device is a phone-to-PC webcam streaming app."""
        lower = self.name.lower()
        return any(p in lower for p in ["droid", "iriun", "epoc", "camo"])

    @property
    def display_label(self) -> str:
        """Formatted label for desktop UI dropdown."""
        if self.is_virtual:
            status = "Virtual Device"
        elif self.is_phone_bridge:
            status = "Phone App" if self.is_active else "Phone App - Offline"
        elif self.is_active:
            status = "Active"
        else:
            status = "Offline"
        return f"{self.name} ({status})"


def _is_virtual_camera_name(name: str) -> bool:
    """Check if the device name indicates a virtual loopback camera."""
    lower = name.lower()
    return any(v in lower for v in ["obs virtual", "unity video", "v4l2loopback", "virtual camera"])


def get_camera_devices(max_tested: int = 6) -> List[CameraDevice]:
    """
    Enumerate video input devices with real friendly names and probe operational status.
    On Windows, uses pygrabber to read DirectShow friendly names in OpenCV index order.
    """
    discovered_names: list[str] = []

    if sys.platform == "win32":
        try:
            from pygrabber.dshow_graph import FilterGraph

            graph = FilterGraph()
            discovered_names = graph.get_input_devices()
        except Exception:
            discovered_names = []

    devices: List[CameraDevice] = []
    total_slots = len(discovered_names) if discovered_names else max(1, min(max_tested, 4))

    for idx in range(total_slots):
        name = discovered_names[idx] if idx < len(discovered_names) else f"Camera {idx}"
        is_virtual = _is_virtual_camera_name(name)

        is_active = False
        res = (1280, 720)

        # Do not probe virtual camera sinks with hardware capture
        if not is_virtual:
            try:
                cap = cv2.VideoCapture(idx)
                if cap.isOpened():
                    ret, frame = cap.read()
                    if ret and frame is not None and frame.size > 0:
                        is_active = True
                        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        if w > 0 and h > 0:
                            res = (w, h)
                cap.release()
            except Exception:
                is_active = False

        devices.append(
            CameraDevice(
                index=idx,
                name=name,
                is_active=is_active,
                is_virtual=is_virtual,
                resolution=res,
            )
        )

    # Ensure at least one fallback device entry if nothing probed
    if not devices:
        devices.append(
            CameraDevice(
                index=0,
                name="Default Camera",
                is_active=True,
                is_virtual=False,
                resolution=(1280, 720),
            )
        )

    return devices


def get_best_default_camera(devices: List[CameraDevice] | None = None) -> int:
    """
    Select the optimal camera index on startup.
    Prioritizes active physical hardware webcams (e.g. HP Wide Vision HD Camera, Logitech)
    over phone streaming bridges (DroidCam, Iriun) and virtual loopbacks.
    """
    cam_list = devices if devices is not None else get_camera_devices()

    # 1. Best match: Active genuine physical webcam (NOT virtual, NOT phone bridge)
    for dev in cam_list:
        if dev.is_active and not dev.is_virtual and not dev.is_phone_bridge:
            return dev.index

    # 2. Secondary match: Any genuine physical camera even if transiently busy
    for dev in cam_list:
        if not dev.is_virtual and not dev.is_phone_bridge:
            return dev.index

    # 3. Third match: Any active physical camera (including phone apps)
    for dev in cam_list:
        if dev.is_active and not dev.is_virtual:
            return dev.index

    # 4. Fallback: First camera
    return cam_list[0].index if cam_list else 0


def list_available_cameras(max_tested: int = 5) -> List[int]:
    """
    Backwards-compatible helper returning working integer camera indices.
    """
    devices = get_camera_devices(max_tested=max_tested)
    working = [dev.index for dev in devices if dev.is_active]
    return working if working else [0]


def get_camera_resolution(camera_index: int = 0) -> tuple[int, int]:
    """
    Query the active resolution of the selected camera index.
    Returns (width, height).
    """
    try:
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            return (1280, 720)

        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()
        return (w, h) if w > 0 and h > 0 else (1280, 720)
    except Exception:
        return (1280, 720)
