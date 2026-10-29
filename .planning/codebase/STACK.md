# Technology Stack

**Date:** 2026-10-29  
**Application:** Blip (`blip`)  
**Repository:** `https://github.com/jhaabhijeet864/blip.git`  
**Target Platform:** Windows 10/11 (Primary), cross-platform design for Linux & macOS

---

## 1. Core Languages & Runtime

- **Language:** Python 3.10+ (Standard runtime Python 3.10 virtual environment `.venv`)
- **Package Manager / Build Backend:** `setuptools>=61.0`, `wheel` (Configured via `pyproject.toml`)
- **Execution Target:** Native desktop application running locally on host CPU/GPU; zero cloud dependencies.

---

## 2. Production Dependencies

The production dependencies defined in `pyproject.toml` and `requirements.txt` provide vision, virtual camera, image processing, and UI capabilities:

| Package | Version Constraint | Purpose | Key File References |
|---------|-------------------|---------|---------------------|
| `opencv-python` | `>=4.8.0` | Frame capture via DirectShow, color space conversion (BGR, RGB, LAB), Gaussian filtering, image manipulation | `blip/core/pipeline.py`, `blip/core/background.py` |
| `mediapipe` | `>=0.10.0` | 3D hand tracking (21 landmarks) and real-time selfie segmentation (alpha matting) | `blip/vision/hand_tracker.py`, `blip/vision/segmenter.py` |
| `pyvirtualcam` | `>=0.11.0` | Interfacing with OS virtual webcam drivers (OBS VirtualCam, DirectShow, v4l2loopback) | `blip/core/vcam.py`, `blip/core/pipeline.py` |
| `customtkinter` | `>=5.2.0` | Modern dark-mode desktop user interface widgets and live preview frame | `blip/ui/app_window.py` |
| `pillow` | `>=10.0.0` | In-memory frame conversion (`ImageTk.PhotoImage`) for Tkinter canvas rendering | `blip/ui/app_window.py` |
| `numpy` | `>=1.24.0` | High-performance array math, particle simulation arrays, alpha blending, image matrix operations | `blip/effects/thanos_dust.py`, `blip/effects/instant_transmission.py` |
| `pynput` | `>=1.7.6` | Global system hotkey listener (`<ctrl>+<alt>+s`) for manual disappear/reappear triggers | `blip/ui/app_window.py` |

---

## 3. Development & Tooling Dependencies

Defined in `pyproject.toml` under `[project.optional-dependencies].dev` and `requirements-dev.txt`:

| Tool | Version Constraint | Role |
|------|-------------------|------|
| `pytest` | `>=7.4.0` | Unit test execution and assertion framework |
| `pytest-cov` | `>=4.1.0` | Code coverage reporting and threshold verification |
| `ruff` | `>=0.1.0` | Extremely fast linter and formatter replacing flake8, isort, and black |
| `pyinstaller` | `>=6.0.0` | Bundling Python codebase, MediaPipe models, and Tkinter assets into single-folder / single-file executable |
| `build` | Optional | Standard PEP 517 build frontend for wheel and source tarball distributions |

---

## 4. Configuration & State Storage

- **Configuration File:** Stored at `~/.blip/config.json` via `blip/config.py`.
- **Settings Dataclass:** `BlipConfig` (`blip/config.py`) storing camera index, resolutions, frame rates, gesture-to-effect mappings, sensitivity/cooldowns, and particle counts.
- **Serialization:** Native JSON serialization with graceful default fallback on corrupted configuration files.
