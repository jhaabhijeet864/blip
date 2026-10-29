//! Unit tests for gesture kinematics, streak tracking, and cooldown debounce.

use blip_core::gestures::{
    GestureEngine, InstantTransmissionDetector, SnapGestureDetector, TriggeredAction,
};
use blip_core::vision::hands::{
    HandLandmarks, Landmark3D, INDEX_TIP, MIDDLE_TIP, THUMB_TIP, WRIST,
};
use std::time::{Duration, Instant};

fn create_hand(
    thumb: Landmark3D,
    index: Landmark3D,
    middle: Landmark3D,
    wrist: Landmark3D,
) -> HandLandmarks {
    let mut coords = [Landmark3D::new(0.5, 0.8, 0.0); 21];
    coords[THUMB_TIP] = thumb;
    coords[INDEX_TIP] = index;
    coords[MIDDLE_TIP] = middle;
    coords[WRIST] = wrist;
    HandLandmarks::new(coords, 0.98)
}

#[test]
fn test_snap_detector_pinch_and_flick() {
    let mut detector = SnapGestureDetector::new();
    let now = Instant::now();

    // Frame 1: Thumb and middle finger pinch together (distance < 0.06)
    let hand_pinch = create_hand(
        Landmark3D::new(0.5, 0.5, 0.0),
        Landmark3D::new(0.6, 0.4, 0.0),
        Landmark3D::new(0.51, 0.51, 0.0),
        Landmark3D::new(0.5, 0.8, 0.0),
    );
    assert!(!detector.update(&hand_pinch, now));

    // Frame 2: Hold pinch for 50ms
    let now_f2 = now + Duration::from_millis(50);
    assert!(!detector.update(&hand_pinch, now_f2));

    // Frame 3: Explosive separation! Distance opens to 0.25 in 50ms (velocity = 0.25 / 0.05 = 5.0 > 1.4)
    let hand_flick = create_hand(
        Landmark3D::new(0.35, 0.5, 0.0),
        Landmark3D::new(0.6, 0.4, 0.0),
        Landmark3D::new(0.60, 0.51, 0.0),
        Landmark3D::new(0.5, 0.8, 0.0),
    );
    let now_f3 = now_f2 + Duration::from_millis(50);
    assert!(detector.update(&hand_flick, now_f3));
}

#[test]
fn test_snap_detector_timeout_hold_aborts() {
    let mut detector = SnapGestureDetector::new();
    let now = Instant::now();

    let hand_pinch = create_hand(
        Landmark3D::new(0.5, 0.5, 0.0),
        Landmark3D::new(0.6, 0.4, 0.0),
        Landmark3D::new(0.51, 0.51, 0.0),
        Landmark3D::new(0.5, 0.8, 0.0),
    );
    detector.update(&hand_pinch, now);

    // Held for 600ms (> max_pinch_duration 500ms) -> timeout reset
    let now_late = now + Duration::from_millis(600);
    assert!(!detector.update(&hand_pinch, now_late));
}

#[test]
fn test_instant_transmission_temple_tap() {
    let mut detector = InstantTransmissionDetector::new();

    // Index and middle fingers together near forehead (y = 0.25 < 0.40)
    let temple_pose = create_hand(
        Landmark3D::new(0.35, 0.35, 0.0),
        Landmark3D::new(0.50, 0.25, 0.0),
        Landmark3D::new(0.52, 0.25, 0.0),
        Landmark3D::new(0.50, 0.60, 0.0), // Wrist lower down
    );

    // Frame 1: streak = 1
    assert!(!detector.update(&temple_pose));
    // Frame 2: streak = 2
    assert!(!detector.update(&temple_pose));
    // Frame 3: streak = 3 -> Triggers!
    assert!(detector.update(&temple_pose));
}

#[test]
fn test_gesture_engine_cooldown_and_reappear() {
    let mut engine = GestureEngine::new();
    let now = Instant::now();

    // 1. Simulate snap trigger
    let hand_pinch = create_hand(
        Landmark3D::new(0.5, 0.5, 0.0),
        Landmark3D::new(0.6, 0.4, 0.0),
        Landmark3D::new(0.51, 0.51, 0.0),
        Landmark3D::new(0.5, 0.8, 0.0),
    );
    engine.evaluate(Some(&hand_pinch), now);
    engine.evaluate(Some(&hand_pinch), now + Duration::from_millis(50));

    let hand_flick = create_hand(
        Landmark3D::new(0.35, 0.5, 0.0),
        Landmark3D::new(0.6, 0.4, 0.0),
        Landmark3D::new(0.60, 0.51, 0.0),
        Landmark3D::new(0.5, 0.8, 0.0),
    );
    let action = engine.evaluate(Some(&hand_flick), now + Duration::from_millis(100));
    assert_eq!(action, TriggeredAction::ThanosDust);
    assert!(engine.is_vanished);

    // 2. Cooldown active (within 1500ms) -> Must suppress further triggers
    let action_cooldown = engine.evaluate(Some(&hand_flick), now + Duration::from_millis(500));
    assert_eq!(action_cooldown, TriggeredAction::None);

    // 3. After cooldown, re-triggering while vanished triggers Reappear
    let now_after_cooldown = now + Duration::from_millis(1600);
    engine.evaluate(Some(&hand_pinch), now_after_cooldown);
    engine.evaluate(
        Some(&hand_pinch),
        now_after_cooldown + Duration::from_millis(50),
    );
    let reappear_action = engine.evaluate(
        Some(&hand_flick),
        now_after_cooldown + Duration::from_millis(100),
    );
    assert_eq!(reappear_action, TriggeredAction::Reappear);
    assert!(!engine.is_vanished);
}
