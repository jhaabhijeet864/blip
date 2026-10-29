# Roadmap: Blip / Snapper (blip-cam)

## Overview

Blip turns the viral "gesture disappearance from video calls" into an iconic, 10/10 open-source desktop virtual camera product. The initial milestone zeroes in on the two legendary viral flagships: Thanos's Finger Snap and Goku's Instant Transmission. The roadmap advances across 5 phases: open-source foundation, vision/vcam core pipeline, flagship gestures & effects, modern desktop GUI, and packaging with CI/CD.

## Phases

- [ ] **Phase 1: Open-Source Repository Foundation & Standards** - Establish repository governance, licensing, open-source best practices, and package scaffolding.
- [ ] **Phase 2: Vision & Virtual Camera Core Pipeline** - Build the high-fps video pipeline with MediaPipe Hand Tracking, Selfie Segmentation, background plate calibration, and pyvirtualcam sink.
- [ ] **Phase 3: Flagship Gesture Engine & Cinematic Effects** - Implement precise Thanos Snap and Goku Instant Transmission detectors, particle ash disintegration, anime vanish, and reappearance.
- [ ] **Phase 4: Modern Desktop GUI & Mapping Matrix** - Create a sleek CustomTkinter interface with live camera preview, gesture-effect mapping, calibration controls, and hotkeys.
- [ ] **Phase 5: Packaging, Testing & CI/CD Release Automation** - Complete automated test suites, PyInstaller standalone binary compilation, and GitHub Actions CI/CD workflows.

---

## Phase Details

### Phase 1: Open-Source Repository Foundation & Standards
**Goal**: Establish a world-class open-source project skeleton with strict standards, license, issue templates, and modern Python package setup.
**Depends on**: Nothing (first phase)
**Requirements**: OPNS-01, OPNS-02
**Success Criteria**:
  1. Complete open-source governance exists: `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and GitHub issue/PR templates.
  2. Python package structure is initialized with `pyproject.toml`, `requirements.txt`, and clean modular namespaces.
  3. Professional `README.md` features badging, viral showcase GIF placeholder, architectural diagrams, quickstart instructions, and Google Meet configuration details.
**Plans**: 1 plan

Plans:
- [ ] 01-01: Scaffold open-source repository structure, governance docs, pyproject configuration, and README.

### Phase 2: Vision & Virtual Camera Core Pipeline
**Goal**: Build a thread-safe, high-performance video capture and virtual camera streaming pipeline with MediaPipe tracking and background plate management.
**Depends on**: Phase 1
**Requirements**: VCAM-01, VCAM-02, VCAM-03, VISN-01, VISN-02, VISN-03
**Success Criteria**:
  1. User's physical webcam is captured at steady 30 FPS without frame lag.
  2. MediaPipe detects 21 hand landmarks and generates smooth alpha segmentation masks of the user's silhouette.
  3. Background calibration captures empty-room plate with countdown timer and provides lighting compensation.
  4. Processed video frames stream out via `pyvirtualcam` and are immediately selectable in Google Meet.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Build MediaPipe vision modules (hand tracker and selfie segmenter) and background plate manager.
- [ ] 02-02: Implement threaded video pipeline and Virtual Camera sink with driver detection.

### Phase 3: Flagship Gesture Engine & Cinematic Effects
**Goal**: Implement robust gesture recognition and cinematic visual effects for the two flagship mechanics (Thanos Snap & Goku Instant Transmission) + Reappearance.
**Depends on**: Phase 2
**Requirements**: GEST-01, GEST-02, GEST-03, EFFX-01, EFFX-02, EFFX-03
**Success Criteria**:
  1. Thanos Snap and Goku Instant Transmission trigger reliably with zero false flutter or flutter debounce.
  2. Thanos Snap particle effect smoothly dissolves the user's silhouette into 2,000+ floating ash particles, revealing the empty room.
  3. Goku Instant Transmission effect flashes anime speedlines and instantly vanishes the user.
  4. User can re-trigger gesture or hotkey to reappear cleanly.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Implement Thanos Snap & Goku IT gesture recognizers, registry, and finite state debounce machine.
- [ ] 03-02: Implement visual effects engine (Thanos ash particles, Goku vanish, and fluid reappearance).

### Phase 4: Modern Desktop GUI & Mapping Matrix
**Goal**: Deliver a polished, zero-terminal desktop user interface where users can customize gesture mappings and control their virtual camera.
**Depends on**: Phase 3
**Requirements**: DGUI-01, DGUI-02, DGUI-03, DGUI-04, DGUI-05, DGUI-06
**Success Criteria**:
  1. App opens in a sleek dark-themed GUI (CustomTkinter) with high-DPI scaling.
  2. Live video preview displays real-time camera feed and landmark tracking status.
  3. Users can map gestures to effects using intuitive dropdown selectors.
  4. "Calibrate Background" button triggers countdown with on-screen visual cues.
  5. Settings and mappings persist automatically to `config.json`.
**Plans**: 1 plan

Plans:
- [ ] 04-01: Build CustomTkinter desktop interface with live canvas preview, gesture-to-effect matrix, and configuration storage.

### Phase 5: Packaging, Testing & CI/CD Release Automation
**Goal**: Package the app into a standalone executable and establish automated test pipelines and GitHub Actions workflows.
**Depends on**: Phase 4
**Requirements**: OPNS-03, OPNS-04
**Success Criteria**:
  1. Test suite (`pytest`) verifies gesture geometry, effect render pipeline, and config persistence.
  2. PyInstaller builds a standalone Windows `.exe` bundling all MediaPipe models and assets.
  3. GitHub Actions CI workflow automatically validates linting and test execution on push/PR.
**Plans**: 1 plan

Plans:
- [ ] 05-01: Implement automated test suite, PyInstaller build script, and GitHub Actions CI workflow.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Repository Foundation & Standards | 0/1 | Ready to plan | - |
| 2. Vision & Virtual Camera Pipeline | 0/2 | Not started | - |
| 3. Flagship Gesture & Effect Engines | 0/2 | Not started | - |
| 4. Modern Desktop GUI | 0/1 | Not started | - |
| 5. Packaging, Testing & CI/CD | 0/1 | Not started | - |
