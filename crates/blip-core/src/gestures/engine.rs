//! Unified Gesture Evaluation Engine with finite state debounce and cooldown timers.

use crate::gestures::instant_transmission::InstantTransmissionDetector;
use crate::gestures::snap::SnapGestureDetector;
use crate::vision::hands::HandLandmarks;
use std::time::{Duration, Instant};

/// Action triggered by the gesture engine.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TriggeredAction {
    None,
    ThanosDust,
    InstantTransmission,
    Reappear,
}

/// Coordinates gesture detectors, streak verification, and cooldown gating.
pub struct GestureEngine {
    pub snap_detector: SnapGestureDetector,
    pub it_detector: InstantTransmissionDetector,
    pub cooldown_duration: Duration,
    pub last_trigger_time: Option<Instant>,
    pub is_vanished: bool,
}

impl Default for GestureEngine {
    fn default() -> Self {
        Self {
            snap_detector: SnapGestureDetector::new(),
            it_detector: InstantTransmissionDetector::new(),
            cooldown_duration: Duration::from_millis(1500),
            last_trigger_time: None,
            is_vanished: false,
        }
    }
}

impl GestureEngine {
    pub fn new() -> Self {
        Self::default()
    }

    /// Evaluates current frame landmarks and returns triggered disappearance or reappear action.
    pub fn evaluate(&mut self, hand: Option<&HandLandmarks>, now: Instant) -> TriggeredAction {
        // Enforce cooldown suppression
        if let Some(last_time) = self.last_trigger_time {
            if now.duration_since(last_time) < self.cooldown_duration {
                return TriggeredAction::None;
            }
        }

        let hand = match hand {
            Some(h) => h,
            None => {
                self.snap_detector.reset();
                self.it_detector.reset();
                return TriggeredAction::None;
            }
        };

        // If currently vanished, any recognized gesture acts as a fluid Reappear trigger
        if self.is_vanished {
            if self.snap_detector.update(hand, now) || self.it_detector.update(hand) {
                self.is_vanished = false;
                self.last_trigger_time = Some(now);
                self.snap_detector.reset();
                self.it_detector.reset();
                return TriggeredAction::Reappear;
            }
            return TriggeredAction::None;
        }

        // Check Thanos Finger Snap
        if self.snap_detector.update(hand, now) {
            self.is_vanished = true;
            self.last_trigger_time = Some(now);
            self.it_detector.reset();
            return TriggeredAction::ThanosDust;
        }

        // Check Goku Instant Transmission
        if self.it_detector.update(hand) {
            self.is_vanished = true;
            self.last_trigger_time = Some(now);
            self.snap_detector.reset();
            return TriggeredAction::InstantTransmission;
        }

        TriggeredAction::None
    }

    /// Resets all detectors and clears vanished state.
    pub fn reset(&mut self) {
        self.snap_detector.reset();
        self.it_detector.reset();
        self.is_vanished = false;
        self.last_trigger_time = None;
    }
}
