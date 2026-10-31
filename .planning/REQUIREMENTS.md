# Requirements: Blip (Milestone v3.0: Blip Extension)

**Defined:** 2026-10-29  
**Milestone:** v3.0  
**Core Value:** Users can effortlessly choose, configure, and trigger fluid cinematic disappearance effects (Thanos Snap ash disintegration or Goku Instant Transmission) using natural hand gestures in Google Meet without manual coding or terminal commands.

---

## Validated Requirements (Milestones v1.0 & v2.0 Complete)

### Milestone v1.0 (Python Desktop Prototype)
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
- [x] **OSS-01**: Production-grade open-source repository assets (MIT License, README, CI/CD, issue templates) — Phase 1

### Milestone v2.0 (Full Native Rust + Tauri Core)
- [x] **RCAP-01**: Native Windows Media Foundation (MSMF) camera capture using `nokhwa` at 720p/1080p and 30/60 FPS — Phase 6
- [x] **RDEV-01**: Hardware camera enumeration distinguishing physical webcams from phone bridges (`DroidCam`, `Iriun`) — Phase 6
- [x] **RDEV-02**: Dynamic thread-safe camera hot-swapping without process restart — Phase 6
- [x] **RVCAM-01**: High-throughput DirectShow virtual camera output via `virtualcam` targeting OBS Virtual Camera — Phase 6
- [x] **RVCAM-02**: Pre-flight driver health inspection with fallback diagnostics when OBS Virtual Camera driver is absent — Phase 6
- [x] **RONNX-01**: In-memory ONNX Runtime (`ort`) inference engine for 21 3D hand landmarks at >=30 FPS — Phase 7
- [x] **RONNX-02**: Real-time person silhouette matting and alpha mask generation with gaussian edge feathering — Phase 7
- [x] **RGST-01**: Native Rust Thanos Finger Snap kinematics detector (thumb-middle contact and velocity release) — Phase 7
- [x] **RGST-02**: Native Rust Goku Instant Transmission detector (dual-finger temple proximity) — Phase 7
- [x] **RGST-03**: Finite state machine debounce, streak tracking, and configurable cooldown timers — Phase 7
- [x] **RSIMD-01**: SIMD/vectorized Thanos ash particle disintegration engine with upward curl noise via `glam`/`rayon` — Phase 8
- [x] **RSIMD-02**: Goku Instant Transmission anime speedlines, expanding shockwave ring, and instant vanish — Phase 8
- [x] **RBG-01**: Background clean plate capture with 3-second countdown and real-time LAB luminance compensation — Phase 8
- [x] **RREV-01**: Fluid manual and auto reappear mechanics restoring the live camera feed smoothly — Phase 8
- [x] **TAURI-01**: Lightweight Tauri v2 application shell with native Windows WebView2 integration (<50MB RAM) — Phase 9
- [x] **TUI-01**: Modern Google Meet-inspired dark-mode interface built with React 19, Vite, and Tailwind CSS — Phase 9
- [x] **TUI-02**: Real-time low-latency video preview rendered onto an HTML5 `<canvas>` via binary buffer streaming — Phase 9
- [x] **TUI-03**: Mouse-draggable vertical splitter dividing the video stage and settings panel with persistent width — Phase 9
- [x] **TUI-04**: Gesture-to-Effect mapping matrix, live FPS / landmark HUD toggle, and calibration controls — Phase 9
- [x] **TCFG-01**: JSON user configuration persistence (`~/.blip/config.json`) with backwards compatibility — Phase 9
- [x] **RDIST-01**: Compact standalone single executable distribution (<25MB) bundled via Tauri CLI — Phase 10
- [x] **RTEST-01**: Automated Rust unit and integration test suite (`cargo test`) verifying all pipelines — Phase 10
- [x] **RCI-01**: GitHub Actions workflow for automated cross-platform Rust compilation, clippy, and testing — Phase 10

---

## Active Requirements (Milestone v3.0: Blip Extension)

### 1. WebRTC Interceptor & Extension Shell
- [ ] **EXT-01**: Chrome Extension Manifest V3 packaging (`extension/manifest.json`), service worker, and content script bridge.
- [ ] **EXT-02**: Main-world WebRTC `navigator.mediaDevices.getUserMedia` stream interception piping video into an offscreen processing `<canvas>` and returning `canvas.captureStream(30)`.

### 2. Browser Vision & Audio Click Snap Detector
- [ ] **EXT-03**: In-browser MediaPipe WASM integration for 21-landmark hand tracking and selfie segmentation matting.
- [ ] **EXT-04**: Web Audio API (`AudioContext` / `AnalyserNode`) transient click sound detector running in tandem with visual pinch distance (<0.06) within 200ms window.

### 3. Canvas Shaders, Clean Plate & Auto-Mute
- [ ] **EXT-05**: Automated empty room background plate capture and canvas inpainting.
- [ ] **EXT-06**: HTML5 Canvas Thanos ash particle disintegration physics and Goku Instant Transmission anime speedlines.
- [ ] **EXT-07**: Meeting microphone auto-muting on vanish (`audioTrack.enabled = false` and Meet UI button toggle) and unmuting on return.

### 4. Popup UI, Web Showcase & Distribution
- [ ] **EXT-08**: Extension popup interface (`popup.html` / `popup.ts`) with on/off switch, manual snap trigger, sensitivity sliders, and global hotkey (`Alt+Shift+S`).
- [ ] **WEB-01**: Interactive live browser playground embedded directly into `web/` landing page reusing the shared browser vision & particle engine.
- [ ] **PACK-02**: Standalone extension zip builder script (`scripts/package_extension.ps1`) for one-click "Load unpacked" distribution.

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud AI / Remote Server Streaming | Introduces video latency, bandwidth costs, and severe privacy violations. Everything runs 100% locally in the browser. |
| Monetized Paywalls | Blip is and remains 100% free and open-source under MIT, countering closed ₹99 creator offerings. |
| Full 3D VTuber Rigging | Scope creep; focus is specifically on snappy, viral disappearance effects. |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EXT-01, EXT-02 | Phase 11 | Planned |
| EXT-03, EXT-04 | Phase 12 | Planned |
| EXT-05, EXT-06, EXT-07 | Phase 13 | Planned |
| EXT-08, WEB-01, PACK-02 | Phase 14 | Planned |

**Coverage:**
- Active requirements: 10 total
- Mapped to phases: 10 / 10 (100%)
