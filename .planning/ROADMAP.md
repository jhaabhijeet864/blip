# Roadmap: Blip (Milestone v2.0: Full Native Rust + Tauri Core)

## Overview

Milestone v2.0 re-engineers Blip into a standalone, single-binary Native Rust core with a modern Tauri v2 desktop shell. By moving from Python/CustomTkinter to Rust, Blip achieves sub-50MB RAM usage, sub-15ms video pipeline latency, and fluid modern UI ergonomics while outputting DirectShow virtual camera feeds to Google Meet, Zoom, and Microsoft Teams.

The roadmap advances across 5 phases (Phases 6 through 10):
1. **Phase 6: Native Rust Video Capture & Virtual Camera Engine**
2. **Phase 7: Embedded ONNX Neural Vision & Kinematics**
3. **Phase 8: High-Performance SIMD Effects Engine & Background Plate**
4. **Phase 9: Modern Tauri v2 Desktop Shell & UI Ergonomics**
5. **Phase 10: Standalone Packaging, Verification & CI/CD**

---

## Phases

### Phase 6: Native Rust Video Capture & Virtual Camera Engine
**Goal**: Build the native Rust video pipeline with Windows Media Foundation capture, DirectShow device enumeration, hardware camera prioritization, dynamic hot-swapping, and OBS Virtual Camera streaming.  
**Depends on**: Milestone 1 complete  
**Requirements**: RCAP-01, RDEV-01, RDEV-02, RVCAM-01, RVCAM-02  
**Success Criteria**:
1. Hardware webcams are enumerated with friendly device names, automatically filtering phone bridges (`DroidCam`, `Iriun`) to prioritize built-in webcams (`HP Wide Vision HD Camera`).
2. Video frames capture smoothly at 720p/1080p and 30/60 FPS via `nokhwa` (MSMF backend).
3. Active input camera can be hot-swapped dynamically without process restart or DirectShow COM lock contention.
4. Processed video frames stream out to OBS Virtual Camera via `virtualcam` crate and are immediately selectable in Google Meet.
5. Missing virtual camera driver is detected on startup with clear status diagnostics.
**Plans**: 2 plans

Plans:
- [x] 06-01: Scaffold Rust Cargo workspace, implement `nokhwa` MSMF capture, and DirectShow device enumeration with phone bridge filtering.
- [x] 06-02: Implement thread-safe camera switching pipeline and `virtualcam` DirectShow OBS sink integration.

---

### Phase 7: Embedded ONNX Neural Vision & Kinematics
**Goal**: Integrate embedded ONNX Runtime (`ort`) in Rust, execute 3D hand tracking and selfie matting, and detect Thanos Snap and Goku Instant Transmission gestures.  
**Depends on**: Phase 6  
**Requirements**: RONNX-01, RONNX-02, RGST-01, RGST-02, RGST-03  
**Success Criteria**:
1. ONNX Runtime loads MediaPipe Hand Landmarks and Selfie Segmentation models in-memory with zero per-frame heap allocations.
2. 21 3D hand landmarks are tracked in real-time at >=30 FPS.
3. Person silhouette alpha mask is computed with bilinear upsampling and gaussian edge feathering.
4. Thanos Finger Snap (thumb-middle contact and explosive velocity release) triggers reliably with zero false flutter.
5. Goku Instant Transmission (dual fingers raised to temple/forehead) detects accurately with finite-state debounce.
**Plans**: 2 plans

Plans:
- [x] 07-01: Integrate `ort` ONNX Runtime session manager, tensor preprocessing, and model inference for hands and segmentation.
- [x] 07-02: Implement native Rust Thanos Snap and Goku Instant Transmission kinematics recognizers and debounce state machine.

---

### Phase 8: High-Performance SIMD Effects Engine & Background Plate
**Goal**: Build multi-threaded SIMD particle physics and anime flash visual effects in Rust, with clean background plate calibration and lighting compensation.  
**Depends on**: Phase 7  
**Requirements**: RSIMD-01, RSIMD-02, RBG-01, RREV-01  
**Success Criteria**:
1. Thanos ash disintegration simulates 2,500+ particles with upward curl drift and organic erosion across CPU cores via `glam` and `rayon`.
2. Goku Instant Transmission effect flashes radial anime speedlines, expanding shockwave ring, and instant vanish.
3. 3-second countdown background calibration captures empty room plate with LAB color luminance compensation.
4. User can smoothly reappear live via gesture or hotkey restore.
**Plans**: 2 plans

Plans:
- [x] 08-01: Implement SIMD particle pool simulation (`glam`/`rayon`) for Thanos dust and Goku anime flash effects.
- [x] 08-02: Implement empty room background plate manager with countdown calibration, LAB luminance compensation, and fluid reappearance.

---

### Phase 9: Modern Tauri v2 Desktop Shell & UI Ergonomics
**Goal**: Create a modern Tauri v2 desktop user interface with React 19, Vite, and Tailwind CSS, featuring binary canvas preview, draggable resizer, and settings persistence.  
**Depends on**: Phase 8  
**Requirements**: TAURI-01, TUI-01, TUI-02, TUI-03, TUI-04, TCFG-01  
**Success Criteria**:
1. Tauri v2 application launches with native Windows WebView2 host under 50MB RAM.
2. Live video preview streams at 30+ FPS directly to an HTML5 `<canvas>` via low-overhead binary channel.
3. Splitter bar between the hero video stage and settings panel is smoothly mouse-draggable with persistent width.
4. User can map gestures to effects, toggle audio feedback, and trigger calibration from the interface.
5. Settings and hardware preferences persist to `~/.blip/config.json`.
**Plans**: 2 plans

Plans:
- [x] 09-01: Initialize Tauri v2 application shell, IPC commands, and low-latency binary preview frame channel.
- [x] 09-02: Build Google Meet-inspired React 19 + Tailwind interface with draggable resizer, HUD overlays, and config persistence.

---

### Phase 10: Standalone Packaging, Verification & CI/CD
**Goal**: Package Blip into a compact single executable (<25MB), verify complete test coverage, and automate GitHub Actions CI/CD workflows.  
**Depends on**: Phase 9  
**Requirements**: RDIST-01, RTEST-01, RCI-01  
**Success Criteria**:
1. Tauri CLI builds a standalone Windows `.exe` installer and portable binary under 25MB.
2. Automated test suite (`cargo test`) verifies device enumeration, ONNX preprocessing, gesture kinematics, and effects.
3. GitHub Actions CI automatically builds, lints with `cargo clippy`, and runs tests on push/PR.
**Plans**: 1 plan

Plans:
- [x] 10-01: Configure Tauri release bundling, complete automated test suite, and establish GitHub Actions CI workflow.

---

## Progress

**Execution Order:**
Phases execute in numeric order: Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Repository Foundation & Standards | 1/1 | Complete | 2026-10-29 |
| 2. Vision & Virtual Camera Pipeline | 2/2 | Complete | 2026-10-29 |
| 3. Flagship Gesture & Effect Engines | 2/2 | Complete | 2026-10-29 |
| 4. Modern Desktop GUI | 1/1 | Complete | 2026-10-29 |
| 5. Packaging, Testing & CI/CD | 1/1 | Complete | 2026-10-29 |
| 6. Native Rust Capture & Virtual Camera | 2/2 | Complete | 2026-10-29 |
| 7. Embedded ONNX Neural Vision & Kinematics | 2/2 | Complete | 2026-10-29 |
| 8. SIMD Effects & Background Plate | 2/2 | Complete | 2026-10-29 |
| 9. Modern Tauri v2 Desktop Shell | 2/2 | Complete | 2026-10-29 |
| 10. Packaging, Verification & CI/CD | 1/1 | Complete | 2026-10-29 |
