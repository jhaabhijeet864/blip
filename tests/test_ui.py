"""
Unit tests for BlipApp desktop UI logic in headless mode.
"""

from unittest.mock import MagicMock, patch

from blip.config import BlipConfig
from blip.core.pipeline import PipelineState
from blip.ui.app_window import BlipApp, launch_app


@patch("customtkinter.CTk.__init__", return_value=None)
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
    mock_ctk_init,
):
    """Verify BlipApp initializes subsystems, wires registries, and handles user interactions."""
    cfg = BlipConfig()
    with patch.object(BlipApp, "iconbitmap", create=True):
        app = BlipApp(config=cfg)

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
