# Phase 6: Native Rust Video Capture & Virtual Camera Engine — Context & Decisions

**Phase:** Phase 6  
**Status:** Decisions Locked  
**Created:** 2026-10-29  

---

## 1. Core Decisions Locked

### Architecture & Workspace Layout
- **Structure:** Multi-crate Cargo Workspace.
  - `crates/blip-core`: Standalone native Rust library containing camera capture, device enumeration, thread-safe pipeline, and virtual camera sink. Independently testable via `cargo test`.
  - `src-tauri`: Tauri v2 application shell that consumes `blip-core` via Cargo dependency.
- **Root `Cargo.toml`:** Declares workspace members `["crates/blip-core", "src-tauri"]`.

### Resolution & Frame Rate
- **Target Resolution:** 1280x720 (720p widescreen).
- **Target Frame Rate:** 30 FPS (configurable to 60 FPS if supported).
- **Fallback:** If 720p is unsupported by the physical sensor, negotiate nearest standard resolution (e.g. 640x480) without failing.

### Hardware Camera Enumeration & Prioritization
- **Backend:** `nokhwa` with `input-native` feature enabled (utilizing Microsoft Media Foundation / MSMF under the hood).
- **Device Filtering:** Query friendly device names via MSMF/DirectShow.
- **Phone Bridge Tagging:** Recognize phone streaming emulators (`DroidCam`, `Iriun`, `EpocCam`, `Camo`) and tag them (`is_phone_bridge = true`, display label `"DroidCam Video (Phone App)"`).
- **Default Selection:** Automatically preselect genuine physical laptop/USB webcams (e.g. `HP Wide Vision HD Camera`) over phone bridges and virtual devices.

### Dynamic Camera Hot-Swapping
- **Lock-Free Communication:** Decouple capture worker thread from consumer pipelines via `crossbeam-channel` or `arc-swap`.
- **Safe Handle Teardown:** Explicitly stop and drop the existing `nokhwa::Camera` handle before instantiating the new device to prevent Windows Media Foundation error `0xC00D3EA2` (`MF_E_HW_MFT_FAILED_START_STREAMING`).

### Virtual Camera Output (DirectShow / OBS)
- **Output Crate:** `virtualcam` v1 with `BackendKind::Obs`.
- **Target Sink:** OBS Virtual Camera shared memory queue on Windows.
- **Pre-Flight Health Check:** Query registry / DirectShow COM for OBS Virtual Camera filter; if absent, render an inline diagnostic card rather than crashing.

---

## 2. Requirements Addressed

- **RCAP-01**: Native Windows Media Foundation (MSMF) camera capture using `nokhwa` at 720p/1080p and 30/60 FPS.
- **RDEV-01**: Hardware camera enumeration with friendly names, automatically distinguishing genuine physical webcams from phone bridges (`DroidCam`, `Iriun`) and virtual devices.
- **RDEV-02**: Dynamic thread-safe camera hot-swapping without process restart or DirectShow COM lock contention.
- **RVCAM-01**: High-throughput DirectShow virtual camera output via `virtualcam` crate targeting the OBS Virtual Camera shared memory queue.
- **RVCAM-02**: Pre-flight driver health inspection with fallback diagnostics when OBS Virtual Camera driver is absent.

