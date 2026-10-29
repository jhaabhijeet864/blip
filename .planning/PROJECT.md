# Blip (blip)

## What This Is

Blip is a viral, open-source gesture-triggered virtual camera application for video conferencing (Google Meet, Zoom, Microsoft Teams, Discord). Operating as a standalone desktop utility, it outputs an OS-level virtual camera stream that allows users to snap their fingers like Thanos or tap their temple like Goku to vanish from awkward meetings into a pre-captured empty room plate with cinematic visual effects.

- **Official Repository**: `https://github.com/jhaabhijeet864/blip.git`
- **Default Production Branch**: `main`

## Core Value

Users can effortlessly choose, configure, and trigger fluid cinematic disappearance effects (Thanos Snap ash disintegration or Goku Instant Transmission) using natural hand gestures in Google Meet without manual coding or terminal commands.

## Requirements

### Validated

(None yet — greenfield project initialization)

### Active

- [ ] **VCAM-01**: Stream processed frames via Virtual Camera (`pyvirtualcam`) compatible with Google Meet and Zoom
- [ ] **VISION-01**: Real-time 3D hand tracking (21 landmarks) with MediaPipe Hands
- [ ] **VISION-02**: Real-time person segmentation and edge matting with MediaPipe Selfie Segmentation
- [ ] **CALIB-01**: 3-second countdown background plate capture and lighting compensation
- [ ] **GEST-01**: Thanos Finger Snap detection (thumb-middle contact + velocity release)
- [ ] **GEST-02**: Goku Instant Transmission detection (two fingers to temple/forehead)
- [ ] **FX-01**: Thanos Snap particle ash disintegration effect (2,000+ drifting particles)
- [ ] **FX-02**: Goku Instant Transmission speedline anime flash vanishing effect
- [ ] **FX-03**: Fluid Reappearance mechanic (re-trigger gesture or hotkey restore)
- [ ] **GUI-01**: Modern dark-mode CustomTkinter desktop interface with live preview canvas
- [ ] **GUI-02**: Gesture-to-Effect mapping matrix with cooldown/sensitivity sliders
- [ ] **PACK-01**: One-click standalone executable packaging via PyInstaller
- [ ] **OSS-01**: Production-grade open-source repository assets (MIT License, README with architecture diagrams, CI/CD, issue templates, Contributing, Security, and Code of Conduct)

### Out of Scope

- **Browser-only Chrome Extension**: Brittle WebRTC DOM monkey-patching in Google Meet breaks with internal Meet updates and fails in desktop Zoom/Teams.
- **Secondary Gestures for v1**: Peace signs, open palm stop, and clenched fist deferred to community plugin extensions (v1.1+) to ensure maximum polish on Thanos & Goku.
- **Heavy Cloud Inference**: 100% local on-device processing for zero latency and complete camera privacy.

## Context

- Target OS: Windows (primary) with cross-platform architecture.
- Integrates seamlessly with Google Meet via OBS Virtual Camera / DirectShow virtual webcam drivers.
- Machine already has OBS Studio and Windows Virtual Camera infrastructure installed.

## Constraints

- **Python Runtime**: Python 3.10 virtual environment (`.venv`) utilized for full MediaPipe and PyVirtualCam stability.
- **Latency / Frame Rate**: Entire vision + FX rendering loop must maintain >= 30 FPS at 720p/1080p.
- **Privacy & Security**: Zero telemetry or external transmission of video frames; fully offline-capable.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Project Name: `blip` | Cultural homage to Thanos's snap in Marvel lore + instant disappearance. Crisp, iconic, 4-letter star magnet. | ✓ Good |
| Remote Origin: `https://github.com/jhaabhijeet864/blip.git` | Official personal profile repository URL with `main` as default production branch | ✓ Good |
| Desktop Virtual Camera vs Chrome Extension | Virtual Camera works natively across Google Meet, Zoom, Teams, Discord without browser sandbox limitations | — Pending |
| Focus on Thanos Snap & Goku IT for v1 | Concentrating on the two most viral, culturally iconic effects delivers the highest polish and viral star appeal | — Pending |
| CustomTkinter for GUI | Lightweight, modern dark aesthetic, high DPI support, and easy PyInstaller bundling without PyQt's heavy licensing overhead | — Pending |

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
*Last updated: 2026-10-29 after repository naming to blip and remote origin configuration*
