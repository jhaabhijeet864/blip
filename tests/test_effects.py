"""
Unit tests for visual effects engine: Thanos Snap, Goku Instant Transmission, and Reappearance.
"""

import numpy as np

from blip.effects.instant_transmission import InstantTransmissionEffect
from blip.effects.reappear import ReappearEffect
from blip.effects.registry import EffectRegistry
from blip.effects.thanos_dust import ThanosSnapEffect


def create_mock_scene():
    """Create a mock live frame, silhouette mask, and clean background plate."""
    h, w = 720, 1280
    frame = np.full((h, w, 3), (120, 150, 200), dtype=np.uint8)  # Blue-ish person
    background = np.full((h, w, 3), (40, 40, 40), dtype=np.uint8)  # Dark room plate

    # Center oval person mask
    mask = np.zeros((h, w), dtype=np.float32)
    mask[200:600, 400:880] = 1.0

    return frame, mask, background


def test_thanos_snap_effect_lifecycle():
    """Verify Thanos Snap effect renders particles, dissolves person, and finishes on background."""
    frame, mask, bg = create_mock_scene()
    effect = ThanosSnapEffect(duration_frames=10, particle_count=500)

    effect.start(frame, mask, bg)
    assert effect.is_active
    assert effect.particle_pos is not None
    assert len(effect.particle_pos) == 500

    # Step through animation
    for _ in range(10):
        out = effect.render(frame, mask, bg)
        assert out.shape == frame.shape
        assert out.dtype == np.uint8
        effect.update()

    assert effect.is_finished()
    # At progress >= 1.0, should return 100% background
    final_frame = effect.render(frame, mask, bg)
    np.testing.assert_array_equal(final_frame, bg)


def test_instant_transmission_effect_lifecycle():
    """Verify Goku Instant Transmission effect renders speedlines, flash, and vanishes."""
    frame, mask, bg = create_mock_scene()
    effect = InstantTransmissionEffect(duration_frames=12)

    effect.start(frame, mask, bg)
    assert effect.is_active

    # Check charging / speedlines phase (frame 0-5)
    f0 = effect.render(frame, mask, bg)
    assert f0.shape == frame.shape

    # Fast forward to vanish phase (frame >= 11)
    effect.current_frame = 11
    vanished_frame = effect.render(frame, mask, bg)
    np.testing.assert_array_equal(vanished_frame, bg)


def test_reappear_effect():
    """Verify Reappearance effect smoothly restores live frame."""
    frame, mask, bg = create_mock_scene()
    effect = ReappearEffect(duration_frames=5)
    effect.start(frame, mask, bg)

    effect.current_frame = 5
    restored = effect.render(frame, mask, bg)
    np.testing.assert_array_equal(restored, frame)


def test_effect_registry():
    """Verify registry correctly lists and accesses effects."""
    reg = EffectRegistry()
    assert reg.get("thanos_dust") is not None
    assert reg.get("instant_transmission") is not None
    assert reg.get("reappear") is not None

    available = reg.list_effects()
    keys = [k for k, _ in available]
    assert "thanos_dust" in keys
    assert "instant_transmission" in keys
    assert "reappear" not in keys  # Internal transition effect
