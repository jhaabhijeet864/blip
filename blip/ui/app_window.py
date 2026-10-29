"""
Modern Google Meet-inspired desktop graphical user interface for Blip.
Features a centered 16:9 hero video stage, top floating HUD, bottom floating pill dock,
minimalist settings drawer, and dynamic Light/Dark mode switching.
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
from blip.ui.theme import Theme


class BlipApp(ctk.CTk):
    """
    Main desktop studio application window for Blip.
    Crafted with a minimalist, Google Meet-inspired interface.
    """

    def __init__(self, config: BlipConfig | None = None):
        super().__init__()
        self.config = config or BlipConfig.load()

        # Apply user's saved appearance mode (Light or Dark)
        ctk.set_appearance_mode(getattr(self.config, "theme", "dark"))
        ctk.set_default_color_theme("blue")

        # Window configuration
        self.title("Blip Studio — Gesture Virtual Camera")
        self.geometry("1180x740")
        self.minsize(1020, 640)

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

        # Initialize Video Pipeline
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

        # Start hotkey listener (Ctrl+Alt+S)
        self._start_hotkey_listener()

        # Start pipeline
        self.pipeline.start()

        # Hook window close event
        self.protocol("WM_DELETE_WINDOW", self.on_closing)

        # Start UI render loop (30ms refresh)
        self.after(30, self._update_gui_loop)

    def _setup_ui(self) -> None:
        """Construct the Google Meet-style layout."""
        self.grid_columnconfigure(0, weight=7)  # Studio Video Stage (72% width)
        self.grid_columnconfigure(1, weight=3)  # Settings Drawer (28% width)
        self.grid_rowconfigure(0, weight=1)

        # =========================================================================
        # LEFT PANE: Hero Video Stage (Google Meet Call Tile)
        # =========================================================================
        self.stage_frame = ctk.CTkFrame(
            self,
            fg_color=Theme.STAGE_BG,
            corner_radius=Theme.RADIUS_STAGE,
            border_width=1,
            border_color=Theme.STAGE_BORDER,
        )
        self.stage_frame.grid(row=0, column=0, padx=(16, 8), pady=16, sticky="nsew")
        self.stage_frame.grid_columnconfigure(0, weight=1)
        self.stage_frame.grid_rowconfigure(0, weight=0)  # Top HUD Bar
        self.stage_frame.grid_rowconfigure(1, weight=1)  # Video Canvas
        self.stage_frame.grid_rowconfigure(2, weight=0)  # Floating Action Dock

        # -------------------------------------------------------------------------
        # 1. Top Floating HUD Bar
        # -------------------------------------------------------------------------
        top_hud = ctk.CTkFrame(self.stage_frame, fg_color="transparent")
        top_hud.grid(row=0, column=0, padx=16, pady=(12, 6), sticky="ew")

        # Left HUD: Brand Monogram + Status Badge
        hud_left = ctk.CTkFrame(top_hud, fg_color="transparent")
        hud_left.pack(side="left")

        chip_brand = ctk.CTkFrame(
            hud_left,
            fg_color=Theme.CHIP_BG,
            corner_radius=Theme.RADIUS_CHIP,
            border_width=1,
            border_color=Theme.CHIP_BORDER,
        )
        chip_brand.pack(side="left", padx=(0, 8))

        ctk.CTkLabel(
            chip_brand,
            text="⚡ BLIP STUDIO",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11, weight="bold"),
            text_color=Theme.TEXT_PRIMARY,
        ).pack(padx=10, pady=4)

        chip_status = ctk.CTkFrame(
            hud_left,
            fg_color=Theme.CHIP_BG,
            corner_radius=Theme.RADIUS_CHIP,
            border_width=1,
            border_color=Theme.CHIP_BORDER,
        )
        chip_status.pack(side="left")

        self.status_badge = ctk.CTkLabel(
            chip_status,
            text="● LIVE STREAMING",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11, weight="bold"),
            text_color=Theme.STATUS_LIVE,
        )
        self.status_badge.pack(padx=10, pady=4)

        # Right HUD: Stream FPS & Hotkey
        hud_right = ctk.CTkFrame(top_hud, fg_color="transparent")
        hud_right.pack(side="right")

        chip_fps = ctk.CTkFrame(
            hud_right,
            fg_color=Theme.CHIP_BG,
            corner_radius=Theme.RADIUS_CHIP,
            border_width=1,
            border_color=Theme.CHIP_BORDER,
        )
        chip_fps.pack(side="left", padx=(0, 8))

        self.fps_label = ctk.CTkLabel(
            chip_fps,
            text="30.0 FPS • 720p HD",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            text_color=Theme.TEXT_MUTED,
        )
        self.fps_label.pack(padx=10, pady=4)

        chip_hotkey = ctk.CTkFrame(
            hud_right,
            fg_color=Theme.CHIP_BG,
            corner_radius=Theme.RADIUS_CHIP,
            border_width=1,
            border_color=Theme.CHIP_BORDER,
        )
        chip_hotkey.pack(side="left")

        ctk.CTkLabel(
            chip_hotkey,
            text="⌨ Ctrl+Alt+S",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            text_color=Theme.TEXT_FAINT,
        ).pack(padx=10, pady=4)

        # -------------------------------------------------------------------------
        # 2. Hero Video Canvas Container
        # -------------------------------------------------------------------------
        self.video_container = ctk.CTkFrame(self.stage_frame, fg_color="transparent")
        self.video_container.grid(row=1, column=0, padx=16, pady=4, sticky="nsew")
        self.video_container.grid_rowconfigure(0, weight=1)
        self.video_container.grid_columnconfigure(0, weight=1)

        self.canvas_label = ctk.CTkLabel(
            self.video_container,
            text="Connecting to camera...",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=14),
            fg_color=Theme.CANVAS_BG,
            text_color=Theme.TEXT_MUTED,
            corner_radius=Theme.RADIUS_CARD,
        )
        self.canvas_label.grid(row=0, column=0, sticky="nsew")

        # -------------------------------------------------------------------------
        # 3. Google Meet Floating Action Dock
        # -------------------------------------------------------------------------
        dock_container = ctk.CTkFrame(self.stage_frame, fg_color="transparent")
        dock_container.grid(row=2, column=0, padx=16, pady=(10, 16), sticky="ew")

        dock = ctk.CTkFrame(
            dock_container,
            fg_color=Theme.DOCK_BG,
            corner_radius=Theme.RADIUS_DOCK,
            border_width=1,
            border_color=Theme.DOCK_BORDER,
        )
        dock.pack(anchor="center")

        # Dock Action Buttons
        self.btn_calibrate = ctk.CTkButton(
            dock,
            text="📸 Calibrate Room",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12, weight="bold"),
            fg_color=Theme.BTN_CALIBRATE,
            hover_color=Theme.BTN_CALIBRATE_HOVER,
            text_color=Theme.BTN_CALIBRATE_TEXT,
            height=38,
            corner_radius=19,
            command=self._on_calibrate_clicked,
        )
        self.btn_calibrate.pack(side="left", padx=6, pady=6)

        btn_thanos = ctk.CTkButton(
            dock,
            text="🤌 Snap Dust",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12, weight="bold"),
            fg_color=Theme.BTN_SNAP,
            hover_color=Theme.BTN_SNAP_HOVER,
            text_color="#ffffff",
            height=38,
            corner_radius=19,
            command=lambda: self._trigger_effect_manual("thanos_dust"),
        )
        btn_thanos.pack(side="left", padx=6, pady=6)

        btn_goku = ctk.CTkButton(
            dock,
            text="⚡ Goku Vanish",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12, weight="bold"),
            fg_color=Theme.BTN_GOKU,
            hover_color=Theme.BTN_GOKU_HOVER,
            text_color="#ffffff",
            height=38,
            corner_radius=19,
            command=lambda: self._trigger_effect_manual("instant_transmission"),
        )
        btn_goku.pack(side="left", padx=6, pady=6)

        self.btn_reappear = ctk.CTkButton(
            dock,
            text="✨ Reappear Live",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12, weight="bold"),
            fg_color=Theme.BTN_REAPPEAR,
            hover_color=Theme.BTN_REAPPEAR_HOVER,
            text_color="#ffffff",
            height=38,
            corner_radius=19,
            command=self.pipeline.trigger_reappear,
        )
        self.btn_reappear.pack(side="left", padx=6, pady=6)

        # =========================================================================
        # RIGHT PANE: Minimalist Settings Drawer
        # =========================================================================
        self.control_panel = ctk.CTkScrollableFrame(
            self,
            fg_color=Theme.CARD_BG,
            corner_radius=Theme.RADIUS_STAGE,
            border_width=1,
            border_color=Theme.CARD_BORDER,
        )
        self.control_panel.grid(row=0, column=1, padx=(8, 16), pady=16, sticky="nsew")

        # -------------------------------------------------------------------------
        # Drawer Header: Title + Light/Dark Segmented Switch
        # -------------------------------------------------------------------------
        header_frame = ctk.CTkFrame(self.control_panel, fg_color="transparent")
        header_frame.pack(fill="x", padx=12, pady=(12, 16))

        title_lbl = ctk.CTkLabel(
            header_frame,
            text="Studio Settings",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=16, weight="bold"),
            text_color=Theme.TEXT_PRIMARY,
        )
        title_lbl.pack(side="left")

        # Segmented Light / Dark Switch
        self.theme_segment = ctk.CTkSegmentedButton(
            header_frame,
            values=["☀️ Light", "🌙 Dark"],
            command=self._on_theme_changed,
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11, weight="bold"),
            height=28,
            corner_radius=14,
        )
        current_mode = getattr(self.config, "theme", "dark")
        self.theme_segment.set("☀️ Light" if current_mode == "light" else "🌙 Dark")
        self.theme_segment.pack(side="right")

        # -------------------------------------------------------------------------
        # Card 1: Video & Device Settings
        # -------------------------------------------------------------------------
        card_device = ctk.CTkFrame(
            self.control_panel,
            fg_color=Theme.WINDOW_BG,
            corner_radius=Theme.RADIUS_CARD,
            border_width=1,
            border_color=Theme.CARD_BORDER,
        )
        card_device.pack(fill="x", padx=12, pady=(0, 12))

        ctk.CTkLabel(
            card_device,
            text="CAMERA & OUTPUT",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11, weight="bold"),
            text_color=Theme.TEXT_MUTED,
        ).pack(anchor="w", padx=14, pady=(12, 8))

        cam_row = ctk.CTkFrame(card_device, fg_color="transparent")
        cam_row.pack(fill="x", padx=14, pady=(0, 8))

        ctk.CTkLabel(
            cam_row,
            text="Webcam:",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12),
            text_color=Theme.TEXT_PRIMARY,
        ).pack(side="left")

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
            fg_color=Theme.COMBO_BG,
            border_color=Theme.COMBO_BORDER,
            corner_radius=Theme.RADIUS_INPUT,
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            height=30,
            width=180,
        )
        self.cam_combo.set(current_cam_label)
        self.cam_combo.pack(side="right")

        is_avail, vcam_msg = check_virtual_camera_driver()
        status_color = Theme.STATUS_LIVE if is_avail else Theme.STATUS_REAPPEARING
        self.vcam_status_lbl = ctk.CTkLabel(
            card_device,
            text=f"● {vcam_msg}",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            text_color=status_color,
            wraplength=260,
            justify="left",
        )
        self.vcam_status_lbl.pack(anchor="w", padx=14, pady=(0, 12))

        # -------------------------------------------------------------------------
        # Card 2: Gesture Trigger Mapping
        # -------------------------------------------------------------------------
        card_gestures = ctk.CTkFrame(
            self.control_panel,
            fg_color=Theme.WINDOW_BG,
            corner_radius=Theme.RADIUS_CARD,
            border_width=1,
            border_color=Theme.CARD_BORDER,
        )
        card_gestures.pack(fill="x", padx=12, pady=(0, 12))

        ctk.CTkLabel(
            card_gestures,
            text="GESTURE TRIGGERS",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11, weight="bold"),
            text_color=Theme.TEXT_MUTED,
        ).pack(anchor="w", padx=14, pady=(12, 8))

        effect_options = [name for _, name in self.effect_registry.list_effects()]
        self.key_by_name = {name: k for k, name in self.effect_registry.list_effects()}

        # Snap mapping row
        snap_row = ctk.CTkFrame(card_gestures, fg_color="transparent")
        snap_row.pack(fill="x", padx=14, pady=(0, 8))

        ctk.CTkLabel(
            snap_row,
            text="🤌 Finger Snap:",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12),
            text_color=Theme.TEXT_PRIMARY,
        ).pack(side="left")

        self.snap_combo = ctk.CTkComboBox(
            snap_row,
            values=effect_options,
            command=self._on_mapping_changed,
            fg_color=Theme.COMBO_BG,
            border_color=Theme.COMBO_BORDER,
            corner_radius=Theme.RADIUS_INPUT,
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            height=30,
            width=140,
        )
        self.snap_combo.set("Thanos Dust Dissolve")
        self.snap_combo.pack(side="right")

        # Instant Transmission mapping row
        it_row = ctk.CTkFrame(card_gestures, fg_color="transparent")
        it_row.pack(fill="x", padx=14, pady=(0, 12))

        ctk.CTkLabel(
            it_row,
            text="👆 Temple Tap:",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12),
            text_color=Theme.TEXT_PRIMARY,
        ).pack(side="left")

        self.it_combo = ctk.CTkComboBox(
            it_row,
            values=effect_options,
            command=self._on_mapping_changed,
            fg_color=Theme.COMBO_BG,
            border_color=Theme.COMBO_BORDER,
            corner_radius=Theme.RADIUS_INPUT,
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            height=30,
            width=140,
        )
        self.it_combo.set("Instant Transmission Vanish")
        self.it_combo.pack(side="right")

        # -------------------------------------------------------------------------
        # Card 3: Audio Cues & Feedback
        # -------------------------------------------------------------------------
        card_audio = ctk.CTkFrame(
            self.control_panel,
            fg_color=Theme.WINDOW_BG,
            corner_radius=Theme.RADIUS_CARD,
            border_width=1,
            border_color=Theme.CARD_BORDER,
        )
        card_audio.pack(fill="x", padx=12, pady=(0, 12))

        ctk.CTkLabel(
            card_audio,
            text="AUDIO FEEDBACK",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11, weight="bold"),
            text_color=Theme.TEXT_MUTED,
        ).pack(anchor="w", padx=14, pady=(12, 6))

        self.audio_switch = ctk.CTkSwitch(
            card_audio,
            text="Sound Cues (Snap, Zap, Chime)",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12),
            text_color=Theme.TEXT_PRIMARY,
            command=self._on_audio_toggled,
        )
        if getattr(self.config, "sound_enabled", True):
            self.audio_switch.select()
        else:
            self.audio_switch.deselect()
        self.audio_switch.pack(anchor="w", padx=14, pady=(0, 4))

        ctk.CTkLabel(
            card_audio,
            text="Plays non-blocking audio synthesized feedback on vanish & return.",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            text_color=Theme.TEXT_MUTED,
            wraplength=260,
            justify="left",
        ).pack(anchor="w", padx=14, pady=(0, 12))

        # -------------------------------------------------------------------------
        # Card 4: Google Meet Fast Setup Guide
        # -------------------------------------------------------------------------
        card_guide = ctk.CTkFrame(
            self.control_panel,
            fg_color=Theme.WINDOW_BG,
            corner_radius=Theme.RADIUS_CARD,
            border_width=1,
            border_color=Theme.CARD_BORDER,
        )
        card_guide.pack(fill="x", padx=12, pady=(0, 12))

        ctk.CTkLabel(
            card_guide,
            text="GOOGLE MEET & ZOOM SETUP",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11, weight="bold"),
            text_color=Theme.TEXT_MUTED,
        ).pack(anchor="w", padx=14, pady=(12, 6))

        instructions = (
            "1. Open Settings > Video in Google Meet / Zoom\n"
            "2. Select 'OBS Virtual Camera' as camera\n"
            "3. Snap fingers or tap temple to vanish live!"
        )
        ctk.CTkLabel(
            card_guide,
            text=instructions,
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            text_color=Theme.TEXT_MUTED,
            justify="left",
        ).pack(anchor="w", padx=14, pady=(0, 12))

    def _on_theme_changed(self, choice: str) -> None:
        """Switch appearance mode dynamically between Light and Dark."""
        mode = "light" if "Light" in choice else "dark"
        ctk.set_appearance_mode(mode)
        self.config.theme = mode
        self.config.save()

    def _on_audio_toggled(self) -> None:
        """Toggle audio cues on or off."""
        is_on = bool(self.audio_switch.get())
        self.config.sound_enabled = is_on
        self.pipeline.sound_manager.enabled = is_on
        self.config.save()

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
            dummy_mask = (
                self.pipeline.segmenter.process(self.pipeline.latest_preview_frame)
                if (self.pipeline.segmenter and self.pipeline.latest_preview_frame is not None)
                else None
            )
            bg = self.pipeline.bg_manager.get_plate(self.pipeline.latest_preview_frame)
            if dummy_mask is not None and self.pipeline.latest_preview_frame is not None:
                eff.start(self.pipeline.latest_preview_frame, dummy_mask, bg)
            self.pipeline.state = PipelineState.DISAPPEARING

    def _start_hotkey_listener(self) -> None:
        """Start global keyboard shortcut listener (Ctrl+Alt+S) for instant return."""
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
            # Resize preview preserving 16:9 widescreen aspect ratio
            label_w = max(400, self.canvas_label.winfo_width())
            label_h = max(300, self.canvas_label.winfo_height())

            h, w, _ = frame.shape
            scale = min(label_w / w, label_h / h)
            new_w, new_h = max(10, int(w * scale)), max(10, int(h * scale))

            pil_img = Image.fromarray(frame).resize((new_w, new_h), Image.Resampling.BILINEAR)
            self._preview_image_tk = ImageTk.PhotoImage(image=pil_img)
            self.canvas_label.configure(image=self._preview_image_tk, text="")

        # Update FPS label
        self.fps_label.configure(text=f"{self.pipeline.current_fps:.1f} FPS • 720p HD")

        # Update State badge with contextual styling
        state = self.pipeline.state
        if state == PipelineState.NORMAL:
            self.status_badge.configure(text="● LIVE STREAMING", text_color=Theme.STATUS_LIVE)
        elif state == PipelineState.CALIBRATING:
            rem = self.pipeline.bg_manager.countdown_remaining
            self.status_badge.configure(
                text=f"● CALIBRATING ({rem:.1f}s)", text_color=Theme.STATUS_CALIBRATING
            )
        elif state in (PipelineState.DISAPPEARING, PipelineState.DISAPPEARED):
            self.status_badge.configure(
                text="● VANISHED (EMPTY ROOM)", text_color=Theme.STATUS_VANISHED
            )
        elif state == PipelineState.REAPPEARING:
            self.status_badge.configure(
                text="● REAPPEARING...", text_color=Theme.STATUS_REAPPEARING
            )

        self.after(30, self._update_gui_loop)

    def on_closing(self) -> None:
        """Handle window close event."""
        self._is_closing = True
        self.pipeline.stop()
        self.destroy()


def launch_app() -> None:
    """Launch the Blip desktop application."""
    app = BlipApp()
    app.mainloop()
