# Phase 7: Embedded ONNX Neural Vision & Kinematics — Context & Decisions

**Phase:** Phase 7  
**Status:** Decisions Locked  
**Created:** 2026-10-29  

---

## 1. Core Decisions Locked

### ONNX Model Storage & Bundling
- **Storage Strategy:** Embedded directly into the Rust binary via `include_bytes!()` in `crates/blip-core`.
- **Models:**
  - `hand_landmark.onnx`: 21 3D coordinates detector (compact ~3MB quantized).
  - `selfie_segmentation.onnx`: Real-time person silhouette matting (compact ~1.2MB).
- **Benefit:** 100% self-contained single binary with zero external file path lookups or runtime download dependencies.

### Execution Provider & Hardware Acceleration Strategy
- **Default:** High-throughput multi-threaded CPU execution provider using `ort` (ONNX Runtime v2) with SIMD vectorization.
- **Hardware Acceleration:** Windows DirectML execution provider and optional CUDA execution provider when NVIDIA discrete GPUs and CUDA runtimes are present on the host system.
- **Resilient Fallback:** Automatic chained fallback: `CUDA -> DirectML -> Multi-threaded CPU`. If a user does not have an NVIDIA GPU or DirectML fails, it cleanly steps down to CPU without crashing or dropping frames.

### Tensor Memory Management
- **Zero-Allocation Pipeline:** Static input/output tensor buffers pre-allocated for:
  - Hand Landmark Model: `[1, 3, 224, 224]` float tensor.
  - Person Matting Model: `[1, 3, 256, 256]` float tensor.
- Decoded RGB frames from `CameraCapture` are resized with fast bilinear interpolation and normalized into pre-allocated memory slices.

### Kinematics Engine & Sensitivity Profiles
- **Balanced & Debounced Profile:**
  - **Thanos Finger Snap:**
    - Pinch Phase: Thumb tip (id 4) and Middle tip (id 12) Euclidean distance `< 0.06` normalized units, held for `>= 2` consecutive frames.
    - Snap Release Phase: High separation velocity `> 1.4` units/second within 250ms window.
  - **Goku Instant Transmission:**
    - Index tip (id 8) and Middle tip (id 12) raised in unison.
    - Proximity to face temple/forehead bounding zone `< 0.12` normalized units for `>= 3` consecutive frames.
  - **Debounce & Cooldown:**
    - Finite State Machine (`Idle -> Pinched -> Triggered -> Cooldown`).
    - Configurable cooldown timer (default `1.5s`) to completely eliminate accidental re-triggers during conversation.

---

## 2. Requirements Addressed

- **RONNX-01**: In-memory ONNX Runtime (`ort`) inference engine for 21 3D hand landmarks at >=30 FPS.
- **RONNX-02**: Real-time person silhouette matting and alpha mask generation with bilinear upsampling and gaussian edge feathering.
- **RGST-01**: Native Rust Thanos Finger Snap kinematics detector (thumb-middle contact, pinch hold, explosive velocity release).
- **RGST-02**: Native Rust Goku Instant Transmission detector (dual-finger temple/forehead proximity).
- **RGST-03**: Finite state machine debounce, streak tracking, and configurable cooldown timers.
