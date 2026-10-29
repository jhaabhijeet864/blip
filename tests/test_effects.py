"""
Unit tests for visual effects engine: Thanos Snap, Goku Instant Transmission, and Reappearance.
"""

import numpy as np

from blip.effects.base import BaseEffect
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


def test_thanos_snap_dissolve_monotonic_decay():
    """
    Verify that the user silhouette dissolves monotonically from 100% visible
    at p=0.0 to 0% visible (completely erased) by p=0.80.
    """
    frame, mask, bg = create_mock_scene()
    # Distinct colors: person is white [255, 255, 255], background is black [0, 0, 0]
    person_frame = np.full((720, 1280, 3), 255, dtype=np.uint8)
    empty_bg = np.zeros((720, 1280, 3), dtype=np.uint8)

    effect = ThanosSnapEffect(duration_frames=50, particle_count=0)  # 0 particles for pure silhouette test
    effect.start(person_frame, mask, empty_bg)

    # Frame 0: p=0.0 -> Person should be fully visible
    f0 = effect.render(person_frame, mask, empty_bg)
    person_pixels_0 = np.sum(f0[200:600, 400:880] > 128)

    # Progress steps to test
    effect.current_frame = 10  # p = 0.20
    f_20 = effect.render(person_frame, mask, empty_bg)
    person_pixels_20 = np.sum(f_20[200:600, 400:880] > 128)

    effect.current_frame = 25  # p = 0.50
    f_50 = effect.render(person_frame, mask, empty_bg)
    person_pixels_50 = np.sum(f_50[200:600, 400:880] > 128)

    effect.current_frame = 40  # p = 0.80 -> Must be 100% vanished!
    f_80 = effect.render(person_frame, mask, empty_bg)
    person_pixels_80 = np.sum(f_80[200:600, 400:880] > 128)

    # Monotonic decay assertions
    assert person_pixels_0 > person_pixels_20 > person_pixels_50
    # At p=0.80, person silhouette is completely erased
    assert person_pixels_80 == 0
    np.testing.assert_array_equal(f_80, empty_bg)


def test_thanos_snap_effect_empty_mask():
    """Verify Thanos Snap handles empty person mask without error."""
    frame, _, bg = create_mock_scene()
    empty_mask = np.zeros((720, 1280), dtype=np.float32)
    effect = ThanosSnapEffect(duration_frames=5)
    effect.start(frame, empty_mask, bg)
    assert effect.particle_pos is None

    out = effect.render(frame, empty_mask, bg)
    assert out.shape == frame.shape


def test_instant_transmission_effect_lifecycle():
    """Verify Goku Instant Transmission effect renders speedlines, flash, and vanishes."""
    frame, mask, bg = create_mock_scene()
    effect = InstantTransmissionEffect(duration_frames=12)

    effect.start(frame, mask, bg)
    assert effect.is_active

    # Check charging / speedlines phase (frame 0-7)
    f0 = effect.render(frame, mask, bg)
    assert f0.shape == frame.shape

    # Check blinding flash phase (frame 8-10)
    effect.current_frame = 9
    flash_frame = effect.render(frame, mask, bg)
    assert flash_frame.shape == frame.shape

    # Fast forward to vanish phase (frame >= 11)
    effect.current_frame = 11
    vanished_frame = effect.render(frame, mask, bg)
    np.testing.assert_array_equal(vanished_frame, bg)


def test_instant_transmission_effect_empty_mask():
    """Verify Goku IT handles empty mask and falls back to screen center."""
    frame, _, bg = create_mock_scene()
    empty_mask = np.zeros((720, 1280), dtype=np.float32)
    effect = InstantTransmissionEffect()
    effect.start(frame, empty_mask, bg)
    assert effect.center_x == 1280 // 2
    assert effect.center_y == 720 // 2


def test_reappear_effect_lifecycle():
    """Verify Reappearance effect smoothly restores live frame and renders shimmer ring."""
    frame, mask, bg = create_mock_scene()
    effect = ReappearEffect(duration_frames=10)
    effect.start(frame, mask, bg)

    # Shimmer ring active at early progress (< 0.8)
    effect.current_frame = 3
    mid = effect.render(frame, mask, bg)
    assert mid.shape == frame.shape

    # Full restore at progress >= 1.0
    effect.current_frame = 10
    restored = effect.render(frame, mask, bg)
    np.testing.assert_array_equal(restored, frame)


def test_base_effect_contracts():
    """Verify BaseEffect abstract class methods."""

    class TestEffect(BaseEffect):
        def render(self, frame, mask, background):
            return frame

    eff = TestEffect("Test", duration_frames=10)
    assert not eff.is_active
    assert eff.progress == 0.0

    eff.start(np.zeros((10, 10, 3)), np.zeros((10, 10)), np.zeros((10, 10, 3)))
    assert eff.is_active
    eff.update()
    assert eff.current_frame == 1

    eff.stop()
    assert not eff.is_active
    assert eff.current_frame == 0


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
