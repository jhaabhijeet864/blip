"""
Modern Google Meet-inspired desktop graphical user interface for Blip.
Features a centered 16:9 hero video stage, mouse-draggable sidebar resizer,
top floating HUD, bottom floating pill dock, and dynamic Light/Dark mode switching.
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
    Crafted with a minimalist, Google Meet-inspired interface and mouse-draggable sidebar.
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
        self.minsize(980, 620)
        self.configure(fg_color=Theme.WINDOW_BG)

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

        # Detect if current configured camera is a phone bridge (like DroidCam) or virtual
        current_dev = next(
            (d for d in self.discovered_devices if d.index == self.config.camera_index), None
        )
        current_is_phone_or_virtual = (
            current_dev is None
            or current_dev.is_virtual
            or current_dev.is_phone_bridge
        )
        has_genuine_hardware = any(
            not d.is_virtual and not d.is_phone_bridge for d in self.discovered_devices
        )

        # Force switch to genuine physical camera (e.g. HP Wide Vision HD Camera) if DroidCam was selected
        if current_is_phone_or_virtual and has_genuine_hardware:
            self.config.camera_index = best_cam_idx
            self.config.save()

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
        self._drag_start_x = 0
        self._drag_start_width = getattr(self.config, "sidebar_width", 340)

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
        """Construct the 3-column layout: Stage | Splitter Bar | Settings Drawer."""
        sidebar_w = getattr(self.config, "sidebar_width", 340)

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)  # Hero Video Stage (expands/contracts)
        self.grid_columnconfigure(1, weight=0)  # Draggable Resizer Splitter Bar
        self.grid_columnconfigure(2, weight=0, minsize=sidebar_w)  # Settings Drawer

        # =========================================================================
        # COLUMN 0: Hero Video Stage (Google Meet Call Tile)
        # =========================================================================
        self.stage_frame = ctk.CTkFrame(
            self,
            fg_color=Theme.STAGE_BG,
            corner_radius=Theme.RADIUS_STAGE,
            border_width=1,
            border_color=Theme.STAGE_BORDER,
        )
        self.stage_frame.grid(row=0, column=0, padx=(16, 6), pady=16, sticky="nsew")
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

        chip_room = ctk.CTkFrame(
            hud_left,
            fg_color=Theme.CHIP_BG,
            corner_radius=Theme.RADIUS_CHIP,
            border_width=1,
            border_color=Theme.CHIP_BORDER,
        )
        chip_room.pack(side="left", padx=(8, 0))

        self.room_badge = ctk.CTkLabel(
            chip_room,
            text="✨ AUTO-INPAINT ROOM",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11, weight="bold"),
            text_color=Theme.TEXT_MUTED,
        )
        self.room_badge.pack(padx=10, pady=4)

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
        # 2. Hero Video Canvas Container (Letterboxed 16:9 Stage)
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
        # COLUMN 1: Mouse-Draggable Splitter Resizer Bar
        # =========================================================================
        self.resizer_bar = ctk.CTkFrame(
            self,
            width=6,
            fg_color=Theme.STAGE_BORDER,
            cursor="sb_h_double_arrow",
        )
        self.resizer_bar.grid(row=0, column=1, sticky="ns", padx=(0, 6), pady=16)

        self.resizer_bar.bind("<Enter>", lambda e: self.resizer_bar.configure(fg_color="#3b82f6"))
        self.resizer_bar.bind(
            "<Leave>", lambda e: self.resizer_bar.configure(fg_color=Theme.STAGE_BORDER)
        )
        self.resizer_bar.bind("<Button-1>", self._on_resizer_drag_start)
        self.resizer_bar.bind("<B1-Motion>", self._on_resizer_drag_motion)
        self.resizer_bar.bind("<ButtonRelease-1>", self._on_resizer_drag_end)

        # =========================================================================
        # COLUMN 2: Settings Drawer Sidebar (Resizable by mouse drag)
        # =========================================================================
        self.control_panel = ctk.CTkScrollableFrame(
            self,
            width=sidebar_w,
            fg_color=Theme.CARD_BG,
            corner_radius=Theme.RADIUS_STAGE,
            border_width=1,
            border_color=Theme.STAGE_BORDER,
        )
        self.control_panel.grid(row=0, column=2, padx=(0, 16), pady=16, sticky="nsew")

        # Sidebar Header: Title + Theme Mode Segmented Switch
        drawer_header = ctk.CTkFrame(self.control_panel, fg_color="transparent")
        drawer_header.pack(fill="x", padx=14, pady=(12, 16))

        ctk.CTkLabel(
            drawer_header,
            text="Studio Settings",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=17, weight="bold"),
            text_color=Theme.TEXT_PRIMARY,
        ).pack(side="left")

        current_theme = getattr(self.config, "theme", "dark").capitalize()
        self.theme_seg = ctk.CTkSegmentedButton(
            drawer_header,
            values=["Light", "Dark"],
            command=self._on_theme_changed,
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11, weight="bold"),
            height=26,
            width=100,
        )
        self.theme_seg.set(current_theme)
        self.theme_seg.pack(side="right")

        # -------------------------------------------------------------------------
        # Card 1: Camera Device & Output Routing
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
        ).pack(side="left", padx=(0, 8))

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
        )
        self.cam_combo.set(current_cam_label)
        self.cam_combo.pack(side="right", fill="x", expand=True)

        is_avail, vcam_msg = check_virtual_camera_driver()
        status_color = Theme.STATUS_LIVE if is_avail else Theme.STATUS_REAPPEARING
        self.vcam_status_lbl = ctk.CTkLabel(
            card_device,
            text=f"● {vcam_msg}",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            text_color=status_color,
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
        ).pack(anchor="w", padx=14, pady=(12, 4))

        # Master toggle for automatic gesture firing
        auto_row = ctk.CTkFrame(card_gestures, fg_color="transparent")
        auto_row.pack(fill="x", padx=14, pady=(0, 8))

        self.auto_gesture_switch = ctk.CTkSwitch(
            auto_row,
            text="Auto-Fire on Gestures",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12, weight="bold"),
            text_color=Theme.TEXT_PRIMARY,
            command=self._on_auto_gesture_toggled,
        )
        if getattr(self.config, "auto_gestures_enabled", False):
            self.auto_gesture_switch.select()
        else:
            self.auto_gesture_switch.deselect()
        self.auto_gesture_switch.pack(anchor="w", pady=(0, 2))

        self.auto_gesture_hint = ctk.CTkLabel(
            auto_row,
            text=(
                "⚡ Active: Dissolves when snap or temple tap is recognized."
                if getattr(self.config, "auto_gestures_enabled", False)
                else "🔒 Restricted: Auto-fire paused. Use dock buttons or hotkey."
            ),
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=10),
            text_color=(
                Theme.STATUS_LIVE
                if getattr(self.config, "auto_gestures_enabled", False)
                else Theme.TEXT_MUTED
            ),
            wraplength=260,
            justify="left",
        )
        self.auto_gesture_hint.pack(anchor="w", pady=(0, 4))

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
        ).pack(side="left", padx=(0, 8))

        self.snap_combo = ctk.CTkComboBox(
            snap_row,
            values=effect_options,
            command=self._on_mapping_changed,
            fg_color=Theme.COMBO_BG,
            border_color=Theme.COMBO_BORDER,
            corner_radius=Theme.RADIUS_INPUT,
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            height=30,
        )
        self.snap_combo.set("Thanos Dust Dissolve")
        self.snap_combo.pack(side="right", fill="x", expand=True)

        # Instant Transmission mapping row
        it_row = ctk.CTkFrame(card_gestures, fg_color="transparent")
        it_row.pack(fill="x", padx=14, pady=(0, 12))

        ctk.CTkLabel(
            it_row,
            text="👆 Temple Tap:",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=12),
            text_color=Theme.TEXT_PRIMARY,
        ).pack(side="left", padx=(0, 8))

        self.it_combo = ctk.CTkComboBox(
            it_row,
            values=effect_options,
            command=self._on_mapping_changed,
            fg_color=Theme.COMBO_BG,
            border_color=Theme.COMBO_BORDER,
            corner_radius=Theme.RADIUS_INPUT,
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            height=30,
        )
        self.it_combo.set("Instant Transmission Vanish")
        self.it_combo.pack(side="right", fill="x", expand=True)

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
            text="Non-blocking audio feedback synthesized on vanish & return.",
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            text_color=Theme.TEXT_MUTED,
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
            "1. In Google Meet / Zoom: Settings > Video\n"
            "2. Select 'OBS Virtual Camera' as camera\n"
            "3. Snap fingers or tap temple to vanish!"
        )
        ctk.CTkLabel(
            card_guide,
            text=instructions,
            font=ctk.CTkFont(family=Theme.FONT_FAMILY, size=11),
            text_color=Theme.TEXT_MUTED,
            justify="left",
        ).pack(anchor="w", padx=14, pady=(0, 12))

    def _on_resizer_drag_start(self, event) -> None:
        """Start tracking horizontal drag for sidebar resize."""
        self._drag_start_x = event.x_root
        self._drag_start_width = self.control_panel.winfo_width()

    def _on_resizer_drag_motion(self, event) -> None:
        """Dynamically resize sidebar width during mouse drag."""
        if not hasattr(self, "_drag_start_x") or not hasattr(self, "_drag_start_width"):
            return
        delta = self._drag_start_x - event.x_root
        new_width = max(260, min(560, self._drag_start_width + delta))
        self.control_panel.configure(width=new_width)
        self.grid_columnconfigure(2, minsize=new_width)

    def _on_resizer_drag_end(self, event) -> None:
        """Save user's preferred sidebar width upon release."""
        try:
            width = self.control_panel.winfo_width()
            if width > 100:
                self.config.sidebar_width = width
                self.config.save()
        except Exception:
            pass

    def _on_auto_gesture_toggled(self) -> None:
        """Toggle automatic gesture sensing and firing."""
        is_on = bool(self.auto_gesture_switch.get())
        self.config.auto_gestures_enabled = is_on
        self.pipeline.config.auto_gestures_enabled = is_on
        self.config.save()
        if is_on:
            self.auto_gesture_hint.configure(
                text="⚡ Active: Dissolves when snap or temple tap is recognized.",
                text_color=Theme.STATUS_LIVE,
            )
        else:
            self.auto_gesture_hint.configure(
                text="🔒 Restricted: Auto-fire paused. Use dock buttons or hotkey.",
                text_color=Theme.TEXT_MUTED,
            )

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

        # Check if window is minimized (iconified) - skip expensive render
        try:
            if self.state() == "iconic":
                self.after(100, self._update_gui_loop)
                return
        except Exception:
            pass

        # Fetch preview frame from pipeline
        frame = self.pipeline.latest_preview_frame
        if frame is not None:
            # Measure parent container (NOT the canvas_label itself to prevent feedback loop)
            container_w = self.video_container.winfo_width()
            container_h = self.video_container.winfo_height()

            # Ensure safe positive bounds during window transitions
            avail_w = max(320, container_w - 16)
            avail_h = max(240, container_h - 16)

            h, w, _ = frame.shape
            scale = min(avail_w / w, avail_h / h)
            new_w, new_h = max(10, int(w * scale)), max(10, int(h * scale))

            pil_img = Image.fromarray(frame).resize((new_w, new_h), Image.Resampling.BILINEAR)
            self._preview_image_tk = ImageTk.PhotoImage(image=pil_img)
            self.canvas_label.configure(image=self._preview_image_tk, text="")

        # Update FPS label
        self.fps_label.configure(text=f"{self.pipeline.current_fps:.1f} FPS • 720p HD")

        # Update State badge with contextual styling
        state = self.pipeline.state
        if state == PipelineState.NORMAL:
            if getattr(self.config, "auto_gestures_enabled", False):
                self.status_badge.configure(
                    text="● LIVE • GESTURES ON", text_color=Theme.STATUS_LIVE
                )
            else:
                self.status_badge.configure(
                    text="● LIVE (SAFE • MANUAL ONLY)", text_color=Theme.STATUS_LIVE
                )
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

        # Update Room status badge
        if hasattr(self, "room_badge"):
            if self.pipeline.bg_manager.is_calibrating():
                rem = self.pipeline.bg_manager.countdown_remaining
                self.room_badge.configure(
                    text=f"📸 CAPTURING ROOM ({rem:.1f}s)", text_color=Theme.STATUS_CALIBRATING
                )
            elif self.pipeline.bg_manager.has_plate():
                self.room_badge.configure(
                    text="✅ ROOM CALIBRATED", text_color=Theme.STATUS_LIVE
                )
            else:
                self.room_badge.configure(
                    text="✨ AUTO-INPAINT ROOM", text_color=Theme.TEXT_MUTED
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
