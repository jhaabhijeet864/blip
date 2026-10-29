# Requirements: Blip / Snapper (blip-cam)

**Defined:** 2026-10-29
**Core Value:** Users can effortlessly choose, configure, and trigger fluid cinematic disappearance effects (Thanos Snap ash disintegration or Goku Instant Transmission) using natural hand gestures in Google Meet without manual coding or terminal commands.

## v1 Requirements

Requirements for initial release (Milestone 1 — The Viral Flagships). Each maps directly to roadmap phases.

### Core Virtual Camera & Video Pipeline

- [ ] **VCAM-01**: Application can capture physical webcam feed at 720p/1080p and 30 FPS.
- [ ] **VCAM-02**: Application outputs processed video to an OS virtual camera (`pyvirtualcam`), recognized automatically by Google Meet and Zoom.
- [ ] **VCAM-03**: Application detects whether a Virtual Camera driver (e.g. OBS VirtualCam) is installed and provides clear guidance if missing.

### Vision & Tracking

- [ ] **VISN-01**: Real-time 21-landmark hand detection using MediaPipe Hands with normalized 3D coordinates.
- [ ] **VISN-02**: Real-time person silhouette extraction using MediaPipe Selfie Segmentation with edge feathering.
- [ ] **VISN-03**: Background plate calibration module with a 3-second countdown timer and adaptive lighting compensation.

### Flagship Gesture Recognizers

- [ ] **GEST-01**: Thanos Finger Snap detector (detects thumb-middle contact and explosive velocity release).
- [ ] **GEST-02**: Goku Instant Transmission detector (detects index + middle finger raised to temple/forehead).
- [ ] **GEST-03**: Gesture debounce finite state machine (prevents flutter, supports cooldown periods).

### Flagship Visual Effects (FX) Engine

- [ ] **EFFX-01**: Thanos Snap effect: Progressive particle ash disintegration (2,000+ particles) drifting upward with wind curl noise to empty background.
- [ ] **EFFX-02**: Goku Instant Transmission effect: High-speed anime radial blur lines, pop flash, and instantaneous vanishing.
- [ ] **EFFX-03**: Reappearance mechanism: Re-triggering gesture or hotkey smoothly restores the user.

### Desktop GUI & UX

- [ ] **DGUI-01**: Modern CustomTkinter dark-mode desktop window with responsive layout.
- [ ] **DGUI-02**: Live video preview canvas showing real-time camera output and detection markers.
- [ ] **DGUI-03**: Gesture-to-Effect mapping matrix (select dropdowns for Snap vs IT).
- [ ] **DGUI-04**: Calibration control ("Calibrate Background" with 3-second visual countdown).
- [ ] **DGUI-05**: Settings persistence: User gesture mappings and preferences saved to JSON config.
- [ ] **DGUI-06**: Global keyboard shortcut override (e.g., `Ctrl+Alt+S`) for manual triggering.

### Open-Source & Distribution Standard

- [ ] **OPNS-01**: 10/10 GitHub repository documentation: Comprehensive `README.md` with demo badges, viral demo GIF placeholder, quickstart, Google Meet setup guide, and architecture diagrams.
- [ ] **OPNS-02**: Full community governance: `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- [ ] **OPNS-03**: GitHub Actions CI workflow for automated linting, test suites, and cross-platform verification.
- [ ] **OPNS-04**: PyInstaller standalone executable build script for one-click Windows deployment.

## v2 Requirements

Deferred to future releases (Milestone 2+ / Community Contributions):

- **GEST-EXT**: Peace sign, Open Palm, and Fist Clench gesture detectors.
- **EFFX-EXT**: Ninja smoke bomb cloud poof and Cyberpunk hologram glitch de-rezz effects.
- **SND-01**: Optional audio sound effect playback on virtual microphone.
- **MUTE-01**: Automatic Google Meet mute toggle sync on disappear.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Chrome Extension with WebRTC monkey-patching | Brittle against Google Meet CSP updates, poor performance, does not work with desktop Zoom/Teams. |
| Cloud AI / Remote Server Streaming | Introduces video latency, bandwidth costs, and severe privacy violations. |
| Full 3D VTuber Rigging | Scope creep; focus is specifically on hilarious, snappy disappearance tricks. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OPNS-01, OPNS-02 | Phase 1 | Pending |
| VCAM-01, VCAM-02, VCAM-03, VISN-01, VISN-02, VISN-03 | Phase 2 | Pending |
| GEST-01, GEST-02, GEST-03 | Phase 3 | Pending |
| EFFX-01, EFFX-02, EFFX-03 | Phase 3 | Pending |
| DGUI-01, DGUI-02, DGUI-03, DGUI-04, DGUI-05, DGUI-06 | Phase 4 | Pending |
| OPNS-03, OPNS-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-29*
*Last updated: 2026-10-29 after refinement to Thanos Snap & Goku IT*
