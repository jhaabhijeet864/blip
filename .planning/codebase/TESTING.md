# Testing Patterns & Quality Assurance

**Date:** 2026-10-29  
**Application:** Blip (`blip`)  

---

## 1. Testing Framework & Philosophy

- **Test Framework:** `pytest` configured via `pyproject.toml` (`[tool.pytest.ini_options]`).
- **Coverage Tool:** `pytest-cov` generating terminal and HTML reports (`pytest --cov=blip --cov-report=term-missing`).
- **Core Principle:** Hardware-agnostic, deterministic testing. Tests must run fast (<5 seconds) without requiring physical hardware (webcams, GPU devices, physical display servers, or virtual camera drivers).

---

## 2. Test Suite Organization

```
tests/
├── __init__.py
├── test_audio.py              # SoundManager cues, threaded worker exceptions, platform fallback
├── test_config.py             # BlipConfig serialization, defaults, custom paths, corrupted json
├── test_effects.py            # Lifecycle of Thanos Snap, Instant Transmission, Reappear, Registry
├── test_entrypoints.py        # CLI main() invocation, build_exe runner, scripts execution
├── test_gestures.py           # Heuristic math, snap velocities, pose streaks, registry dispatch
├── test_pipeline.py           # VideoPipeline states, background calibration, frame processing
├── test_release_script.py     # Assistive release script version bumping, tagging, dry-run
├── test_vcam.py               # VirtualCameraSink, pyvirtualcam mocking, resolution conform
└── test_vision.py             # MediaPipe HandTracker and SelfieSegmenter synthetic inference
```

---

## 3. Mocking & Synthetic Fixtures

- **Synthetic Scene Generator:**
  - Creates synthetic `(720, 1280, 3)` uint8 RGB arrays, elliptical silhouette alpha masks, and simulated dark background room plates.
- **Virtual Camera Mocking:**
  - `pyvirtualcam.Camera` is mocked during unit tests to test start, send, frame resizing, sleep rate-limiting, and error handling without requiring OS virtual camera drivers installed on CI workers.
- **Landmark Geometries:**
  - Synthetic 21-point hand arrays (`MockPoint(x, y, z)`) representing resting hands, pinch positions, flick separations, and temple poses allow deterministic testing of gesture detection algorithms without webcam feed inputs.

---

## 4. Execution Commands

```bash
# Run entire test suite
pytest

# Run tests with detailed coverage report
pytest --cov=blip --cov-report=term-missing

# Run specific test file
pytest tests/test_pipeline.py -v
```
