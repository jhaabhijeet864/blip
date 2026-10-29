# Requirements: Blip (Milestone v2.0: Full Native Rust + Tauri Core)

**Defined:** 2026-10-29  
**Milestone:** v2.0  
**Core Value:** Users can effortlessly choose, configure, and trigger fluid cinematic disappearance effects (Thanos Snap ash disintegration or Goku Instant Transmission) using natural hand gestures in Google Meet without manual coding or terminal commands.

---

## Validated Requirements (v1.0 Milestone Complete)

- [x] **VCAM-01**: Stream processed frames via Virtual Camera (`pyvirtualcam`) compatible with Google Meet and Zoom — Phase 2
- [x] **VISION-01**: Real-time 3D hand tracking (21 landmarks) with MediaPipe Hands — Phase 2
- [x] **VISION-02**: Real-time person segmentation and edge matting with MediaPipe Selfie Segmentation — Phase 2
- [x] **CALIB-01**: 3-second countdown background plate capture and lighting compensation — Phase 2
- [x] **GEST-01**: Thanos Finger Snap detection (thumb-middle contact + velocity release) — Phase 3
- [x] **GEST-02**: Goku Instant Transmission detection (two fingers to temple/forehead) — Phase 3
- [x] **FX-01**: Thanos Snap particle ash disintegration effect (2,000+ drifting particles) — Phase 3
- [x] **FX-02**: Goku Instant Transmission speedline anime flash vanishing effect — Phase 3
- [x] **FX-03**: Fluid Reappearance mechanic (re-trigger gesture or hotkey restore) — Phase 3
- [x] **GUI-01**: Modern dark-mode CustomTkinter desktop interface with live preview canvas — Phase 4
- [x] **GUI-02**: Gesture-to-Effect mapping matrix with cooldown/sensitivity sliders — Phase 4
- [x] **PACK-01**: One-click standalone executable packaging via PyInstaller — Phase 5
- [x] **OSS-01**: Production-grade open-source repository assets (MIT License, README, CI/CD, issue templates, Contributing, Security, and Code of Conduct) — Phase 1

---

## Active Requirements (Milestone v2.0: Native Rust + Tauri Core)

### 1. Native Rust Video Capture & Virtual Camera Engine

- [ ] **RCAP-01**: Native Windows Media Foundation (MSMF) camera capture using `nokhwa` at 720p/1080p and 30/60 FPS.
- [ ] **RDEV-01**: Hardware camera enumeration with friendly names, automatically distinguishing genuine physical webcams from phone bridges (`DroidCam`, `Iriun`) and virtual devices.
- [ ] **RDEV-02**: Dynamic thread-safe camera hot-swapping without process restart or DirectShow COM lock contention.
- [ ] **RVCAM-01**: High-throughput DirectShow virtual camera output via `virtualcam` crate targeting the OBS Virtual Camera shared memory queue.
- [ ] **RVCAM-02**: Pre-flight driver health inspection with fallback diagnostics when OBS Virtual Camera driver is absent.

### 2. Embedded ONNX Neural Vision & Kinematics

- [ ] **RONNX-01**: In-memory ONNX Runtime (`ort`) inference engine for 21 3D hand landmarks at >=30 FPS.
- [ ] **RONNX-02**: Real-time person silhouette matting and alpha mask generation with bilinear upsampling and gaussian edge feathering.
- [ ] **RGST-01**: Native Rust Thanos Finger Snap kinematics detector (thumb-middle contact, pinch hold, explosive velocity release).
- [ ] **RGST-02**: Native Rust Goku Instant Transmission detector (dual-finger temple/forehead proximity).
- [ ] **RGST-03**: Finite state machine debounce, streak tracking, and configurable cooldown timers.

### 3. High-Performance SIMD Effects Engine & Background Plate

- [ ] **RSIMD-01**: SIMD/vectorized Thanos ash particle disintegration engine (2,500+ particles) with upward curl noise and organic vertical erosion using `glam` and `rayon`.
- [ ] **RSIMD-02**: Goku Instant Transmission anime speedlines, expanding shockwave ring, exposure flash, and instant vanish.
- [ ] **RBG-01**: Background clean plate capture with 3-second countdown and real-time LAB color space luminance compensation.
- [ ] **RREV-01**: Fluid manual and auto reappear mechanics restoring the live camera feed smoothly.

### 4. Tauri v2 Desktop Shell & UI Ergonomics

- [ ] **TAURI-01**: Lightweight Tauri v2 application shell with native Windows WebView2 integration (<50MB RAM footprint).
- [ ] **TUI-01**: Modern Google Meet-inspired dark-mode interface built with React 19, Vite, and Tailwind CSS.
- [ ] **TUI-02**: Real-time low-latency video preview rendered onto an HTML5 `<canvas>` via binary buffer streaming.
- [ ] **TUI-03**: Mouse-draggable vertical splitter dividing the video stage and settings panel with persistent width storage.
- [ ] **TUI-04**: Gesture-to-Effect mapping matrix, live FPS / landmark HUD toggle, and calibration controls.
- [ ] **TCFG-01**: JSON user configuration persistence (`~/.blip/config.json`) with backwards compatibility.

### 5. Packaging & Distribution

- [ ] **RDIST-01**: Compact standalone single executable distribution (<25MB) bundled via Tauri CLI.
- [ ] **RTEST-01**: Automated Rust unit and integration test suite (`cargo test`) verifying capture, kinematics, and effect pipelines.
- [ ] **RCI-01**: GitHub Actions workflow for automated cross-platform Rust compilation, clippy linting, and testing on push/PR.

---

## Future Requirements (v2.1+)

- **GEST-EXT**: Peace sign, Open Palm, and Fist Clench gesture detectors.
- **EFFX-EXT**: Ninja smoke bomb cloud poof and Cyberpunk hologram glitch de-rezz effects.
- **SND-01**: Optional synthesized audio cues on virtual microphone input.
- **MUTE-01**: OS-level global meeting mute synchronization on disappear.

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Chrome Extension with WebRTC monkey-patching | Brittle against Google Meet CSP updates, poor performance, does not work with desktop Zoom/Teams. |
| Cloud AI / Remote Server Streaming | Introduces video latency, bandwidth costs, and severe privacy violations. |
| Full 3D VTuber Rigging | Scope creep; focus is specifically on hilarious, snappy disappearance tricks. |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RCAP-01, RDEV-01, RDEV-02, RVCAM-01, RVCAM-02 | Phase 6 | Planned |
| RONNX-01, RONNX-02, RGST-01, RGST-02, RGST-03 | Phase 7 | Planned |
| RSIMD-01, RSIMD-02, RBG-01, RREV-01 | Phase 8 | Planned |
| TAURI-01, TUI-01, TUI-02, TUI-03, TUI-04, TCFG-01 | Phase 9 | Planned |
| RDIST-01, RTEST-01, RCI-01 | Phase 10 | Planned |

**Coverage:**
- Active requirements: 19 total
- Mapped to phases: 19 / 19 (100%) ✓
