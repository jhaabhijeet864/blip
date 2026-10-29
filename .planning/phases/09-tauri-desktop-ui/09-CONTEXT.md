# Phase 9: Modern Tauri v2 Desktop Shell & UI Ergonomics — Context & Decisions

**Phase:** Phase 9  
**Status:** Decisions Locked  
**Created:** 2026-10-29  

---

## 1. Core Decisions Locked

### Desktop Framework Architecture
- **Framework:** Tauri v2 (`crates/blip-desktop` and `ui/`).
- **Backend Core:** Direct native Rust dependency on `blip-core`.
- **Frontend Stack:** React 19 + Vite + Tailwind CSS + Lucide React icons.
- **Resource Footprint:** Native Windows WebView2 host operating under 50MB RAM with zero Python runtime dependency.

### Video Preview & Canvas Streaming Architecture
- **High-Throughput IPC:** The React frontend polls/streams binary frames from Tauri's IPC channel (`tauri::command` `get_preview_frame`) or direct ArrayBuffer transfer.
- **Direct Canvas 2D Blit:** Decoded RGBA image data is painted into an HTML5 `<canvas>` via `ImageData` and `ctx.putImageData`, maintaining a steady 30+ FPS preview with sub-10ms render latency.
- **Offline / Standby Diagnostics:** When disconnected, draws the sleek dark-card `#13151A` diagnostic viewfinder HUD with device status and troubleshooting guidance.

### UI Ergonomics & Mouse-Draggable Sidebar Resizer
- **Layout Architecture:**
  - **Stage (Left):** Hero camera viewfinder canvas with 16:9 aspect-ratio letterboxing, HUD badges ("LIVE STREAMING", "OBS Virtual Camera Ready", "FPS: 30.0"), and status overlays.
  - **Vertical Splitter:** An interactive 6px draggable divider bar (`cursor-col-resize`) between the stage and the sidebar.
    - Captures mouse events (`pointerdown`, `pointermove`, `pointerup`).
    - Constrains sidebar width between `280px` (compact) and `520px` (expanded).
    - Persists chosen width in `localStorage` so resizing survives window minimization, maximization, and application restarts.
  - **Studio Control Center (Right):**
    - **Camera & Output:** Dropdown listing detected webcams with friendly names. By default, auto-selects genuine physical hardware webcams (`HP Wide Vision HD Camera`) and demotes phone bridges (`DroidCam`, `Iriun`) to prevent black screen confusion.
    - **Empty Room Calibration:** "Calibrate Background (3s Countdown)" button with active countdown timer badge.
    - **Gesture-to-Effect Mapping:** Interactive dropdowns mapping Finger Snap and Temple Tap to Thanos or Goku effects.
    - **Instant Action Triggers:** One-click test triggers:
      - `Snap Dust` (violet `#8b5cf6`)
      - `Goku Vanish` (orange `#f97316`)
      - `Reappear Live (Ctrl+Alt+S)` (emerald `#10b981`)
    - **Audio Feedback:** Switch toggle for sound cues.

### Settings Persistence
- **Storage Path:** `~/.blip/config.json`.
- **Schema:** JSON structure storing `camera_index`, `effect_snap`, `effect_goku`, `sound_enabled`, and `sidebar_width`.

---

## 2. Requirements Addressed

- **TAURI-01**: Lightweight Tauri v2 application shell with native Windows WebView2 integration (<50MB RAM footprint).
- **TUI-01**: Modern Google Meet-inspired dark-mode interface built with React 19, Vite, and Tailwind CSS.
- **TUI-02**: Real-time low-latency video preview rendered onto an HTML5 `<canvas>` via binary buffer streaming.
- **TUI-03**: Mouse-draggable vertical splitter dividing the video stage and settings panel with persistent width storage.
- **TUI-04**: Gesture-to-Effect mapping matrix, live FPS / landmark HUD toggle, and calibration controls.
- **TCFG-01**: JSON user configuration persistence (`~/.blip/config.json`) with backwards compatibility.
