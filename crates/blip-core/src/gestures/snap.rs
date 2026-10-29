//! Thanos Finger Snap kinematics detector.
//! Tracks thumb-to-middle contact, compression hold, and explosive velocity release.

use crate::vision::hands::{HandLandmarks, MIDDLE_TIP, THUMB_TIP};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq)]
enum SnapState {
    Idle,
    Pinched {
        start_time: Instant,
        frame_count: u32,
        last_distance: f32,
        last_time: Instant,
    },
}

/// Detects the Thanos Finger Snap gesture from 3D hand landmarks.
#[derive(Debug, Clone)]
pub struct SnapGestureDetector {
    pub pinch_threshold: f32,
    pub velocity_threshold: f32,
    pub max_pinch_duration: Duration,
    pub min_pinch_frames: u32,
    state: SnapState,
}

impl Default for SnapGestureDetector {
    fn default() -> Self {
        Self {
            pinch_threshold: 0.06,
            velocity_threshold: 1.4,
            max_pinch_duration: Duration::from_millis(500),
            min_pinch_frames: 2,
            state: SnapState::Idle,
        }
    }
}

impl SnapGestureDetector {
    pub fn new() -> Self {
        Self::default()
    }

    /// Evaluates hand landmarks and returns true if an explosive snap just occurred.
    pub fn update(&mut self, hand: &HandLandmarks, now: Instant) -> bool {
        let thumb = hand.get(THUMB_TIP);
        let middle = hand.get(MIDDLE_TIP);
        let dist = thumb.distance_to(middle);

        match self.state {
            SnapState::Idle => {
                if dist < self.pinch_threshold {
                    // Enter pinch phase
                    self.state = SnapState::Pinched {
                        start_time: now,
                        frame_count: 1,
                        last_distance: dist,
                        last_time: now,
                    };
                }
                false
            }
            SnapState::Pinched {
                start_time,
                frame_count,
                last_distance,
                last_time,
            } => {
                // If pinched for too long, reset to idle (not a snap, just a static hold)
                if now.duration_since(start_time) > self.max_pinch_duration {
                    self.state = SnapState::Idle;
                    return false;
                }

                if dist < self.pinch_threshold {
                    // Continue pinch hold
                    self.state = SnapState::Pinched {
                        start_time,
                        frame_count: frame_count + 1,
                        last_distance: dist,
                        last_time: now,
                    };
                    false
                } else {
                    // Distance opened up - check velocity release!
                    let dt = now.duration_since(last_time).as_secs_f32().max(0.001);
                    let velocity = (dist - last_distance) / dt;

                    let is_valid_snap =
                        frame_count >= self.min_pinch_frames && velocity >= self.velocity_threshold;

                    self.state = SnapState::Idle;
                    is_valid_snap
                }
            }
        }
    }

    /// Resets the detector state to Idle.
    pub fn reset(&mut self) {
        self.state = SnapState::Idle;
    }
}
