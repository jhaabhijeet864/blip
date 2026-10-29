"""
Unit tests for BlipApp desktop UI logic in headless mode.
"""

from unittest.mock import MagicMock, patch

from blip.config import BlipConfig
from blip.core.devices import CameraDevice
from blip.core.pipeline import PipelineState
from blip.ui.app_window import BlipApp, launch_app
from blip.ui.theme import Theme


@patch("customtkinter.CTk.__init__", return_value=None)
@patch.object(BlipApp, "configure")
@patch.object(BlipApp, "geometry")
@patch.object(BlipApp, "minsize")
@patch.object(BlipApp, "title")
@patch.object(BlipApp, "protocol")
@patch.object(BlipApp, "after")
@patch.object(BlipApp, "_setup_ui")
@patch.object(BlipApp, "_start_hotkey_listener")
@patch("blip.core.pipeline.VideoPipeline.start")
@patch("blip.core.pipeline.VideoPipeline.stop")
def test_blip_app_initialization_and_events(
    mock_pipe_stop,
    mock_pipe_start,
    mock_hotkey,
    mock_setup,
    mock_after,
    mock_proto,
    mock_title,
    mock_minsize,
    mock_geom,
    mock_configure,
    mock_ctk_init,
):
    """Verify BlipApp initializes subsystems, wires registries, and handles user interactions."""
    cfg = BlipConfig()
    with patch.object(BlipApp, "iconbitmap", create=True):
        app = BlipApp(config=cfg)
        app.tk = MagicMock()

    assert app.pipeline is not None
    assert app.gesture_registry is not None
    assert app.effect_registry is not None

    # Test calibrate button click
    app._on_calibrate_clicked()
    assert app.pipeline.state == PipelineState.CALIBRATING

    # Test mapping changed callback
    app.key_by_name = {"Thanos Snap": "thanos_dust", "Goku Teleport": "instant_transmission"}
    app.snap_combo = MagicMock()
    app.snap_combo.get.return_value = "Thanos Snap"
    app.it_combo = MagicMock()
    app.it_combo.get.return_value = "Goku Teleport"

    with patch.object(cfg, "save"):
        app._on_mapping_changed(None)
        assert cfg.gesture_mappings["snap"] == "thanos_dust"
        assert cfg.gesture_mappings["instant_transmission"] == "instant_transmission"

    # Test manual effect trigger
    dummy_effect = MagicMock()
    app.pipeline.effects_map = {"thanos_dust": dummy_effect}
    app._trigger_effect_manual("thanos_dust")
    assert app.pipeline.state == PipelineState.DISAPPEARING

    # Test theme toggle callback
    with patch("customtkinter.set_appearance_mode") as mock_set_mode, patch.object(cfg, "save"):
        app._on_theme_changed("☀️ Light")
        assert app.config.theme == "light"
        mock_set_mode.assert_called_with("light")

        app._on_theme_changed("🌙 Dark")
        assert app.config.theme == "dark"
        mock_set_mode.assert_called_with("dark")

    # Test audio toggle
    app.audio_switch = MagicMock()
    app.audio_switch.get.return_value = 0
    with patch.object(cfg, "save"):
        app._on_audio_toggled()
        assert app.config.sound_enabled is False
        assert app.pipeline.sound_manager.enabled is False

        app.audio_switch.get.return_value = 1
        app._on_audio_toggled()
        assert app.config.sound_enabled is True
        assert app.pipeline.sound_manager.enabled is True

    # Test camera device selection
    dev2 = CameraDevice(index=2, name="Logitech Brio", is_active=True, is_virtual=False)
    app.camera_device_map = {dev2.display_label: dev2}
    with patch.object(cfg, "save"):
        app._on_camera_changed(dev2.display_label)
        assert app.config.camera_index == 2
        assert app.pipeline.config.camera_index == 2
        assert app.pipeline.active_camera_name == "Logitech Brio"

        # Malformed camera choice should not raise
        app._on_camera_changed("invalid")

    # Test sidebar resizer drag handlers
    app.control_panel = MagicMock()
    app.control_panel.winfo_width.return_value = 340
    app.grid_columnconfigure = MagicMock()

    mock_event_start = MagicMock()
    mock_event_start.x_root = 500
    app._on_resizer_drag_start(mock_event_start)
    assert app._drag_start_x == 500
    assert app._drag_start_width == 340

    mock_event_motion = MagicMock()
    mock_event_motion.x_root = 450  # drag left by 50px -> new width = 340 + (500 - 450) = 390
    app._on_resizer_drag_motion(mock_event_motion)
    app.control_panel.configure.assert_called_with(width=390)
    app.grid_columnconfigure.assert_called_with(2, minsize=390)

    mock_event_end = MagicMock()
    with patch.object(cfg, "save") as mock_save:
        app.control_panel.winfo_width.return_value = 390
        app._on_resizer_drag_end(mock_event_end)
        assert app.config.sidebar_width == 390
        mock_save.assert_called_once()

    # Test window on_closing
    app.destroy = MagicMock()
    app.on_closing()
    assert app._is_closing is True
    app.destroy.assert_called_once()


def test_launch_app_function():
    """Verify launch_app instantiates BlipApp and calls mainloop."""
    mock_app_instance = MagicMock()
    with patch("blip.ui.app_window.BlipApp", return_value=mock_app_instance):
        launch_app()
        mock_app_instance.mainloop.assert_called_once()


def test_theme_tokens():
    """Verify Theme design system defines required color pairs."""
    assert len(Theme.WINDOW_BG) == 2
    assert len(Theme.STAGE_BG) == 2
    assert len(Theme.CARD_BG) == 2
    assert len(Theme.DOCK_BG) == 2
    assert Theme.STATUS_LIVE.startswith("#")
