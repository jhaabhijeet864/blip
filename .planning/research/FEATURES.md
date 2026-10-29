# Feature Research: Full Native Rust + Tauri v2 Core

**Domain:** Real-Time Computer Vision & Virtual Camera Desktop Utility  
**Researched:** 2026-10-29  
**Confidence:** HIGH  

---

## 1. Feature Categories

### A. Camera Management & Hardware Interfacing
- **Table Stakes:**
  - Enumerate physical cameras with friendly hardware names (e.g., `HP Wide Vision HD Camera`).
  - Distinguish genuine hardware cameras from phone bridge emulators (`DroidCam`, `Iriun`) and virtual loopbacks.
  - Dynamically hot-swap active input cameras without restarting the process.
  - Deliver graceful diagnostics if camera device is disconnected or locked.
- **Differentiators:**
  - Sub-millisecond camera frame grabbing via Windows Media Foundation without OpenCV overhead.
  - Auto-negotiation of highest available resolution/FPS pair (1080p60, 720p60, 720p30).

### B. Neural Vision & Gesture Detection
- **Table Stakes:**
  - 21-landmark 3D hand tracking at >=30 FPS.
  - Thanos finger snap detection (thumb-to-middle contact, compression, followed by high-velocity release).
  - Goku Instant Transmission detection (index + middle finger touch to temple/forehead zone).
  - Finite-state debounce and cooldown timers to prevent false trigger flutter.
- **Differentiators:**
  - SIMD landmark distance math using `glam` Vec3 primitives.
  - Zero-allocation ONNX tensor recycling across frames.

### C. Visual Effects & Cinematic Rendering
- **Table Stakes:**
  - Thanos Dust: Vectorized 2,500+ particle ash disintegration with organic upward curl drift.
  - Goku Instant Transmission: Anime speedlines, shockwave ring, exposure flash, and instant vanish.
  - Background plate capture with 3-second visual countdown and temporal frame averaging.
  - Fluid manual and auto reappear mechanism.
- **Differentiators:**
  - Parallel particle updates across multiple CPU cores via `rayon`.
  - Color-preserved ash sampling directly from user clothing/skin pixels.

### D. Virtual Camera Output
- **Table Stakes:**
  - Broadcast continuous 30+ FPS stream to OS-level OBS Virtual Camera filter.
  - Detect driver readiness on startup and guide user if OBS Virtual Camera is missing.
  - Seamless reception inside Google Meet, Zoom, Microsoft Teams, Slack, Discord.
- **Differentiators:**
  - Zero-copy shared memory buffer writes via the `virtualcam` crate.

### E. Desktop UI & Ergonomics
- **Table Stakes:**
  - Modern dark mode styling with Google Meet aesthetic tokens.
  - Fluid mouse-draggable splitter between video preview and control drawer.
  - Real-time video preview stage with HUD overlays (FPS counter, gesture indicators).
  - Configuration persistence to user profile (`~/.blip/config.json`).
- **Differentiators:**
  - Glassmorphic translucent styling with native Windows 11 Mica/Acrylic support via Tauri v2.
  - Sub-50MB RAM footprint and instant launch time (<0.4s).

---

## 2. Anti-Features (What We Explicitly Avoid)

- **No Heavy Electron Shell:** Electron adds 150MB+ bundle size and excessive RAM overhead. Tauri keeps it under 25MB.
- **No Cloud Inference:** All ONNX inference and vision processing runs 100% locally on the CPU/GPU with complete privacy.
- **No Telemetry / Analytics:** Zero external network calls or tracking.

