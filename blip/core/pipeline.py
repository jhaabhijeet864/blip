"""
Threaded video processing pipeline orchestrator for Blip.
Coordinates camera capture, MediaPipe vision inference, effect rendering, and virtual camera streaming.
"""

from __future__ import annotations

import threading
import time
from collections.abc import Callable

import cv2
import numpy as np

from blip.audio.sound import SoundManager
from blip.config import BlipConfig
from blip.core.background import BackgroundManager
from blip.core.devices import get_best_default_camera
from blip.core.vcam import VirtualCameraSink
from blip.effects.base import BaseEffect
from blip.vision.hand_tracker import HandLandmarkData, HandTracker
from blip.vision.segmenter import SelfieSegmenter


class PipelineState:
    """State constants for the disappearance lifecycle."""

    NORMAL = "NORMAL"  # Normal live webcam feed
    CALIBRATING = "CALIBRATING"  # Snapshotting empty room
    DISAPPEARING = "DISAPPEARING"  # Running disappearance animation
    DISAPPEARED = "DISAPPEARED"  # Sustained empty room background
    REAPPEARING = "REAPPEARING"  # Running return animation


class VideoPipeline:
    """
    Core video processing pipeline running in a background thread.
    Manages camera I/O, gesture detection, effect state machine, and virtual camera sink.
    """

    def __init__(self, config: BlipConfig | None = None):
        self.config = config or BlipConfig()
        self.state = PipelineState.NORMAL

        # Core Subsystems
        self.bg_manager = BackgroundManager()
        self.sound_manager = SoundManager(enabled=self.config.sound_enabled)
        self.vcam_sink: VirtualCameraSink | None = None
        self.hand_tracker: HandTracker | None = None
        self.segmenter: SelfieSegmenter | None = None

        # Gesture & Effect hooks (wired by registry)
        self.gesture_evaluator: (
            Callable[[list[HandLandmarkData], tuple[int, int]], str | None] | None
        ) = None
        self.effects_map: dict[str, BaseEffect] = {}
        self.active_effect: BaseEffect | None = None
        self.reappear_effect: BaseEffect | None = None

        # Threading & Control
        self._thread: threading.Thread | None = None
        self._running = False
        self._lock = threading.Lock()
        self._pending_camera_index: int | None = None
        self.active_camera_name: str = "Webcam"

        # Frame buffers for UI preview
        self.latest_preview_frame: np.ndarray | None = None
        self.latest_status: str = "Ready"
        self.current_fps: float = 0.0
        self.last_triggered_gesture: str | None = None
        self.last_trigger_time: float = 0.0

    def start(self) -> None:
        """Start the background pipeline thread."""
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(
            target=self._run_loop, name="BlipPipelineThread", daemon=True
        )
        self._thread.start()

    def stop(self) -> None:
        """Stop the background pipeline thread and release devices."""
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        self._thread = None

        if self.vcam_sink:
            self.vcam_sink.stop()
            self.vcam_sink = None

        if self.hand_tracker:
            self.hand_tracker.close()
            self.hand_tracker = None

        if self.segmenter:
            self.segmenter.close()
            self.segmenter = None

    def trigger_calibration(self, countdown_seconds: float = 3.0) -> None:
        """Trigger background room plate calibration."""
        self.bg_manager.start_calibration(countdown_seconds=countdown_seconds)
        self.state = PipelineState.CALIBRATING

    def trigger_reappear(self) -> None:
        """Force manual reappearance back to normal live feed."""
        if self.state in (PipelineState.DISAPPEARED, PipelineState.DISAPPEARING):
            self.sound_manager.play_reappear()
            if self.reappear_effect:
                self.active_effect = self.reappear_effect
                self.active_effect.is_active = True
                self.active_effect.current_frame = 0
                self.state = PipelineState.REAPPEARING
            else:
                self.state = PipelineState.NORMAL
                if self.active_effect:
                    self.active_effect.stop()
                    self.active_effect = None

    def switch_camera(self, new_index: int, camera_name: str | None = None) -> None:
        """
        Thread-safe request to dynamically hot-swap the active webcam input.
        """
        with self._lock:
            self._pending_camera_index = new_index
            self.config.camera_index = new_index
            if camera_name:
                self.active_camera_name = camera_name

    def create_offline_diagnostic_frame(self, message: str | None = None) -> np.ndarray:
        """
        Render an informative diagnostic frame on the canvas when the selected camera
        is offline, disconnected, or failing to stream.
        """
        w, h = self.config.camera_width, self.config.camera_height
        canvas = np.full((h, w, 3), (25, 25, 30), dtype=np.uint8)

        text_title = f"CAMERA OFFLINE: {self.active_camera_name.upper()}"
        text_sub = message or "Please select an active camera from the dropdown in Section 4."

        cv2.putText(
            canvas,
            text_title,
            (60, h // 2 - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (100, 100, 240),
            2,
            cv2.LINE_AA,
        )
        cv2.putText(
            canvas,
            text_sub,
            (60, h // 2 + 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (200, 200, 200),
            1,
            cv2.LINE_AA,
        )
        return canvas

    def _open_camera(self, index: int | None = None) -> cv2.VideoCapture:
        """
        Safely open video capture for the specified camera index.
        Falls back to best detected physical camera if specified index fails.
        """
        target_idx = self.config.camera_index if index is None else index

        cap = None
        try:
            cap = cv2.VideoCapture(target_idx)
        except Exception:
            cap = None

        # If opening failed and we haven't already fallen back, attempt best active default
        if (cap is None or not cap.isOpened()) and index is None:
            best_idx = get_best_default_camera()
            if best_idx != target_idx:
                try:
                    if cap is not None:
                        cap.release()
                    cap = cv2.VideoCapture(best_idx)
                    self.config.camera_index = best_idx
                except Exception:
                    pass

        if cap is not None and cap.isOpened():
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.config.camera_width)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.config.camera_height)
            cap.set(cv2.CAP_PROP_FPS, self.config.target_fps)

        return cap if cap is not None else cv2.VideoCapture()

    def process_frame(self, frame_rgb: np.ndarray, now: float | None = None) -> np.ndarray:
        """
        Process a single video frame through the pipeline state machine.
        Handles calibration, gesture evaluation, effect rendering, vcam streaming,
        and preview caching.

        Args:
            frame_rgb: Input RGB frame (H, W, 3).
            now: Current timestamp (defaults to time.time()).

        Returns:
            The rendered output frame (H, W, 3).
        """
        if now is None:
            now = time.time()
        h, w, _ = frame_rgb.shape

        # 1. Handle Background Calibration
        if self.bg_manager.is_calibrating():
            self.state = PipelineState.CALIBRATING
            calib_done = self.bg_manager.update(frame_rgb)
            if calib_done:
                self.state = PipelineState.NORMAL
                self.latest_status = "Background calibrated!"

        # 2. Hand Gesture Recognition (pause tracking during active dissolve / reappear transitions)
        hands_data: list[HandLandmarkData] = []
        detected_gesture: str | None = None

        auto_gestures = getattr(self.config, "auto_gestures_enabled", False)
        if (
            auto_gestures
            and self.hand_tracker
            and not self.bg_manager.is_calibrating()
            and self.state in (PipelineState.NORMAL, PipelineState.DISAPPEARED)
        ):
            hands_data = self.hand_tracker.process(frame_rgb)
            if self.gesture_evaluator and hands_data:
                # Enforce cooldown to prevent rapid multi-triggers
                if (now - self.last_trigger_time) >= self.config.cooldown_seconds:
                    detected_gesture = self.gesture_evaluator(hands_data, (h, w))

        # 3. Handle Gesture Trigger State Machine
        if detected_gesture:
            self.last_triggered_gesture = detected_gesture
            self.last_trigger_time = now

            if self.state == PipelineState.NORMAL:
                # Play corresponding sound cue
                if detected_gesture == "snap":
                    self.sound_manager.play_snap()
                elif detected_gesture == "instant_transmission":
                    self.sound_manager.play_teleport()

                # Lookup mapped effect
                effect_key = self.config.gesture_mappings.get(detected_gesture)
                if effect_key and effect_key in self.effects_map:
                    self.active_effect = self.effects_map[effect_key]
                    # Compute initial segmentation mask
                    initial_mask = (
                        self.segmenter.process(frame_rgb)
                        if self.segmenter
                        else np.ones((h, w), dtype=np.float32)
                    )
                    bg_plate = self.bg_manager.get_plate(frame_rgb)
                    self.active_effect.start(frame_rgb, initial_mask, bg_plate)
                    self.state = PipelineState.DISAPPEARING
                    self.latest_status = f"Disappearing: {self.active_effect.name}!"

            elif self.state == PipelineState.DISAPPEARED:
                # Reappear on gesture
                self.trigger_reappear()
                self.latest_status = "Reappearing..."

        # 4. Render Output Video Frame based on State
        output_frame: np.ndarray = frame_rgb
        bg_plate = self.bg_manager.get_plate(frame_rgb)

        if self.state == PipelineState.DISAPPEARING:
            if self.active_effect and self.active_effect.is_active:
                mask = (
                    self.segmenter.process(frame_rgb)
                    if self.segmenter
                    else np.ones((h, w), dtype=np.float32)
                )
                output_frame = self.active_effect.render(frame_rgb, mask, bg_plate)
                self.active_effect.update()

                if self.active_effect.is_finished():
                    self.active_effect.stop()
                    self.active_effect = None
                    self.state = PipelineState.DISAPPEARED
                    self.latest_status = "Disappeared (Empty room active)"
            else:
                self.state = PipelineState.DISAPPEARED

        elif self.state == PipelineState.REAPPEARING:
            if self.active_effect and self.active_effect.is_active:
                mask = (
                    self.segmenter.process(frame_rgb)
                    if self.segmenter
                    else np.ones((h, w), dtype=np.float32)
                )
                output_frame = self.active_effect.render(frame_rgb, mask, bg_plate)
                self.active_effect.update()

                if self.active_effect.is_finished():
                    self.active_effect.stop()
                    self.active_effect = None
                    self.state = PipelineState.NORMAL
                    self.latest_status = "Live"
            else:
                self.state = PipelineState.NORMAL

        elif self.state == PipelineState.DISAPPEARED:
            output_frame = bg_plate

        # 5. Stream Output Frame to Virtual Camera
        if self.vcam_sink and self.vcam_sink.is_active:
            self.vcam_sink.send(output_frame)

        # 6. Generate Annotated Frame for GUI Live Preview
        preview = output_frame.copy()
        if hands_data and self.state == PipelineState.NORMAL and self.hand_tracker:
            preview = self.hand_tracker.draw_landmarks(preview, hands_data)

        # Draw visual on-screen countdown if calibrating
        if self.bg_manager.is_calibrating():
            rem = self.bg_manager.countdown_remaining
            text = f"STEP OUT OF FRAME: {rem:.1f}s" if rem > 0 else "CAPTURING EMPTY ROOM..."
            cv2.putText(
                preview, text, (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3, cv2.LINE_AA
            )

        with self._lock:
            self.latest_preview_frame = preview

        return output_frame

    def _run_loop(self) -> None:
        """Main processing loop running at target FPS with hot-swappable camera capture."""
        cap = self._open_camera()

        # Initialize vision models
        self.hand_tracker = HandTracker()
        self.segmenter = SelfieSegmenter()

        # Initialize Virtual Camera sink
        try:
            self.vcam_sink = VirtualCameraSink(
                width=self.config.camera_width,
                height=self.config.camera_height,
                fps=self.config.target_fps,
                backend=self.config.vcam_backend,
            )
            self.vcam_sink.start()
        except Exception as e:
            print(f"[VirtualCamera] Warning: {e}")
            self.vcam_sink = None

        prev_time = time.time()
        fps_smoothing = 0.9
        consecutive_failures = 0

        while self._running:
            # 1. Check for dynamic camera hot-swap request
            with self._lock:
                target_idx = self._pending_camera_index
                if target_idx is not None:
                    self._pending_camera_index = None

            if target_idx is not None:
                if cap is not None:
                    try:
                        cap.release()
                    except Exception:
                        pass
                time.sleep(0.05)
                cap = self._open_camera(target_idx)
                consecutive_failures = 0

            # 2. Read frame from active camera
            ret, frame_bgr = False, None
            if cap is not None and cap.isOpened():
                try:
                    ret, frame_bgr = cap.read()
                except Exception:
                    ret, frame_bgr = False, None

            if not ret or frame_bgr is None:
                consecutive_failures += 1
                if consecutive_failures > 5:
                    diagnostic = self.create_offline_diagnostic_frame()
                    with self._lock:
                        self.latest_preview_frame = diagnostic
                    self.current_fps = 0.0
                time.sleep(0.05)
                continue

            consecutive_failures = 0
            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

            # Compute FPS
            now = time.time()
            dt = max(1e-4, now - prev_time)
            prev_time = now
            inst_fps = 1.0 / dt
            self.current_fps = (self.current_fps * fps_smoothing) + (
                inst_fps * (1.0 - fps_smoothing)
            )

            self.process_frame(frame_rgb, now)

        # Cleanup
        if cap is not None:
            try:
                cap.release()
            except Exception:
                pass
