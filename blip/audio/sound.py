"""
Audio cue synthesizer for Blip.
Provides non-blocking sound feedback for Thanos Snap, Goku Teleport, and Reappearance.
"""

from __future__ import annotations

import sys
import threading


class SoundManager:
    """
    Manages non-blocking audio cues for disappearance triggers.
    Uses platform-native audio synthesis with silent fallback.
    """

    def __init__(self, enabled: bool = True):
        self.enabled = enabled

    def play_snap(self) -> None:
        """Play snap click sound in background thread."""
        if not self.enabled:
            return
        threading.Thread(target=self._snap_worker, daemon=True).start()

    def play_teleport(self) -> None:
        """Play anime teleport zap sound in background thread."""
        if not self.enabled:
            return
        threading.Thread(target=self._teleport_worker, daemon=True).start()

    def play_reappear(self) -> None:
        """Play gentle chime for reappearance in background thread."""
        if not self.enabled:
            return
        threading.Thread(target=self._reappear_worker, daemon=True).start()

    def _snap_worker(self) -> None:
        try:
            if sys.platform == "win32":
                import winsound

                # Fast sharp transient
                winsound.Beep(2400, 35)
                winsound.Beep(1200, 45)
        except Exception:
            pass

    def _teleport_worker(self) -> None:
        try:
            if sys.platform == "win32":
                import winsound

                # Rising dual-tone zap
                winsound.Beep(1500, 50)
                winsound.Beep(2800, 80)
        except Exception:
            pass

    def _reappear_worker(self) -> None:
        try:
            if sys.platform == "win32":
                import winsound

                # Harmonious chime
                winsound.Beep(1046, 70)  # C6
                winsound.Beep(1318, 90)  # E6
        except Exception:
            pass
