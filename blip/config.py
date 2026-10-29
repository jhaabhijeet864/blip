"""
Configuration management for Blip.
Handles serialization and persistence of camera, gesture, and effect settings.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any


def get_default_config_path() -> Path:
    """Returns the platform-appropriate config file path."""
    home = Path.home()
    config_dir = home / ".blip"
    config_dir.mkdir(parents=True, exist_ok=True)
    return config_dir / "config.json"


@dataclass
class BlipConfig:
    """User preferences and runtime configuration."""

    camera_index: int = 0
    camera_width: int = 1280
    camera_height: int = 720
    target_fps: int = 30
    vcam_backend: str = "obs"  # "obs", "unityvideo", or "v4l2loopback"
    gesture_mappings: dict[str, str] = field(
        default_factory=lambda: {
            "snap": "thanos_dust",
            "instant_transmission": "instant_transmission",
        }
    )
    cooldown_seconds: float = 1.5
    hotkey: str = "<ctrl>+<alt>+s"
    particle_count: int = 1500
    ash_drift_speed: float = 1.2
    auto_reappear_delay: float = 0.0  # 0.0 means manual reappear only
    sound_enabled: bool = True
    theme: str = 'dark'

    @classmethod
    def load(cls, path: Path | None = None) -> BlipConfig:
        """Load configuration from JSON file or return defaults."""
        config_file = path or get_default_config_path()
        if config_file.exists():
            try:
                with open(config_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})
            except Exception:
                return cls()
        return cls()

    def save(self, path: Path | None = None) -> None:
        """Persist current configuration to JSON file."""
        config_file = path or get_default_config_path()
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(asdict(self), f, indent=2)

    def to_dict(self) -> dict[str, Any]:
        """Convert configuration to dictionary."""
        return asdict(self)
