//! Goku Instant Transmission (IT) kinematics detector.
//! Detects index and middle fingers held together and raised to the temple/forehead zone.

use crate::vision::hands::{HandLandmarks, INDEX_TIP, MIDDLE_TIP, RING_TIP, WRIST};

/// Detects the Goku Instant Transmission pose from 3D hand landmarks.
#[derive(Debug, Clone)]
pub struct InstantTransmissionDetector {
    pub fingers_together_threshold: f32,
    pub temple_zone_y_max: f32,
    pub min_hold_frames: u32,
    streak_frames: u32,
}

impl Default for InstantTransmissionDetector {
    fn default() -> Self {
        Self {
            fingers_together_threshold: 0.08,
            temple_zone_y_max: 0.40,
            min_hold_frames: 3,
            streak_frames: 0,
        }
    }
}

impl InstantTransmissionDetector {
    pub fn new() -> Self {
        Self::default()
    }

    /// Evaluates hand landmarks and returns true if the temple-tap pose is held.
    pub fn update(&mut self, hand: &HandLandmarks) -> bool {
        let index_tip = hand.get(INDEX_TIP);
        let middle_tip = hand.get(MIDDLE_TIP);
        let wrist = hand.get(WRIST);

        // 1. Index and middle tips must be held close together (joined fingers)
        let finger_distance = index_tip.distance_to(middle_tip);
        if finger_distance > self.fingers_together_threshold {
            self.streak_frames = 0;
            return false;
        }

        // 2. Hand must be raised high up in the frame (temple / forehead zone)
        if index_tip.y > self.temple_zone_y_max || middle_tip.y > self.temple_zone_y_max {
            self.streak_frames = 0;
            return false;
        }

        // 3. Fingers must be pointing upward relative to the wrist
        if index_tip.y >= wrist.y || middle_tip.y >= wrist.y {
            self.streak_frames = 0;
            return false;
        }

        // 4. Ring finger should not be higher than middle finger (curled inward)
        let ring_tip = hand.get(RING_TIP);
        if ring_tip.y < middle_tip.y {
            self.streak_frames = 0;
            return false;
        }

        // All pose constraints met: increment hold streak
        self.streak_frames += 1;

        if self.streak_frames >= self.min_hold_frames {
            // Pose verified!
            true
        } else {
            false
        }
    }

    /// Resets the hold streak counter.
    pub fn reset(&mut self) {
        self.streak_frames = 0;
    }
}

