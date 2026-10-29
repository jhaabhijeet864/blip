# External Integrations & System Interfaces

**Date:** 2026-10-29  
**Application:** Blip (`blip`)  

---

## 1. Operating System Virtual Camera Subsystem

Blip's core capability is streaming processed frames to an OS-level virtual camera so that web conferencing software (Google Meet, Zoom, Microsoft Teams, Discord) can consume it as a regular webcam device:

- **Library Interface:** `pyvirtualcam` (`blip/core/vcam.py`)
- **Supported Backends:**
  - **Windows (Primary):** OBS Virtual Camera (`obs`) and Unity Video Capture DirectShow filter (`unityvideo`).
  - **Linux:** `v4l2loopback` kernel module device (`/dev/videoX`).
  - **macOS:** OBS Virtual Camera DAL plugin.
- **Hardware Abstraction:** `VirtualCameraSink` in `blip/core/vcam.py` abstracts camera setup, frame rate sync (`sleep_until_next_frame`), format conversion (RGB uint8), and automatic image resizing if frame dimensions differ.
- **Diagnostics:** `check_virtual_camera_driver()` in `blip/core/vcam.py` probes driver availability and returns actionable guidance for missing drivers.

---

## 2. Hardware Video Capture (Webcam)

- **Library Interface:** `cv2.VideoCapture` via OpenCV (`blip/core/pipeline.py`).
- **Platform Optimization:**
  - On Windows, uses DirectShow backend (`cv2.CAP_DSHOW`) to avoid driver startup delay and allow explicit resolution negotiation (1280x720 @ 30 FPS).
  - Cross-platform fallback uses `cv2.CAP_ANY`.
- **Resource Management:** Explicit acquisition and graceful `release()` upon pipeline stop or application shutdown.

---

## 3. Computer Vision & Machine Learning Inference

Blip integrates Google MediaPipe for local, edge-accelerated, zero-cloud computer vision inference:

- **MediaPipe Hands:**
  - File: `blip/vision/hand_tracker.py`
  - Solution: `mp.solutions.hands.Hands`
  - Function: Ingests 720p/1080p RGB frames; outputs 21 normalized 3D landmarks (`x, y, z`) per hand with handedness ("Left" / "Right") and detection scores.
- **MediaPipe Selfie Segmentation:**
  - File: `blip/vision/segmenter.py`
  - Solution: `mp.solutions.selfie_segmentation.SelfieSegmentation`
  - Function: Generates soft alpha matte (`0.0` to `1.0` float32) separating user silhouette from physical background; filtered with Gaussian blurring for smooth anti-aliased composite blending.

---

## 4. Audio Subsystem

- **Module:** `blip/audio/sound.py` (`SoundManager`)
- **Interface:** Windows-native `winsound.Beep` for snappy, zero-dependency, non-blocking feedback during snap, teleport, and reappearance transitions.
- **Fallback:** Silent fallback on non-Windows systems or when audio synthesis is unavailable, preventing audio hardware errors from halting video pipelines.

---

## 5. Global Hotkeys & Input Hardware

- **Interface:** `pynput.keyboard.GlobalHotKeys` (`blip/ui/app_window.py`)
- **Keybinding:** Configurable global combination (default: `<ctrl>+<alt>+s`) to instantly vanish or reappear even when the application window is minimized during full-screen meetings.

---

## 6. Cloud & Network Dependencies

- **Telemetry / Network Traffic:** **Zero**. Blip is strictly an offline-first desktop utility. No frames, audio, or telemetry are transmitted over the network.
- **Privacy Assurance:** All processing happens entirely within local system RAM and CPU/GPU memory.
