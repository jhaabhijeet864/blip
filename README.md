<div align="center">

# ⚡ Blip

### *Now you see me. Blip.*

**A viral, high-performance, gesture-triggered virtual camera for Google Meet, Zoom, and Teams.**  
*Snap your fingers like Thanos to dissolve into ash, or tap your temple like Goku to flash-teleport out of awkward meetings.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/downloads/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()
[![Privacy: 100% Offline](https://img.shields.io/badge/Privacy-100%25%20Offline-success.svg)](SECURITY.md)

[Features](#-features) • [Quickstart](#-quickstart) • [How to Use in Google Meet](#-how-to-use-in-google-meet) • [Architecture](#-architecture) • [Custom Effects](#-adding-custom-effects) • [Contributing](#-contributing)

---

```
        🤌 SNAP FINGERS                👉 TAP TEMPLE
              │                              │
              ▼                              ▼
      🌪️ THANOS DUST                  ⚡ INSTANT TRANSMISSION
(Dissolve into 3,000 particles)      (Anime speedlines & vanish)
              │                              │
              └───────────────┬──────────────┘
                              ▼
                 🪑 EMPTY CHAIR REVEALED
            (Colleagues in disbelief on Meet)
```

</div>

---

## 💡 What is Blip?

Ever been trapped in a meeting that could have been an email? Or wanted to make your team's standup unforgettable?

**Blip** is a standalone desktop application that creates an OS-level **Virtual Camera**. It runs local computer vision to watch for specific hand gestures. The moment you trigger one, it renders real-time cinematic visual effects and swaps your live silhouette for a pre-captured empty background frame—making you disappear on screen in real time.

Unlike fragile browser extensions that break with Google Meet updates, Blip acts as a **hardware-like virtual camera**. It works natively inside **Google Meet, Zoom, Microsoft Teams, Discord, Slack, and OBS**.

---

## ✨ Features

- **🤌 The Thanos Snap:** MediaPipe detects thumb-and-middle-finger velocity flick. Your silhouette disintegrates into 2,000+ ash particles simulating wind drift before vanishing into your empty chair.
- **⚡ Goku's Instant Transmission:** Two fingers to the temple triggers radial anime speed lines, a blinding flash overexposure, and an instantaneous cut to the empty room.
- **✨ Fluid Reappearance:** Snap or tap again (or hit `Ctrl+Alt+S`) to seamlessly restore your video feed with zero glitching.
- **📸 3-Second Background Calibration:** Step out of the frame, hit "Calibrate", and Blip captures a pristine, lighting-compensated clean plate of your empty room.
- **🖥️ Zero-Terminal Desktop GUI:** Modern dark-mode interface built with CustomTkinter—live video canvas preview, sensitivity sliders, and dropdown selectors.
- **🔒 100% Local & Private:** Zero cloud calls. No telemetry. Your camera stream never touches the internet.
- **🧩 Modular Effect Engine:** Add your own movie/anime disappearance effects in just 20 lines of clean Python.

---

## 🚀 Quickstart

### Prerequisites
1. **Python 3.10 or 3.11** installed.
2. **Virtual Camera Driver:**
   - **Windows:** [OBS Studio](https://obsproject.com/) (recommended — comes with OBS VirtualCam pre-installed) or Unity Virtual Camera.
   - **Linux:** `v4l2loopback` (`sudo apt install v4l2loopback-dkms`)
   - **macOS:** OBS VirtualCam DAL plugin.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jhaabhijeet864/blip.git
cd blip

# 2. Create and activate a virtual environment
python -m venv .venv

# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install -e .

# 4. Launch Blip!
python -m blip
```

---

## 🎥 How to Use in Google Meet

1. Launch **Blip** on your desktop.
2. In the Blip window, click **"📸 Calibrate Background"**. A 3-second countdown will begin—briefly lean or step out of camera view so Blip can snapshot your empty room.
3. Click **"🚀 Start Virtual Camera"**.
4. Open **Google Meet** in your browser (Chrome, Edge, Brave, or Firefox).
5. In Google Meet, click **More Options (⋮) > Settings > Video**.
6. Under **Camera**, select **"OBS Virtual Camera"** (or your active virtual camera device).
7. Sit in front of the camera, join your meeting, and **snap your fingers**! 🤌🌪️

---

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Capture ["Input"]
        Cam["Physical Webcam\n(OpenCV VideoCapture)"]
    end

    subgraph Vision ["Vision Pipeline"]
        Hands["MediaPipe Hands\n(21 3D Landmarks)"]
        Seg["MediaPipe Selfie Seg\n(Alpha Mask)"]
    end

    subgraph Core ["Blip Engine"]
        FSM["Gesture FSM\n(Debounce & Cooldown)"]
        FX["FX Engine\n(NumPy Vectorized Ash / Anime)"]
        BG["Plate Manager\n(Empty Chair Cache)"]
    end

    subgraph Output ["Output Sink"]
        VCam["pyvirtualcam\n(OS Virtual Camera)"]
        GUI["CustomTkinter\n(Live Preview GUI)"]
    end

    Cam --> Hands
    Cam --> Seg
    Hands --> FSM
    Seg --> FX
    BG --> FX
    FSM --> FX
    FX --> VCam
    FX --> GUI
    VCam -->|"DirectShow / OBS"| GMeet["Google Meet / Zoom / Teams"]
```

---

## 🧩 Adding Custom Effects

Blip's effect engine is designed for community expansion. To create a new disappearance trick:

```python
# blip/effects/mario_pipe.py
import numpy as np
from blip.effects.base import BaseEffect

class MarioPipeEffect(BaseEffect):
    def __init__(self, duration_frames: int = 30):
        super().__init__(name="Mario Warp Pipe", duration_frames=duration_frames)

    def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
        # Translate person silhouette downwards into an imaginary pipe
        progress = self.current_frame / self.duration_frames
        shift_y = int(frame.shape[0] * progress)
        # Combine shifted person over background plate...
        return output_frame
```

Register it in `blip/effects/registry.py` and open a Pull Request!

---

## 🧪 Running Tests

```bash
# Run full unit test suite
pytest

# Run linter
ruff check .
```

---

## 🗺️ Roadmap

- [x] **v0.1.0 (Current):** Open-source foundation, MediaPipe pipeline, Thanos Snap & Goku Instant Transmission, CustomTkinter desktop UI, virtual camera output.
- [ ] **v0.2.0:** Sound effects sync (audio cue via virtual microphone).
- [ ] **v0.3.0:** Ninja Smoke Bomb and Cyberpunk Glitch community effects.
- [ ] **v1.0.0:** One-click standalone `.exe` installer (Inno Setup / PyInstaller release bundle).

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please review our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🛡️ Security & Privacy

Blip takes camera privacy seriously. Read our [Security Policy](SECURITY.md) for details on our strict zero-telemetry and offline guarantee.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
Made with ⚡ by <a href="https://github.com/jhaabhijeet864">Abhijeet Jha</a> and the open-source community.
</div>

