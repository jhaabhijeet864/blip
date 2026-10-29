"""
Effect registry and factory for Blip.
Provides dictionary mapping of available visual effects.
"""

from __future__ import annotations

from blip.effects.base import BaseEffect
from blip.effects.instant_transmission import InstantTransmissionEffect
from blip.effects.reappear import ReappearEffect
from blip.effects.thanos_dust import ThanosSnapEffect


class EffectRegistry:
    """
    Registry holding available cinematic disappearance effects.
    """

    def __init__(self):
        self.effects: dict[str, BaseEffect] = {}
        # Register the two viral flagships
        self.register("thanos_dust", ThanosSnapEffect())
        self.register("instant_transmission", InstantTransmissionEffect())
        self.register("reappear", ReappearEffect())

    def register(self, key: str, effect: BaseEffect) -> None:
        """Register an effect under a unique key."""
        self.effects[key] = effect

    def get(self, key: str) -> BaseEffect | None:
        """Retrieve an effect instance by key."""
        return self.effects.get(key)

    def list_effects(self) -> list[tuple[str, str]]:
        """Return list of (key, display_name) for UI dropdowns."""
        return [(k, eff.name) for k, eff in self.effects.items() if k != "reappear"]
