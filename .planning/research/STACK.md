# Stack Research: Full Native Rust + Tauri v2 Core

**Domain:** Real-Time Computer Vision & Virtual Camera Desktop Utility  
**Researched:** 2026-10-29  
**Confidence:** HIGH  

---

## Recommended Stack

### 1. Core Native Technologies

| Technology | Crate / Package | Version | Purpose | Why Recommended |
|:---|:---|:---|:---|:---|
| **Language & Runtime** | Rust | 1.85+ (1.95 detected) | Native performance, memory safety, zero-cost abstractions | Eliminates Python runtime overhead, guarantees no garbage collection jitter during 30/60 FPS video loops. |
| **Desktop Shell** | `tauri` & `tauri-build` | ^2.0 | Multi-window app shell, IPC bridge, system tray, native menus | Extremely lightweight (<15MB executable), uses native OS webview (WebView2 on Windows), sub-50MB RAM usage. |
| **Hardware Video Capture** | `nokhwa` | ^0.10 (`input-native`) | Physical webcam access and DirectShow device enumeration | Direct integration with Windows Media Foundation (MSMF), zero heavy external C++ runtime dependencies. |
| **ONNX Neural Inference** | `ort` | =2.0.0-rc.9 (`download-binaries`) | Running MediaPipe Hand Landmarks & Selfie Segmentation | Safe, high-performance Rust bindings to Microsoft ONNX Runtime; automatic binary download, multi-thread execution provider. |
| **Virtual Camera Sink** | `virtualcam` | ^1.0 | OBS DirectShow loopback frame streaming | Natively writes to OBS Virtual Camera shared memory queue on Windows for Google Meet, Zoom, and Teams. |
| **Particle Physics & Math** | `glam` & `rayon` | ^0.29 & ^1.10 | Vector math, SIMD coordinates, and multi-core particle simulation | High-throughput calculations for 2,500+ particles with zero frame drops. |

---

### 2. Frontend Technologies (Tauri Webview)

| Technology | Package | Purpose | Why Recommended |
|:---|:---|:---|:---|
| **Framework** | React 19 + TypeScript | UI state management & component hierarchy | Robust ecosystem, instant hot-reloading with Vite, strict typing. |
| **Build Tool** | Vite | Frontend bundler & dev server | Sub-100ms HMR, optimized tree-shaken static production bundles. |
| **Styling** | Tailwind CSS | Layout, dark mode, responsive styling | Utility-first CSS, effortless mouse-resizable splitters and modern Google Meet-inspired UI tokens. |
| **Icons & Visuals** | `lucide-react` | Control center icons (webcam, wand, sound, refresh) | Modern, clean, featherweight SVG icon set without bloat. |
| **Live Video Canvas** | HTML5 `<canvas>` / WebGL | Preview stage rendering | Direct pixel manipulation, hardware-accelerated 60 FPS video playback with zero DOM thrashing. |

---

### 3. ONNX Models for Native Inference

| Model | Format | Input Resolution | Purpose | Source / Compatibility |
|:---|:---|:---|:---|:---|
| **MediaPipe Hand Landmark** | ONNX | 224x224 RGB | 21 3D coordinates for finger snap & temple tap detection | Official Google MediaPipe converted to ONNX via tf2onnx / PINTO model zoo. |
| **Selfie Segmentation / RVM** | ONNX | 256x144 / 256x256 RGB | Real-time silhouette alpha mask matting | Robust Person Matting (RVM) or MediaPipe Selfie Segmentation ONNX. |

---

### 4. Alternatives Considered

| Recommended Choice | Alternative | Why Recommended Over Alternative |
|:---|:---|:---|
| `nokhwa` | `opencv` Rust bindings | OpenCV Rust bindings require extensive native MSVC/CMake toolchain setup; `nokhwa` is pure Rust + Windows MSMF. |
| `ort` (ONNX Runtime) | `tract` | `tract` is pure Rust but has limited operator support for dynamic neural models; `ort` provides full Microsoft ONNX Runtime speed. |
| `virtualcam` | Custom C++ DirectShow COM wrapper | `virtualcam` is battle-tested, handles the OBS IPC protocol out of the box, and supports cross-platform. |
| Tauri v2 | Electron | Electron bundles Chromium + Node.js (150MB+ bundle, 200MB+ RAM); Tauri uses native WebView2 (<25MB bundle, 45MB RAM). |

---

### 5. What NOT to Use

- **Do NOT use `opencv` Rust crate:** Requires building OpenCV from source with CMake and LLVM, causing fragile developer environments.
- **Do NOT use Electron:** Heavy resource drain on video call machines.
- **Do NOT stream uncompressed video via Tauri IPC strings:** Base64 JSON IPC causes massive CPU lag. Use local binary IPC channels, shared memory, or local WebSocket for raw frame transfers.

