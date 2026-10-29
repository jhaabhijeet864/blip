"""
Unit tests for SoundManager audio cues and synthesis workers.
"""

from unittest.mock import MagicMock, patch

from blip.audio.sound import SoundManager


def test_sound_manager_enabled():
    """Verify sound manager triggers non-blocking threads without exceptions."""
    sound = SoundManager(enabled=True)
    sound.play_snap()
    sound.play_teleport()
    sound.play_reappear()


def test_sound_manager_disabled():
    """Verify disabled sound manager is a clean no-op."""
    sound = SoundManager(enabled=False)
    sound.play_snap()
    sound.play_teleport()
    sound.play_reappear()


def test_sound_workers_execution():
    """Verify worker routines execute winsound.Beep when on win32."""
    sound = SoundManager(enabled=True)
    mock_beep = MagicMock()

    with (
        patch("sys.platform", "win32"),
        patch.dict("sys.modules", {"winsound": MagicMock(Beep=mock_beep)}),
    ):
        sound._snap_worker()
        assert mock_beep.call_count == 2

        mock_beep.reset_mock()
        sound._teleport_worker()
        assert mock_beep.call_count == 2

        mock_beep.reset_mock()
        sound._reappear_worker()
        assert mock_beep.call_count == 2


def test_sound_workers_exception_tolerance():
    """Verify worker routines safely catch any audio device exceptions."""
    sound = SoundManager(enabled=True)

    with (
        patch("sys.platform", "win32"),
        patch.dict(
            "sys.modules",
            {"winsound": MagicMock(Beep=MagicMock(side_effect=RuntimeError("Sound card error")))},
        ),
    ):
        # Should not raise
        sound._snap_worker()
        sound._teleport_worker()
        sound._reappear_worker()
