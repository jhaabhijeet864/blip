# Directory Structure & File Map

**Date:** 2026-10-29  
**Application:** Blip (`blip`)  

---

## 1. Top-Level Repository Organization

```
snapper/
├── .github/                       # GitHub Actions CI/CD workflows and community templates
│   ├── ISSUE_TEMPLATE/            # Bug report and feature request templates
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── workflows/                 # CI/CD automated workflow definitions
│   │   ├── ci.yml                 # Matrix testing, linting, formatting, security checks
│   │   └── release.yml            # Automated GitHub Release builder & asset publisher
│   └── PULL_REQUEST_TEMPLATE.md   # Standard pull request description template
├── .planning/                     # GSD planning directory and persistent project state
│   ├── codebase/                  # Architectural and structural codebase documentation
│   ├── config.json                # GSD workflow configuration
│   ├── PROJECT.md                 # Project vision, requirements, decisions
│   ├── REQUIREMENTS.md            # Traceability matrix for project requirements
│   ├── ROADMAP.md                 # Phase progression and milestone roadmap
│   └── STATE.md                   # Real-time execution status and continuity
├── assets/                        # Static graphical assets, logos, and vector illustrations
│   ├── icon.svg                   # Vector application icon
│   └── logo.svg                   # Clean vector logomark
├── blip/                          # Core Python package namespace
│   ├── audio/                     # Audio feedback synthesizer
│   │   ├── __init__.py
│   │   └── sound.py               # SoundManager non-blocking audio cues
│   ├── core/                      # Pipeline orchestration and hardware drivers
│   │   ├── __init__.py
│   │   ├── background.py          # Background calibration & lighting compensation
│   │   ├── pipeline.py            # Main VideoPipeline thread orchestrator
│   │   └── vcam.py                # Virtual camera device driver sink
│   ├── effects/                   # Visual effect renderers
│   │   ├── __init__.py
│   │   ├── base.py                # BaseEffect abstract class
│   │   ├── instant_transmission.py# Goku speedline & flash effect
│   │   ├── reappear.py            # Reverse alpha fade effect
│   │   ├── registry.py            # Effect catalog and factory
│   │   └── thanos_dust.py         # Particle ash dissolve simulation
│   ├── gestures/                  # Gesture detectors
│   │   ├── __init__.py
│   │   ├── base.py                # BaseGesture abstract class
│   │   ├── instant_transmission.py# Goku temple-tap detector
│   │   ├── registry.py            # Gesture evaluator and registry
│   │   └── snap.py                # Thanos pinch-and-flick detector
│   ├── ui/                        # Presentation layer
│   │   ├── __init__.py
│   │   └── app_window.py          # CustomTkinter dark-mode desktop window
│   ├── vision/                    # MediaPipe solutions
│   │   ├── __init__.py
│   │   ├── hand_tracker.py        # 3D hand landmark extraction
│   │   └── segmenter.py           # Person segmentation and alpha matting
│   ├── __init__.py                # Package version metadata (__version__ = "0.1.0")
│   ├── __main__.py                # CLI entry point (`python -m blip`)
│   └── config.py                  # BlipConfig dataclass and JSON persistence
├── scripts/                       # Developer automation scripts
│   ├── build_exe.py               # PyInstaller standalone Windows executable builder
│   └── release.py                 # Assistive release helper (version bump & tagging)
├── tests/                         # Automated unit and integration test suite
│   ├── __init__.py
│   ├── test_audio.py              # Tests for audio feedback synthesizer
│   ├── test_effects.py            # Tests for visual effects lifecycle and rendering
│   ├── test_gestures.py           # Tests for gesture recognition heuristics
│   ├── test_pipeline.py           # Tests for pipeline state transitions and video loop
│   ├── test_vcam.py               # Tests for virtual camera sink and driver detection
│   └── test_vision.py             # Tests for MediaPipe hand tracker and selfie segmenter
├── .gitignore                     # Git ignore rules for Python, virtualenvs, and builds
├── CODE_OF_CONDUCT.md             # Contributor Covenant Code of Conduct
├── CONTRIBUTING.md                # Open-source contribution guidelines
├── LICENSE                        # MIT License
├── pyproject.toml                 # Packaging, build system, dependencies, tool configs
├── README.md                      # Hero documentation, architecture overview, quickstart
├── requirements-dev.txt           # Development dependency specifications
├── requirements.txt               # Production dependency specifications
└── SECURITY.md                    # Vulnerability reporting and security policy
```

---

## 2. Key Location Reference

- **Entry Point:** `blip/__main__.py` calls `blip/ui/app_window.py:launch_app()`
- **Pipeline Loop:** `blip/core/pipeline.py:VideoPipeline._run_loop()` and `process_frame()`
- **User Config File:** `~/.blip/config.json` loaded by `blip/config.py:BlipConfig.load()`
- **Packaging Script:** `scripts/build_exe.py`
- **Release Automation:** `scripts/release.py` and `.github/workflows/release.yml`
