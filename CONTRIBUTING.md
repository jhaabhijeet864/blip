# Contributing to Blip

Thank you for your interest in contributing to **Blip**! We welcome bug fixes, documentation improvements, performance optimizations, and **new community gesture & effect plugins**.

---

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any violations to `jhaabhijeet864@gmail.com`.

---

## Development Setup

### 1. Prerequisites
- Python 3.10 or 3.11 (64-bit recommended)
- Git
- Virtual Camera Driver:
  - Windows: OBS Studio (comes with OBS VirtualCam) or Unity Virtual Camera.
  - Linux: `v4l2loopback`
  - macOS: OBS VirtualCam DAL plugin

### 2. Fork and Clone
```bash
git clone https://github.com/jhaabhijeet864/blip.git
cd blip
```

### 3. Setup Virtual Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies in editable mode
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt
pip install -e .
```

### 4. Run Locally
```bash
python -m blip
```

---

## Adding a New Disappearance Effect

Blip uses a modular plugin architecture. To add a new visual effect:

1. Create a new file in `blip/effects/<your_effect_name>.py`.
2. Subclass `BaseEffect` from `blip.effects.base`:
   ```python
   from blip.effects.base import BaseEffect
   import numpy as np


   class MyCustomEffect(BaseEffect):
       def __init__(self, duration_frames: int = 45):
           super().__init__(name="My Custom Effect", duration_frames=duration_frames)

       def reset(self):
           super().reset()

       def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
           # Apply your visual transformation
           # frame: live RGB webcam frame
           # mask: float32 person segmentation mask (0.0 to 1.0)
           # background: calibrated empty room RGB frame
           ...
           return output_frame
   ```
3. Register your effect in `blip/effects/registry.py`.
4. Add a unit test in `tests/test_effects.py`.

---

## Adding a New Gesture Detector

1. Create a detector in `blip/gestures/<gesture_name>.py` extending `BaseGesture`:
   ```python
   from blip.gestures.base import BaseGesture


   class MyGesture(BaseGesture):
       def detect(self, landmarks_3d) -> bool:
           # Inspect the 21 MediaPipe 3D normalized landmarks
           ...
           return is_active
   ```
2. Register it in `blip/gestures/registry.py`.
3. Add synthetic landmark unit tests in `tests/test_gestures.py`.

---

## Running Tests & Linter

```bash
# Run test suite
pytest

# Run linter
ruff check .
```

---

## Submitting a Pull Request

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/mario-warp-pipe-effect
   ```
2. Ensure all tests pass.
3. Commit with clear, concise commit messages following Conventional Commits (e.g., `feat: add Mario warp pipe effect`).
4. Push to your fork and open a Pull Request against the `main` branch.

