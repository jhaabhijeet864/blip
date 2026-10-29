"""
Modern dark-mode desktop graphical user interface for Blip.
Built with CustomTkinter for real-time video preview, calibration, and gesture mapping.
"""

from __future__ import annotations

import sys
from pathlib import Path

import customtkinter as ctk
from PIL import Image, ImageTk

from blip.config import BlipConfig
from blip.core.devices import CameraDevice, get_best_default_camera, get_camera_devices
from blip.core.pipeline import PipelineState, VideoPipeline
from blip.core.vcam import check_virtual_camera_driver
from blip.effects.registry import EffectRegistry
from blip.gestures.registry import GestureRegistry

# Configure dark theme aesthetics
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")


class BlipApp(ctk.CTk):
    """
    Main desktop application window for Blip.
    """

    def __init__(self, config: BlipConfig | None = None):
        super().__init__()
        self.config = config or BlipConfig.load()

        # Window configuration
        self.title("Blip — Disappear from Meetings with a Snap")
        self.geometry("1100x720")
        self.minsize(950, 650)

        # Load window icon if available
        icon_path = Path(__file__).parent.parent.parent / "assets" / "icon.ico"
        if icon_path.exists() and sys.platform == "win32":
            try:
                self.iconbitmap(str(icon_path))
            except Exception:
                pass

        # Initialize registries
        self.gesture_registry = GestureRegistry()
        self.effect_registry = EffectRegistry()

        # Discover and select optimal hardware camera
        self.discovered_devices: list[CameraDevice] = get_camera_devices()
        best_cam_idx = get_best_default_camera(self.discovered_devices)
        active_physical = [
            d.index for d in self.discovered_devices if d.is_active and not d.is_virtual
        ]
        if self.config.camera_index not in active_physical and active_physical:
            self.config.camera_index = best_cam_idx

        # Initialize Pipeline
        self.pipeline = VideoPipeline(config=self.config)
        self.pipeline.gesture_evaluator = self.gesture_registry.evaluate
        self.pipeline.effects_map = self.effect_registry.effects
        self.pipeline.reappear_effect = self.effect_registry.get("reappear")

        # Label pipeline active camera name
        for d in self.discovered_devices:
            if d.index == self.config.camera_index:
                self.pipeline.active_camera_name = d.name
                break

        self.camera_device_map: dict[str, CameraDevice] = {
            dev.display_label: dev for dev in self.discovered_devices
        }

        # UI state
        self._preview_image_tk: ImageTk.PhotoImage | None = None
        self._is_closing = False
        self._hotkey_listener = None

        # Build UI layout
        self._setup_ui()

        # Start hotkey listener
        self._start_hotkey_listener()

        # Start pipeline
        self.pipeline.start()

        # Hook window close event
        self.protocol("WM_DELETE_WINDOW", self.on_closing)

        # Start UI render loop
        self.after(30, self._update_gui_loop)

    def _setup_ui(self) -> None:
        """Construct the two-column grid layout."""
        self.grid_columnconfigure(0, weight=3)  # Video canvas preview
        self.grid_columnconfigure(1, weight=2)  # Controls sidebar
        self.grid_rowconfigure(0, weight=1)

        # ==========================================
        # LEFT PANE: Video Canvas & HUD
        # ==========================================
        self.preview_frame = ctk.CTkFrame(self, corner_radius=12)
        self.preview_frame.grid(row=0, column=0, padx=(16, 8), pady=16, sticky="nsew")
        self.preview_frame.grid_rowconfigure(1, weight=1)
        self.preview_frame.grid_columnconfigure(0, weight=1)

        # Header Title Bar
        title_box = ctk.CTkFrame(self.preview_frame, fg_color="transparent")
        title_box.grid(row=0, column=0, padx=16, pady=(12, 4), sticky="ew")

        title_lbl = ctk.CTkLabel(
            title_box, text="BLIP", font=ctk.CTkFont(size=24, weight="bold")
        )
        title_lbl.pack(side="left")

        subtitle_lbl = ctk.CTkLabel(
            title_box,
            text="  Now you see me. Blip.",
            font=ctk.CTkFont(size=14, slant="italic"),
            text_color="gray70",
        )
        subtitle_lbl.pack(side="left", pady=(4, 0))

        # Live Canvas Label
        self.canvas_label = ctk.CTkLabel(
            self.preview_frame, text="Initializing camera...", fg_color="#18181b", corner_radius=8
        )
        self.canvas_label.grid(row=1, column=0, padx=16, pady=8, sticky="nsew")

        # Footer Status HUD Bar
        status_bar = ctk.CTkFrame(self.preview_frame, fg_color="transparent")
        status_bar.grid(row=2, column=0, padx=16, pady=(4, 12), sticky="ew")

        self.status_badge = ctk.CTkLabel(
            status_bar,
            text="● LIVE",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#22c55e",
        )
        self.status_badge.pack(side="left")

        self.fps_label = ctk.CTkLabel(
            status_bar, text="FPS: 0.0", font=ctk.CTkFont(size=12), text_color="gray60"
        )
        self.fps_label.pack(side="right")

        # ==========================================
        # RIGHT PANE: Controls & Configuration
        # ==========================================
        self.control_panel = ctk.CTkScrollableFrame(
            self, corner_radius=12, label_text="CONTROL CENTER"
        )
        self.control_panel.grid(row=0, column=1, padx=(8, 16), pady=16, sticky="nsew")

        # Section 1: Empty Room Calibration
        sec1_lbl = ctk.CTkLabel(
            self.control_panel,
            text="1. EMPTY ROOM CALIBRATION",
            font=ctk.CTkFont(size=13, weight="bold"),
        )
        sec1_lbl.pack(anchor="w", pady=(8, 4))

        sec1_desc = ctk.CTkLabel(
            self.control_panel,
            text="Snapshot your room without you so Blip can reveal it when you disappear.",
            font=ctk.CTkFont(size=11),
            text_color="gray60",
            wraplength=340,
            justify="left",
        )
        sec1_desc.pack(anchor="w", pady=(0, 8))

        self.btn_calibrate = ctk.CTkButton(
            self.control_panel,
            text="📷 Calibrate Background (3s Countdown)",
            font=ctk.CTkFont(weight="bold"),
            fg_color="#3b82f6",
            hover_color="#2563eb",
            height=38,
            command=self._on_calibrate_clicked,
        )
        self.btn_calibrate.pack(fill="x", pady=4)

        # Section 2: Gesture to Effect Mapping
        sec2_lbl = ctk.CTkLabel(
            self.control_panel,
            text="2. GESTURE-TO-EFFECT MAPPING",
            font=ctk.CTkFont(size=13, weight="bold"),
        )
        sec2_lbl.pack(anchor="w", pady=(20, 4))

        effect_options = [name for _, name in self.effect_registry.list_effects()]
        self.key_by_name = {name: key for key, name in self.effect_registry.list_effects()}

        snap_row = ctk.CTkFrame(self.control_panel, fg_color="transparent")
        snap_row.pack(fill="x", pady=4)
        ctk.CTkLabel(snap_row, text="🤌 Finger Snap:").pack(side="left")
        self.snap_combo = ctk.CTkComboBox(
            snap_row, values=effect_options, command=self._on_mapping_changed
        )
        self.snap_combo.set("Thanos Dust Dissolve")
        self.snap_combo.pack(side="right")

        it_row = ctk.CTkFrame(self.control_panel, fg_color="transparent")
        it_row.pack(fill="x", pady=4)
        ctk.CTkLabel(it_row, text="👆 Instant Transmission:").pack(side="left")
        self.it_combo = ctk.CTkComboBox(
            it_row, values=effect_options, command=self._on_mapping_changed
        )
        self.it_combo.set("Instant Transmission Vanish")
        self.it_combo.pack(side="right")

        # Section 3: Manual Triggers
        sec3_lbl = ctk.CTkLabel(
            self.control_panel,
            text="3. INSTANT ACTION TRIGGERS",
            font=ctk.CTkFont(size=13, weight="bold"),
        )
        sec3_lbl.pack(anchor="w", pady=(20, 4))

        btn_grid = ctk.CTkFrame(self.control_panel, fg_color="transparent")
        btn_grid.pack(fill="x", pady=4)

        btn_thanos = ctk.CTkButton(
            btn_grid,
            text="🌪️ Snap Dust",
            fg_color="#7c3aed",
            hover_color="#6d28d9",
            command=lambda: self._trigger_effect_manual("thanos_dust"),
        )
        btn_thanos.pack(side="left", expand=True, fill="x", padx=(0, 4))

        btn_goku = ctk.CTkButton(
            btn_grid,
            text="⚡ Goku Vanish",
            fg_color="#ea580c",
            hover_color="#c2410c",
            command=lambda: self._trigger_effect_manual("instant_transmission"),
        )
        btn_goku.pack(side="right", expand=True, fill="x", padx=(4, 0))

        self.btn_reappear = ctk.CTkButton(
            self.control_panel,
            text="✨ Reappear Live (or press Ctrl+Alt+S)",
            fg_color="#059669",
            hover_color="#047857",
            height=36,
            command=self.pipeline.trigger_reappear,
        )
        self.btn_reappear.pack(fill="x", pady=(8, 4))

        # Section 4: Hardware & Audio Settings
        sec4_lbl = ctk.CTkLabel(
            self.control_panel,
            text="4. HARDWARE & AUDIO",
            font=ctk.CTkFont(size=13, weight="bold"),
        )
        sec4_lbl.pack(anchor="w", pady=(20, 4))

        cam_row = ctk.CTkFrame(self.control_panel, fg_color="transparent")
        cam_row.pack(fill="x", pady=4)
        ctk.CTkLabel(cam_row, text="📹 Camera:").pack(side="left")

        cam_options = [dev.display_label for dev in self.discovered_devices]
        if not cam_options:
            cam_options = ["Default Camera (Active)"]

        current_cam_label = cam_options[0]
        for dev in self.discovered_devices:
            if dev.index == self.config.camera_index:
                current_cam_label = dev.display_label
                break

        self.cam_combo = ctk.CTkComboBox(
            cam_row,
            values=cam_options,
            command=self._on_camera_changed,
            width=240,
        )
        self.cam_combo.set(current_cam_label)
        self.cam_combo.pack(side="right")

        self.audio_switch = ctk.CTkSwitch(
            self.control_panel,
            text="🔊 Sound Cues (Snap / Zap / Chime)",
            command=self._on_audio_toggled,
        )
        if self.config.sound_enabled:
            self.audio_switch.select()
        else:
            self.audio_switch.deselect()
        self.audio_switch.pack(anchor="w", pady=(8, 4))

        # Section 5: Virtual Camera Integration
        sec5_lbl = ctk.CTkLabel(
            self.control_panel,
            text="5. GOOGLE MEET CONNECTION",
            font=ctk.CTkFont(size=13, weight="bold"),
        )
        sec5_lbl.pack(anchor="w", pady=(20, 4))

        is_avail, vcam_msg = check_virtual_camera_driver()
        status_color = "#22c55e" if is_avail else "#f59e0b"
        self.vcam_status_lbl = ctk.CTkLabel(
            self.control_panel,
            text=f"● {vcam_msg}",
            font=ctk.CTkFont(size=11),
            text_color=status_color,
            wraplength=340,
            justify="left",
        )
        self.vcam_status_lbl.pack(anchor="w", pady=(0, 6))

        instructions = (
            "How to connect in Google Meet / Zoom:\n"
            "1. In Google Meet / Zoom Settings > Video > Camera\n"
            "2. Select 'OBS Virtual Camera' as your camera device.\n"
            "3. Blip streams your filtered webcam feed directly to the meeting.\n"
            "4. Snap fingers or tap temple to disappear into the empty room!"
        )
        ctk.CTkLabel(
            self.control_panel,
            text=instructions,
            font=ctk.CTkFont(size=11, slant="italic"),
            text_color="gray60",
            justify="left",
        )

    def _on_audio_toggled(self) -> None:
        """Toggle audio cues on or off."""
        is_on = bool(self.audio_switch.get())
        self.config.sound_enabled = is_on
        self.pipeline.sound_manager.enabled = is_on

    def _on_camera_changed(self, choice: str) -> None:
        """Update active webcam input device and trigger dynamic hot-swap."""
        dev = self.camera_device_map.get(choice)
        if dev is not None:
            self.config.camera_index = dev.index
            self.pipeline.switch_camera(dev.index, camera_name=dev.name)
            self.config.save()

    def _on_calibrate_clicked(self) -> None:
        """Initiate background plate calibration."""
        self.pipeline.trigger_calibration(countdown_seconds=3.0)

    def _on_mapping_changed(self, _) -> None:
        """Update active configuration from combo boxes."""
        snap_effect_key = self.key_by_name.get(self.snap_combo.get(), "thanos_dust")
        it_effect_key = self.key_by_name.get(self.it_combo.get(), "instant_transmission")

        self.config.gesture_mappings["snap"] = snap_effect_key
        self.config.gesture_mappings["instant_transmission"] = it_effect_key
        self.config.save()

    def _trigger_effect_manual(self, effect_key: str) -> None:
        """Manually trigger an effect via button."""
        if effect_key in self.pipeline.effects_map:
            eff = self.pipeline.effects_map[effect_key]
            self.pipeline.active_effect = eff

            frame = self.pipeline.latest_preview_frame
            if frame is None:
                import numpy as np

                frame = np.zeros(
                    (self.config.camera_height, self.config.camera_width, 3), dtype=np.uint8
                )

            dummy_mask = (
                self.pipeline.segmenter.process(frame)
                if self.pipeline.segmenter
                else np.ones((frame.shape[0], frame.shape[1]), dtype=np.float32)
            )
            bg = self.pipeline.bg_manager.get_plate(frame)
            eff.start(frame, dummy_mask, bg)
            self.pipeline.state = PipelineState.DISAPPEARING

    def _start_hotkey_listener(self) -> None:
        """Start global hotkey listener (Ctrl+Alt+S) to restore camera."""
        try:
            from pynput import keyboard

            def on_activate():
                self.pipeline.trigger_reappear()

            hotkey = keyboard.HotKey(keyboard.HotKey.parse("<ctrl>+<alt>+s"), on_activate)

            def for_canonical(f):
                return lambda k: f(listener.canonical(k))

            listener = keyboard.Listener(
                on_press=for_canonical(hotkey.press), on_release=for_canonical(hotkey.release)
            )
            listener.daemon = True
            listener.start()
            self._hotkey_listener = listener
        except Exception as e:
            print(f"Hotkey listener notice: {e}")

    def _update_gui_loop(self) -> None:
        """Periodic loop to refresh live preview and status indicators."""
        if self._is_closing:
            return

        # Fetch preview frame from pipeline
        frame = self.pipeline.latest_preview_frame
        if frame is not None:
            # Resize preview to fit UI canvas box while preserving aspect ratio
            label_w = max(400, self.canvas_label.winfo_width())
            label_h = max(300, self.canvas_label.winfo_height())

            h, w, _ = frame.shape
            scale = min(label_w / w, label_h / h)
            new_w, new_h = max(10, int(w * scale)), max(10, int(h * scale))

            img_pil = Image.fromarray(frame).resize((new_w, new_h), Image.Resampling.BILINEAR)
            self._preview_image_tk = ImageTk.PhotoImage(image=img_pil)
            self.canvas_label.configure(image=self._preview_image_tk, text="")

        # Refresh status HUD labels
        if self.pipeline.state == PipelineState.NORMAL:
            self.status_badge.configure(text="● LIVE STREAMING", text_color="#22c55e")
        elif self.pipeline.state == PipelineState.CALIBRATING:
            rem = self.pipeline.bg_manager.countdown_remaining
            self.status_badge.configure(text=f"● CALIBRATING ({rem:.1f}s)", text_color="#3b82f6")
        elif self.pipeline.state == PipelineState.DISAPPEARED:
            self.status_badge.configure(text="● DISAPPEARED (VANISHED)", text_color="#ef4444")
        elif self.pipeline.state == PipelineState.REAPPEARING:
            self.status_badge.configure(text="● REAPPEARING...", text_color="#f59e0b")

        self.fps_label.configure(text=f"FPS: {self.pipeline.current_fps:.1f}")

        # Schedule next tick (~30 FPS refresh rate)
        self.after(33, self._update_gui_loop)

    def on_closing(self) -> None:
        """Gracefully release camera and shutdown threads upon window exit."""
        self._is_closing = True
        self.pipeline.stop()
        self.destroy()


def launch_app():
    """CLI launcher for the Blip GUI desktop application."""
    app = BlipApp()
    app.mainloop()
