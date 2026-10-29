"""
Webcam device detection and enumeration utilities for Blip.
Discovers active hardware cameras and their capabilities.
"""

from __future__ import annotations

from typing import List

import cv2


def list_available_cameras(max_tested: int = 5) -> List[int]:
    """
    Probe video capture indices to discover accessible physical webcams.
    Returns list of working camera index integers.
    """
    working_indices: List[int] = []

    for idx in range(max_tested):
        try:
            cap = cv2.VideoCapture(idx)
            if cap.isOpened():
                ret, frame = cap.read()
                if ret and frame is not None:
                    working_indices.append(idx)
                cap.release()
        except Exception:
            pass

    # Fallback to index 0 if none probed cleanly
    return working_indices if working_indices else [0]


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
