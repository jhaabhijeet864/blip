# Blip (blip)

## What This Is

Blip is a viral, open-source gesture-triggered disappearance system for video conferencing (Google Meet, Zoom, Microsoft Teams, Discord). Blip operates with dual architecture:
1. **Zero-Install Chrome Extension (`extension/`)**: Injects into browser meeting tabs via WebRTC stream interception, enabling instant Thanos ash disintegration, Goku flash vanishing, and automatic mic muting without needing OBS or virtual camera drivers.
2. **Native Rust + Tauri Desktop Application (`crates/blip-desktop` + `crates/blip-core`)**: System-level DirectShow virtual camera utility for native desktop meeting clients (Zoom, Teams, Discord) with SIMD particle physics and embedded ONNX neural vision.

- **Official Repository**: `https://github.com/jhaabhijeet864/blip.git`
- **Default Production Branch**: `main`
- **Current Development Branch**: `feat/chrome-extension`

## Core Value

Users can effortlessly choose, configure, and trigger fluid cinematic disappearance effects (Thanos Snap ash disintegration or Goku Instant Transmission) using natural hand gestures in Google Meet without manual coding or terminal commands.

## Current Milestone: v3.0 Blip Extension (Zero-Install Chrome Extension & WebRTC Hijacking)

**Goal:** Build a zero-install Chrome Extension (Manifest V3) and interactive web engine that intercepts Google Meet / Teams / Zoom Web streams locally in the browser, featuring dual visual+audio snap detection, empty room clean plate inpainting, ash particle disintegration, and auto-mute.

**Target features:**
- Chrome Extension Manifest V3 packaging with main-world WebRTC `getUserMedia` stream interception.
- In-browser MediaPipe WASM integration for 21-landmark hand tracking and selfie matting.
- Dual-trigger finger snap kinematics: visual thumb-middle distance check (<0.06) + Web Audio API transient click sound confirmation (<200ms).
- HTML5 Canvas particle ash disintegration physics and Goku Instant Transmission speedlines.
- Automated empty room background plate generator and canvas inpainting.
- Meeting microphone auto-muting on vanish and unmuting on reappear.
- Extension popup interface with on/off switch, manual snap trigger, sensitivity sliders, and hotkey (`Alt+Shift+S`).
- Live interactive browser playground embedded directly into Next.js landing page (`web/`).
- Extension packaging script (`scripts/package_extension.ps1`) producing clean zip distributions.

## Requirements

### Validated

- ✓ **VCAM-01**: Stream processed frames via Virtual Camera (`pyvirtualcam`) compatible with Google Meet and Zoom — Phase 2
- ✓ **VISION-01**: Real-time 3D hand tracking (21 landmarks) with MediaPipe Hands — Phase 2
- ✓ **VISION-02**: Real-time person segmentation and edge matting with MediaPipe Selfie Segmentation — Phase 2
- ✓ **CALIB-01**: 3-second countdown background plate capture and lighting compensation — Phase 2
- ✓ **GEST-01**: Thanos Finger Snap detection (thumb-middle contact + velocity release) — Phase 3
- ✓ **GEST-02**: Goku Instant Transmission detection (two fingers to temple/forehead) — Phase 3
- ✓ **FX-01**: Thanos Snap particle ash disintegration effect (2,000+ drifting particles) — Phase 3
- ✓ **FX-02**: Goku Instant Transmission speedline anime flash vanishing effect — Phase 3
- ✓ **FX-03**: Fluid Reappearance mechanic (re-trigger gesture or hotkey restore) — Phase 3
- ✓ **GUI-01**: Modern dark-mode CustomTkinter desktop interface with live preview canvas — Phase 4
- ✓ **GUI-02**: Gesture-to-Effect mapping matrix with cooldown/sensitivity sliders — Phase 4
- ✓ **PACK-01**: One-click standalone executable packaging via PyInstaller — Phase 5
- ✓ **OSS-01**: Production-grade open-source repository assets (MIT License, README with architecture diagrams, CI/CD, issue templates, Contributing, Security, and Code of Conduct) — Phase 1
- ✓ **RUST-01**: Native Rust camera capture & DirectShow device enumeration pipeline (nokhwa / media-foundation) — Phase 6
- ✓ **ONNX-01**: Local ONNX Runtime (`ort`) inference in Rust for 21-landmark hand tracking and selfie segmentation — Phase 7
- ✓ **SIMD-01**: High-performance SIMD/vectorized particle physics & anime speedlines engine in Rust — Phase 8
- ✓ **RVCAM-01**: Native Rust DirectShow virtual camera sink output for Google Meet / Zoom / Teams — Phase 6
- ✓ **TAURI-01**: Tauri v2 modern desktop frontend with Vite, Tailwind CSS, GPU canvas preview, and mouse-resizable panels — Phase 9
- ✓ **DIST-01**: Single compact native desktop executable distribution (<30MB) and CI/CD pipelines — Phase 10

### Active

- [ ] **EXT-01**: Chrome Extension Manifest V3 structure (`extension/manifest.json`), service worker, and content scripts
- [ ] **EXT-02**: Main-world WebRTC `navigator.mediaDevices.getUserMedia` stream interception returning canvas-streamed video
- [ ] **EXT-03**: In-browser MediaPipe WASM integration for 21-landmark hand tracking and selfie matting
- [ ] **EXT-04**: Web Audio API (`AudioContext` / `AnalyserNode`) transient click sound detector for dual-trigger snap confirmation
- [ ] **EXT-05**: Automated empty room plate calibration and canvas inpainting
- [ ] **EXT-06**: HTML5 Canvas Thanos ash particle disintegration physics and Goku Instant Transmission speedlines
- [ ] **EXT-07**: Meeting microphone auto-muting on vanish and unmuting on reappear
- [ ] **EXT-08**: Extension popup interface (`popup.html` / `popup.ts`) with on/off switch, manual snap trigger, sensitivity sliders, and hotkey (`Alt+Shift+S`)
- [ ] **WEB-01**: Interactive live browser playground embedded directly into `web/` landing page
- [ ] **PACK-02**: Standalone extension zip builder script (`scripts/package_extension.ps1`) for one-click "Load unpacked" distribution

### Out of Scope

- **Cloud Video Processing**: 100% on-device processing via browser WebAssembly and WebGL/Canvas; zero external frame transmission.
- **Paid Paywalls**: Blip remains 100% free and open-source under MIT, providing open access compared to closed ₹99 creator alternatives.
- **Secondary Non-Viral Gestures**: Clenched fist, peace sign, and wave gestures deferred to plugin slots; focus remains on Thanos snap and Goku transmission.

## Context

- Target Browser: Google Chrome, Microsoft Edge, Brave, and Chromium derivatives.
- Injected context: Injected script runs in the main DOM world (`world: "MAIN"`) before page scripts execute, ensuring `navigator.mediaDevices.getUserMedia` interception succeeds prior to Google Meet or Teams stream negotiation.
- Native counterpart: Desktop Tauri v2 application remains fully supported and operational for OS-level virtual camera workflows.

## Constraints

- **Manifest V3 Compliance**: Strictly adhere to Chrome Manifest V3 regulations (no remote hosted code; all WASM and model assets bundled locally).
- **Audio Privacy**: Microphone stream is processed locally for transient click spikes and never recorded or transmitted.
- **Framerate & Performance**: Video processing and canvas particle rendering must sustain 30 FPS on standard laptop hardware without fan overload.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Project Name: `blip` | Cultural homage to Thanos's snap in Marvel lore + instant disappearance. Crisp, iconic, 4-letter star magnet. | ✓ Good |
| Remote Origin: `https://github.com/jhaabhijeet864/blip.git` | Official personal profile repository URL with `main` as default production branch | ✓ Good |
| Desktop Virtual Camera vs Chrome Extension | Dual-architecture: Desktop virtual camera provides OS-level compatibility, while Chrome Extension offers zero-install friction for browser users | ✓ Good |
| Focus on Thanos Snap & Goku IT | Concentrating on the two most viral, culturally iconic effects delivers the highest polish and viral star appeal | ✓ Good |
| Native Rust + Tauri v2 Core | Replaces Python/CustomTkinter to achieve sub-50MB memory footprint, native SIMD particle speed, and modern web UI ergonomics | ✓ Good |
| Main-World WebRTC Stream Interception | Monkey-patching `getUserMedia` inside `world: "MAIN"` eliminates the requirement for virtual camera drivers in Google Meet, Teams Web, and Zoom Web | — In Progress |
| Dual-Trigger Visual + Audio Click Snap | Requiring both thumb-middle visual contact (<0.06) and a sharp audio transient click within 200ms prevents 100% of false triggers during typing or hand gesturing | — In Progress |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-29 for Milestone v3.0: Blip Extension (Zero-Install Chrome Extension & WebRTC Hijacking) initialization*
