"""
Runtime configuration and user preference persistence for Blip.
Handles serialization to ~/.blip/config.json with safe corruption fallback.
"""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass, field
from pathlib import Path


def get_default_config_path() -> Path:
    """Return platform-standard user configuration path (~/.blip/config.json)."""
    home = Path(os.environ.get("USERPROFILE", Path.home()))
    blip_dir = home / ".blip"
    blip_dir.mkdir(parents=True, exist_ok=True)
    return blip_dir / "config.json"


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
    theme: str = "dark"
    sidebar_width: int = 340

    @classmethod
    def load(cls, path: Path | None = None) -> BlipConfig:
        """Load configuration from JSON file or return defaults."""
        config_file = path or get_default_config_path()
        if config_file.exists():
            try:
                data = json.loads(config_file.read_text(encoding="utf-8"))
                # Filter unknown keys to prevent crashes on schema evolution
                valid_keys = {f.name for f in cls.__dataclass_fields__.values()}
                filtered_data = {k: v for k, v in data.items() if k in valid_keys}
                return cls(**filtered_data)
            except Exception:
                # Fallback to default on corruption
                return cls()
        return cls()

    def save(self, path: Path | None = None) -> None:
        """Save current configuration to JSON file."""
        config_file = path or get_default_config_path()
        try:
            config_file.parent.mkdir(parents=True, exist_ok=True)
            config_file.write_text(json.dumps(asdict(self), indent=2), encoding="utf-8")
        except Exception as e:
            print(f"[Config] Error saving configuration: {e}")

    def to_dict(self) -> dict:
        """Convert configuration to dictionary."""
        return asdict(self)
