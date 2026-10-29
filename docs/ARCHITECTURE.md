# Blip System Architecture

This document describes the technical architecture, threading model, computer vision pipeline, and virtual camera output mechanism of Blip.

---

## 1. High-Level Design

Blip bridges real-time local computer vision with operating-system-level virtual camera drivers. Rather than relying on browser-level DOM hooks or WebRTC interception (which are fragile and break across browser updates), Blip operates as an independent desktop service that outputs a standard webcam feed.

```
[Physical Webcam]
       │  (OpenCV VideoCapture / DirectShow)
       ▼
[Threaded Video Pipeline]
   ├── [1. MediaPipe Hands Tracker]
   │       └── 21 3D Normalized Landmarks
   ├── [2. MediaPipe Selfie Segmenter]
   │       └── Soft Alpha Silhouette Mask
   ├── [3. Gesture Finite State Machine]
   │       └── Streak Tracking & Velocity Detection
   ├── [4. Background Plate Manager]
   │       └── 3s Denoised Plate & LAB Lighting Match
   └── [5. Cinematic FX Engine]
           └── Vectorized NumPy Particle Simulations
       │
       ├──► [pyvirtualcam Sink] ──► [Google Meet / Zoom / Teams]
       └──► [CustomTkinter UI]  ──► [Live Preview Canvas]
```

---

## 2. Threading & Concurrency Model

Video capture and machine learning inference run on a dedicated worker thread (`BlipPipelineThread`) completely decoupled from the desktop UI event loop.

- **Main Thread (UI):** CustomTkinter / Tkinter mainloop handling window events, dropdown selections, and canvas repaints at 30 Hz via non-blocking `root.after()` callbacks.
- **Worker Thread (Pipeline):** Continuously polls the hardware webcam, runs MediaPipe tracking, computes active visual shaders, and pushes frames to `pyvirtualcam`.
- **Thread Synchronization:** Frame buffers and status flags are protected by a thread-safe mutex (`threading.Lock`), ensuring zero frame tearing or race conditions.

---

## 3. Computer Vision Pipeline

### 3.1 Hand Tracking
Hand landmark detection is powered by `mediapipe.solutions.hands`. The pipeline extracts 21 three-dimensional normalized keypoints per hand:
- Wrist coordinate serves as the local origin.
- Palm scale factor is computed as the Euclidean distance from the wrist to the middle MCP knuckle (`MIDDLE_MCP`).
- All inter-finger distances are dynamically normalized by this scale factor, ensuring gestures trigger reliably regardless of camera distance.

### 3.2 Silhouette Alpha Matting
User segmentation uses `mediapipe.solutions.selfie_segmentation`. The output is a `float32` probability map normalized between `0.0` and `1.0`. A Gaussian blur feather filter (`ksize=7x7`) is applied to eliminate aliasing and pixel staircasing along hair and clothing boundaries.

---

## 4. Background Plate Management

Seamless disappearance requires a reference background plate (empty room):
1. **Calibration Countdown:** When the user clicks Calibrate, a 3-second non-blocking countdown initiates, allowing the user to step out of frame.
2. **Noise Reduction:** Once the timer expires, the pipeline accumulates 15 consecutive frames and computes their temporal mean (`np.mean`), removing camera sensor noise.
3. **Adaptive Lighting Compensation:** In live operation, ambient light shifts are normalized using LAB color space luminance ratio matching, preventing harsh contrast seams when transitioning to the background plate.

---

## 5. Virtual Camera Sink

Blip leverages `pyvirtualcam` to expose an OS-native virtual video device:
- **Windows:** Communicates with DirectShow and OBS Virtual Camera DLLs (`backend="obs"`).
- **Linux:** Communicates with the kernel's `v4l2loopback` driver (`/dev/video*`).
- **macOS:** Interfaces with the OBS VirtualCam DAL plugin.

Applications like Google Meet, Zoom, and Microsoft Teams treat Blip identically to a physical USB webcam.

