"""
Unit tests for BlipConfig persistence and corruption resilience.
"""

from blip.config import BlipConfig, get_default_config_path


def test_config_default_initialization():
    """Verify default parameters align with project specs."""
    cfg = BlipConfig()
    assert cfg.camera_index == 0
    assert cfg.camera_width == 1280
    assert cfg.camera_height == 720
    assert cfg.target_fps == 30
    assert cfg.vcam_backend == "obs"
    assert cfg.cooldown_seconds == 1.5
    assert cfg.particle_count == 1500
    assert cfg.auto_gestures_enabled is False


def test_config_save_and_reload(tmp_path):
    """Verify JSON round-trip save and load."""
    config_file = tmp_path / "custom_config.json"
    cfg = BlipConfig(camera_index=3, cooldown_seconds=2.5, particle_count=4000)
    cfg.save(config_file)

    loaded = BlipConfig.load(config_file)
    assert loaded.camera_index == 3
    assert loaded.cooldown_seconds == 2.5
    assert loaded.particle_count == 4000


def test_config_corrupted_json_fallback(tmp_path):
    """Verify corrupted JSON gracefully falls back to default configuration."""
    corrupted_file = tmp_path / "corrupted.json"
    corrupted_file.write_text("{ invalid json structure !!!", encoding="utf-8")

    loaded = BlipConfig.load(corrupted_file)
    assert loaded.camera_index == 0
    assert loaded.particle_count == 1500


def test_get_default_config_path():
    """Verify default config path points inside user home directory."""
    path = get_default_config_path()
    assert ".blip" in str(path)
    assert path.name == "config.json"
