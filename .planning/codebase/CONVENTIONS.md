# Coding Conventions & Engineering Guidelines

**Date:** 2026-10-29  
**Application:** Blip (`blip`)  

---

## 1. Code Style & Tooling

- **Linter & Formatter:** `ruff` configured in `pyproject.toml`.
  - Target Python version: `py310`
  - Maximum line length: `100` characters
  - Lint rule selection: `E` (pycodestyle errors), `F` (pyflakes), `W` (pycodestyle warnings), `I` (isort import sorting).
  - Ignored rules: `E501` (Line length violations handled gracefully by formatter).
- **Import Ordering:** Standard library imports first, followed by third-party packages, followed by local `blip` packages, sorted alphabetically with `from __future__ import annotations` at the top of typed files.

---

## 2. Type Hinting & Annotations

- **Modern Python Typing:** Utilize `from __future__ import annotations` across all Python source modules to allow clean union syntax (`int | None` instead of `Optional[int]`, `list[str]` instead of `List[str]`).
- **Dataclasses:** Used extensively for domain models:
  - `BlipConfig` in `blip/config.py`
  - `HandLandmarkData` in `blip/vision/hand_tracker.py`
  - `GestureResult` in `blip/gestures/base.py`

---

## 3. Design Patterns & Interfaces

- **Abstract Base Classes:**
  - `BaseGesture` (`blip/gestures/base.py`): Subclasses must implement `detect(landmarks, image_shape) -> GestureResult` and `reset() -> None`.
  - `BaseEffect` (`blip/effects/base.py`): Subclasses must implement `start(initial_frame, mask, background)`, `render(frame, mask, background) -> np.ndarray`, and `update() -> None`.
- **Registry Pattern:** Decouples gesture detection and effect rendering from the main execution pipeline. New gestures or visual effects can be registered in `GestureRegistry` or `EffectRegistry` without modifying `VideoPipeline`.
- **Resource Management (RAII / Context Managers):**
  - OpenCV cameras and MediaPipe models implement explicit `close()` or `release()` methods.
  - `VirtualCameraSink` implements `__enter__` and `__exit__` context management for safe device closure.

---

## 4. Error Handling & Defensive Programming

- **Silent Audio / Driver Fallbacks:** Hardware interfaces (such as virtual camera sinks or Windows sound synthesizers) must gracefully degrade:
  - Missing virtual camera drivers raise descriptive `VirtualCameraDriverNotFoundError` with installation instructions.
  - Audio errors in `blip/audio/sound.py` are caught and suppressed to prevent crashing video pipelines.
  - MediaPipe landmark drops fall back to cached states or empty hands without throwing index errors.
- **Corrupted State Protection:** `BlipConfig.load()` catches JSON parsing exceptions and falls back to safe default configuration values rather than crashing on launch.
