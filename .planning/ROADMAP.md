# Roadmap: Blip

## Milestones

- **Milestone v1.0: Python Desktop Prototype** — Phases 1-5 (Complete)
- **Milestone v2.0: Full Native Rust + Tauri Core** — Phases 6-10 (Complete)
- **Milestone v3.0: Blip Extension (Zero-Install Chrome Extension & WebRTC Hijacking)** — Phases 11-14 (In Progress)

---

## Milestone v3.0: Blip Extension

### Phase 11: WebRTC Interceptor & Extension Shell
**Goal**: Build the Chrome Extension Manifest V3 scaffolding, main-world content script injector, and WebRTC `navigator.mediaDevices.getUserMedia` stream interception pipeline returning processed `canvas.captureStream(30)`.  
**Depends on**: Milestone v2.0 complete  
**Requirements**: EXT-01, EXT-02  
**Success Criteria**:
1. Chrome Extension Manifest V3 loads cleanly in Developer mode ("Load unpacked") with valid service worker, permissions, and icons.
2. Injected script executes in `world: "MAIN"` before Google Meet / Teams page scripts load.
3. `navigator.mediaDevices.getUserMedia` interception captures original camera track into hidden `<video>` element and outputs redirected `canvas.captureStream(30)` seamlessly.
4. Meeting site video tiles render the canvas stream without WebRTC renegotiation errors or black frames.
**Plans**: 2 plans

Plans:
- [x] 11-01: Scaffold Chrome Extension Manifest V3 (`extension/manifest.json`), service worker, and main-world injector bridge.
- [x] 11-02: Implement main-world `navigator.mediaDevices.getUserMedia` interception with offscreen video/canvas pipeline.

---

### Phase 12: Browser Vision & Dual-Trigger Snap Kinematics
**Goal**: Integrate browser-native MediaPipe WASM vision for hand landmarks and person segmentation, coupled with Web Audio API transient click sound analysis for 100% false-positive-free snap detection.  
**Depends on**: Phase 11  
**Requirements**: EXT-03, EXT-04  
**Success Criteria**:
1. MediaPipe Tasks Vision WASM runs client-side in the browser, tracking 21 3D hand landmarks and generating person segmentation masks at >=30 FPS.
2. Hand tracking detects thumb-middle fingertip proximity (<0.06 normalized distance) as visual snap arming.
3. Web Audio API `AudioContext` and `AnalyserNode` detect high-frequency transient click sound spikes.
4. Dual-trigger state machine confirms snap only when visual release aligns with audio click spike within 200ms window, eliminating false triggers from typing or talking.
**Plans**: 2 plans

Plans:
- [ ] 12-01: Wire browser MediaPipe Tasks Vision WASM loader, hand landmark tracker, and selfie segmentation alpha matting.
- [ ] 12-02: Implement Web Audio transient click detector and dual visual+audio snap kinematics state machine.

---

### Phase 13: Canvas Shaders, Clean Plate & Auto-Mute
**Goal**: Implement GPU/Canvas 2D Thanos particle ash disintegration physics, Goku anime speedlines, background plate capture with inpainting, and meeting microphone auto-muting.  
**Depends on**: Phase 12  
**Requirements**: EXT-05, EXT-06, EXT-07  
**Success Criteria**:
1. Disintegration effect dissolves user silhouette into 3,000+ ash particles drifting upward with curl noise on an HTML5 `<canvas>`.
2. Goku Instant Transmission effect renders radial anime speedlines, exposure flash, and instant disappearance.
3. Empty room background plate captures automatically during 5-second calibration or via canvas patch inpainting.
4. Disappearing automatically mutes the meeting microphone (disables audio tracks and clicks Meet mute button), and reappearing restores audio instantly.
**Plans**: 2 plans

Plans:
- [ ] 13-01: Implement high-performance HTML5 canvas Thanos ash particle disintegration and Goku speedlines shader engine.
- [ ] 13-02: Implement empty room background plate capture, canvas inpainting, and meeting microphone auto-mute sync.

---

### Phase 14: Popup UI, Web Showcase & Packaging
**Goal**: Build the extension popup interface with configuration controls, embed the live interactive playground on the Next.js landing page, and create the extension packaging automation script.  
**Depends on**: Phase 13  
**Requirements**: EXT-08, WEB-01, PACK-02  
**Success Criteria**:
1. Extension popup provides master on/off toggle, manual "Snap now" trigger, keyboard shortcut (`Alt+Shift+S`), and sensitivity sliders.
2. Next.js landing page (`web/`) features an interactive live browser demo letting visitors test the snap effect without installing anything.
3. Packaging script `scripts/package_extension.ps1` builds clean, zip-packaged distributions ready for release and "Load unpacked".
**Plans**: 2 plans

Plans:
- [ ] 14-01: Build extension popup UI (`popup.html`, `popup.ts`) with controls, settings sync, and hotkey listener.
- [ ] 14-02: Embed live interactive playground into `web/` showcase and implement automated extension zip packaging script.

---

## Completed Milestones

### Milestone v1.0: Python Desktop Prototype (Phases 1-5)
- Phase 1: Repository Foundation & Standards (Complete)
- Phase 2: Vision & Virtual Camera Pipeline (Complete)
- Phase 3: Flagship Gesture & Effect Engines (Complete)
- Phase 4: Modern Desktop GUI (Complete)
- Phase 5: Packaging, Testing & CI/CD (Complete)

### Milestone v2.0: Full Native Rust + Tauri Core (Phases 6-10)
- Phase 6: Native Rust Video Capture & Virtual Camera Engine (Complete)
- Phase 7: Embedded ONNX Neural Vision & Kinematics (Complete)
- Phase 8: High-Performance SIMD Effects Engine & Background Plate (Complete)
- Phase 9: Modern Tauri v2 Desktop Shell & UI Ergonomics (Complete)
- Phase 10: Standalone Packaging, Verification & CI/CD (Complete)
