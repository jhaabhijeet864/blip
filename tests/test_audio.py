"""
Unit tests for SoundManager audio cues.
"""

from blip.audio.sound import SoundManager


def test_sound_manager_enabled():
    """Verify sound manager triggers threads without exceptions."""
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
