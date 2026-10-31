# Custom Visual Effect Authoring Guide

Blip features a modular, plugin-based visual effects architecture. You can design, implement, and register custom cinematic disappearance effects in Python without touching the core pipeline.

---

## 1. The `BaseEffect` Contract

Every effect in Blip extends `blip.effects.base.BaseEffect`:

```python
from abc import ABC, abstractmethod
import numpy as np


class BaseEffect(ABC):
    def __init__(self, name: str, duration_frames: int = 45):
        self.name = name
        self.duration_frames = max(1, duration_frames)
        self.current_frame = 0
        self.is_active = False

    def start(
        self, initial_frame: np.ndarray, initial_mask: np.ndarray, background: np.ndarray
    ) -> None:
        """Called once when the effect triggers to allocate particle buffers or state."""
        self.current_frame = 0
        self.is_active = True

    @abstractmethod
    def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
        """
        Called every frame during the animation.
        Returns the processed RGB image (uint8, same shape as frame).
        """
        pass

    def update(self) -> None:
        """Called after each render pass to advance frame counters."""
        self.current_frame += 1
        if self.current_frame >= self.duration_frames:
            self.is_active = False
```

### Parameter Specifications

| Parameter | Type | Dimensions | Description |
| :--- | :--- | :--- | :--- |
| `frame` | `np.ndarray` (`uint8`) | `(H, W, 3)` | Current RGB camera capture frame. |
| `mask` | `np.ndarray` (`float32`) | `(H, W)` | Person silhouette confidence (`1.0` = person, `0.0` = room). |
| `background` | `np.ndarray` (`uint8`) | `(H, W, 3)` | Pre-captured, lighting-adjusted clean plate of the empty room. |

---

## 2. Walkthrough Example: Smoke Bomb Dissolve

Below is a complete implementation of a ninja smoke puff effect:

```python
import cv2
import numpy as np
from blip.effects.base import BaseEffect


class SmokeBombEffect(BaseEffect):
    def __init__(self, duration_frames: int = 30):
        super().__init__("Smoke Bomb", duration_frames=duration_frames)
        self.smoke_particles = None

    def start(
        self, initial_frame: np.ndarray, initial_mask: np.ndarray, background: np.ndarray
    ) -> None:
        super().start(initial_frame, initial_mask, background)
        h, w, _ = initial_frame.shape
        # Seed 150 expanding smoke puffs
        self.smoke_particles = np.random.uniform(
            low=[w * 0.3, h * 0.3], high=[w * 0.7, h * 0.8], size=(150, 2)
        ).astype(np.float32)

    def render(self, frame: np.ndarray, mask: np.ndarray, background: np.ndarray) -> np.ndarray:
        p = self.progress  # 0.0 to 1.0

        # Phase 1: Cut person to background as smoke billows
        alpha = max(0.0, 1.0 - (p * 2.5))
        mask_3d = (mask * alpha)[:, :, None]
        rendered = (
            frame.astype(np.float32) * mask_3d + background.astype(np.float32) * (1.0 - mask_3d)
        ).astype(np.uint8)

        # Phase 2: Render expanding translucent smoke clouds
        if p < 0.9:
            overlay = rendered.copy()
            cloud_radius = int(20 + p * 80)
            cloud_opacity = max(0.0, 1.0 - p)

            for pos in self.smoke_particles:
                cv2.circle(overlay, (int(pos[0]), int(pos[1])), cloud_radius, (200, 200, 210), -1)

            rendered = cv2.addWeighted(
                rendered, 1.0 - cloud_opacity * 0.6, overlay, cloud_opacity * 0.6, 0
            )

        return rendered
```

---

## 3. Registering Your Custom Effect

Open `blip/effects/registry.py` and register your new class:

```python
from blip.effects.smoke_bomb import SmokeBombEffect


class EffectRegistry:
    def __init__(self):
        self._effects: dict[str, BaseEffect] = {
            "thanos_dust": ThanosSnapEffect(),
            "instant_transmission": InstantTransmissionEffect(),
            "smoke_bomb": SmokeBombEffect(),  # Added
        }
```

The new effect will automatically populate in the Blip desktop UI dropdown for user assignment!
