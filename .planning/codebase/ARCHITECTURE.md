# System Architecture & Design Patterns

**Date:** 2026-10-29  
**Application:** Blip (`blip`)  

---

## 1. High-Level Architectural Pattern

Blip is designed around a **Producer-Consumer Threaded Video Pipeline** combined with a **State Machine Lifecycle** and a **Pluggable Registry Pattern** for gestures and visual effects.

```
                      +-----------------------------+
                      |       Physical Camera       |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |     Blip VideoPipeline      |
                      |   (Dedicated worker thread) |
                      +--------------+--------------+
                                     |
           +-------------------------+-------------------------+
           |                         |                         |
           v                         v                         v
+---------------------+   +---------------------+   +---------------------+
|   MediaPipe Hands   |   |  Selfie Segmenter   |   |  Background Manager |
| (HandTracker 21 pts)|   |   (Alpha Matting)   |   | (Empty Room Plate)  |
+----------+----------+   +----------+----------+   +----------+----------+
           |                         |                         |
           v                         |                         |
+---------------------+              |                         |
|   Gesture Registry  |              |                         |
| (Snap / Goku IT)    |              |                         |
+----------+----------+              |                         |
           |                         |                         |
           +------------+            |                         |
                        v            v                         v
                  +-------------------------------------------------+
                  |          Finite State Machine & Effects         |
                  |     NORMAL -> CALIBRATING -> DISAPPEARING       |
                  |          -> DISAPPEARED -> REAPPEARING          |
                  +-------------------------+-----------------------+
                                            |
                         +------------------+------------------+
                         |                                     |
                         v                                     v
             +-----------------------+             +-----------------------+
             |   Virtual Camera Sink |             |   CustomTkinter UI    |
             |   (OBS / DirectShow)  |             |  (Live Canvas & HUD)  |
             +-----------------------+             +-----------------------+
                         |
                         v
             +-----------------------+
             |  Google Meet / Zoom   |
             +-----------------------+
```

---

## 2. Core Architectural Layers

### Layer 1: Core Engine (`blip/core/`)
- `pipeline.py`: The orchestrator thread managing frame intake, synchronization, state transitions, and downstream dispatch.
- `background.py`: The reference room plate manager. Captures background frames during a countdown, averages multiple exposures to eliminate camera sensor noise, and applies adaptive LAB luminance compensation for ambient room lighting drift.
- `vcam.py`: OS virtual camera sink with automatic dimension conforming and frame rate capping.

### Layer 2: Vision & Inference (`blip/vision/`)
- `hand_tracker.py`: Thread-safe wrapper around MediaPipe Hands. Extracts 21 3D coordinates normalized between `[0.0, 1.0]`.
- `segmenter.py`: Selfie segmentation wrapper producing edge-feathered alpha masks with Gaussian blurring.

### Layer 3: Gesture Detection Engine (`blip/gestures/`)
- `base.py`: Defines the `BaseGesture` abstract interface and `GestureResult` dataclass.
- `registry.py`: `GestureRegistry` dynamically aggregates active detectors and routes detected gestures to the pipeline.
- `snap.py`: Physics-based heuristic tracking middle-to-thumb pinch compression followed by an explosive flick velocity release.
- `instant_transmission.py`: Spatial geometric detector recognizing parallel index-middle finger extension to the temple with ring-pinky closure.

### Layer 4: Cinematic Effects Engine (`blip/effects/`)
- `base.py`: Defines the `BaseEffect` contract (`start`, `render`, `update`, `stop`, `progress`).
- `registry.py`: `EffectRegistry` cataloging registered effects.
- `thanos_dust.py`: 3,000+ ash particle simulation with organic cubic-noise dissolution and wind turbulence vectors.
- `instant_transmission.py`: Multi-stage anime vanish: speedlines & chromatic aberration, blinding shockwave flash, followed by empty plate.
- `reappear.py`: Smooth reverse alpha fade with celestial shimmer ring.

### Layer 5: User Interface & Presentation (`blip/ui/`)
- `app_window.py`: CustomTkinter dark-mode desktop window. Runs decoupled on the main UI thread, fetching processed frames from the pipeline via thread locks.

---

## 3. Concurrency & Threading Model

To guarantee 30+ FPS without UI stutter:
1. **Main Thread (UI):** Runs the CustomTkinter Tk event loop, user controls, configuration sliders, and canvas redraws at 30ms intervals (`self.after`).
2. **Pipeline Worker Thread (`BlipPipelineThread`):** Dedicated background daemon thread running camera capture, MediaPipe inference, particle math, and pyvirtualcam delivery.
3. **Sound Dispatch Threads:** Asynchronous transient threads spawned by `SoundManager` for non-blocking audio cues.
4. **Hotkey Listener Thread:** Daemon listener managed by `pynput.keyboard.GlobalHotKeys`.
