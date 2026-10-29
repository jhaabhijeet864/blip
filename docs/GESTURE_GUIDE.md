# Gesture Recognition Guide

This guide details the mathematical principles, landmark geometry, and thresholds behind Blip's gesture recognition system, along with instructions for authoring custom detectors.

---

## 1. Landmark Indexing (MediaPipe Hands)

MediaPipe outputs 21 normalized landmarks per detected hand. The coordinate space is normalized such that `x, y \in [0.0, 1.0]`, with `y=0.0` at the top of the frame.

```
       8 (Index Tip)   12 (Middle Tip)
          │               │
       7 (Index DIP)   11 (Middle DIP)    16 (Ring Tip)
          │               │                  │
       6 (Index PIP)   10 (Middle PIP)    15 (Ring DIP)    20 (Pinky Tip)
          │               │                  │                │
       5 (Index MCP)    9 (Middle MCP)    14 (Ring PIP)    19 (Pinky DIP)
          │               │                  │                │
4 (Thumb) │               │               13 (Ring MCP)    18 (Pinky PIP)
   │      │               │                  │                │
3 (IP)    │               │                  │             17 (Pinky MCP)
   │      └───────────────┴──────────────────┴────────────────┘
2 (MCP)                           │
   │                              │
1 (CMC)───────────────────────────┘
   │
0 (Wrist)
```

---

## 2. Scale Invariance Normalization

Because users sit at varying distances from the webcam, raw pixel distances cannot be used. Blip computes a dynamic scale factor for each detected hand:

$$\text{Scale} = \|\mathbf{P}_{\text{wrist}} - \mathbf{P}_{\text{middle\_mcp}}\|_2$$

All inter-joint distances are divided by $\text{Scale}$, guaranteeing identical detection sensitivity whether you are 50 cm or 2 meters from your camera.

---

## 3. Flagship Gesture Detectors

### 3.1 The Thanos Snap (`SnapGesture`)
Snapping involves a two-phase physical movement:
1. **Pinch Phase:** The user presses the thumb tip (`P_4`) and middle fingertip (`P_12`) together.
   $$\frac{\|\mathbf{P}_4 - \mathbf{P}_{12}\|_2}{\text{Scale}} < 0.32$$
   When this condition is met, the detector enters the `is_pinched` state and logs the timestamp.
2. **Release Phase:** Within 600 ms, the middle finger slides off the thumb and accelerates downward into the palm. The distance expands rapidly:
   $$\frac{\|\mathbf{P}_4 - \mathbf{P}_{12}\|_2}{\text{Scale}} > 0.65 \quad \text{and} \quad \frac{\Delta \text{Dist}}{\Delta t} > 1.5$$
   When velocity exceeds the threshold, the snap is registered.

### 3.2 Goku Instant Transmission (`InstantTransmissionGesture`)
The iconic Dragon Ball Z pose requires:
1. **Parallel Extension:** Index tip (`P_8`) and middle tip (`P_12`) must be extended straight upward:
   $$y_8 < y_6 < y_5 \quad \text{and} \quad y_{12} < y_{10} < y_9$$
2. **Finger Proximity:** Index and middle tips must be held close together:
   $$\frac{\|\mathbf{P}_8 - \mathbf{P}_{12}\|_2}{\text{Scale}} < 0.35$$
3. **Curled Extremities:** Ring (`P_16`) and pinky (`P_20`) must be folded tight into the palm ($y_{\text{tip}} > y_{\text{pip}}$).
4. **Elevation:** The hand must be raised to head level ($y_8 < 0.55$).
5. **Debounce Streak:** Pose must be held continuously for at least 3 frames to avoid accidental triggers during natural gestures.

---

## 4. Authoring Custom Gestures

To add a new gesture detector:
1. Subclass `BaseGesture` in `blip/gestures/`:
   ```python
   from blip.gestures.base import BaseGesture, GestureResult


   class VictorySignGesture(BaseGesture):
       def __init__(self):
           super().__init__(name="peace_sign", min_confidence=0.85)

       def detect(self, landmarks, image_shape) -> GestureResult:
           # Check for V-shape geometry
           ...
           return GestureResult(self.name, is_detected=True, confidence=0.9)
   ```
2. Register the instance in `blip/gestures/registry.py`:
   ```python
   self.register(VictorySignGesture())
   ```
3. Add synthetic unit tests in `tests/test_gestures.py`.
