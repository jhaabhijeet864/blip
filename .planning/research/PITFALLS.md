# Pitfalls Research: Full Native Rust + Tauri v2 Core

**Domain:** Real-Time Computer Vision & Virtual Camera Desktop Utility  
**Researched:** 2026-10-29  
**Confidence:** HIGH  

---

## 1. High-Risk Pitfalls & Prevention Strategies

### Pitfall 1: Video Preview Bottleneck over Tauri IPC
- **The Issue:** Attempting to emit raw video frames to the webview using standard Tauri JSON events (e.g. `app_handle.emit("frame", base64_data)`) at 30 FPS will saturate the main thread, cause massive CPU usage (>50%), and introduce noticeable preview lag.
- **Root Cause:** Base64 encoding + JSON serialization + string copying across the webview IPC boundary for 1280x720 RGB frames (~2.7MB per uncompressed frame).
- **Prevention Strategy:**
  1. Downsample preview frames to 640x360 for UI rendering (the full 720p/1080p is only pushed to the virtual camera sink).
  2. Use a local binary channel: either a local loopback WebSocket streaming raw byte arrays, or Tauri v2's custom protocol asset loader (`tauri://preview-stream`) streaming raw binary chunks directly into an `ArrayBuffer` for `<canvas>` `putImageData` or WebGL texture upload.

---

### Pitfall 2: DirectShow / Media Foundation Device Exclusivity on Windows
- **The Issue:** Webcams on Windows cannot be opened concurrently by multiple processes or threads. If a camera is switched in the UI while the old capture stream is still open, or if an old background thread holds the COM handle, `nokhwa` or Media Foundation will return error `0xC00D3EA2` (`MF_E_HW_MFT_FAILED_START_STREAMING`).
- **Prevention Strategy:**
  1. Explicitly stop and drop the old `nokhwa::Camera` instance before allocating the new device handle.
  2. Implement an atomic hot-swap sequence: pause capture worker -> drop old handle -> verify release (50ms sleep) -> open new device -> resume capture loop.

---

### Pitfall 3: Continuous Tensor Re-Allocation in ONNX Runtime Loop
- **The Issue:** Calling `ort::Tensor::from_array()` inside the frame loop on every single tick triggers continuous heap allocations and deallocations, leading to memory fragmentation and periodic micro-stutters.
- **Prevention Strategy:**
  1. Pre-allocate static input and output tensor buffers matching model input dimensions (e.g. `[1, 3, 224, 224]` for hand tracking).
  2. Copy resized RGB pixel bytes directly into the pre-allocated slice without heap reallocations.

---

### Pitfall 4: Thread Contention Between Video Capture and Inference
- **The Issue:** If neural network inference runs synchronously inside the camera capture loop, a slight latency spike in ONNX execution (e.g. 35ms) causes the webcam frame buffer to overflow, dropping frames in the virtual camera stream.
- **Prevention Strategy:**
  1. Decouple camera capture from inference using a bounded `crossbeam_channel::bounded(1)` queue.
  2. The capture thread runs at high priority, always pushing the freshest frame and discarding stale frames if inference is busy.
  3. The virtual camera output thread maintains steady 30 FPS playback using frame interpolation or repeating the last processed plate.

---

### Pitfall 5: Missing OBS Virtual Camera Driver on User Machine
- **The Issue:** If the user has not installed OBS Studio or its virtual camera DirectShow filter, initializing the `virtualcam` crate with `BackendKind::Obs` will return an initialization error.
- **Prevention Strategy:**
  1. Perform a pre-flight driver check on application startup.
  2. If the driver is missing, keep the local UI preview functional and display an instructional banner with a one-click link or command to install OBS Studio.

---

## 2. Summary Prevention Checklist

| Phase | Check | Verification Method |
|:---|:---|:---|
| **Capture** | Hardware exclusive locks released on switch | Run hot-swap test cycling between devices 10 times |
| **Inference** | Zero per-frame heap allocations | Profile memory usage over 10 minutes of active tracking |
| **IPC** | Low CPU usage on video preview | Confirm total application CPU remains <12% during live streaming |
| **VCam** | DirectShow OBS compatibility | Verify stream reception in Google Meet, Zoom, and Teams |

