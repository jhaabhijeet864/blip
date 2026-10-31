//! Unit tests for vision preprocessing, hand landmark structures, and feathering.

use blip_core::vision::{
    ExecutionProvider, HandLandmarks, HandTracker, Landmark3D, SelfieSegmenter,
};
use image::{Rgb, RgbImage};

#[test]
fn test_landmark_3d_distance() {
    let p1 = Landmark3D::new(0.0, 0.0, 0.0);
    let p2 = Landmark3D::new(3.0, 4.0, 0.0);
    assert!((p1.distance_to(&p2) - 5.0).abs() < 1e-5);
}

#[test]
fn test_hand_landmarks_accessors() {
    let mut coords = [Landmark3D::default(); 21];
    coords[4] = Landmark3D::new(0.5, 0.6, 0.1); // Thumb tip
    coords[12] = Landmark3D::new(0.52, 0.58, 0.1); // Middle tip

    let hand = HandLandmarks::new(coords, 0.95);
    assert_eq!(hand.confidence, 0.95);
    assert_eq!(*hand.get(4), Landmark3D::new(0.5, 0.6, 0.1));
    assert_eq!(*hand.get(12), Landmark3D::new(0.52, 0.58, 0.1));
    // Index out of bounds should safely clamp to 20
    assert_eq!(*hand.get(99), Landmark3D::default());
}

#[test]
fn test_hand_tracker_preprocess_frame() {
    let mut img = RgbImage::new(640, 480);
    img.put_pixel(100, 100, Rgb([255, 128, 64]));

    let tensor = HandTracker::preprocess_frame(&img);
    assert_eq!(tensor.shape(), &[1, 3, 224, 224]);
    // Values must be normalized to [0.0, 1.0]
    for &val in tensor.iter() {
        assert!((0.0..=1.0).contains(&val));
    }
}

#[test]
fn test_selfie_segmenter_feathering() {
    let width = 10;
    let height = 10;
    let mut raw_mask = vec![0.0f32; width * height];
    // Set center block to 1.0
    for y in 4..6 {
        for x in 4..6 {
            raw_mask[y * width + x] = 1.0;
        }
    }

    let feathered = SelfieSegmenter::feather_mask(&raw_mask, width, height, 1);
    assert_eq!(feathered.len(), width * height);

    // Center values must be blended and border values non-negative
    for &val in feathered.iter() {
        assert!((0.0..=1.0).contains(&val));
    }
    // An adjacent cell (3, 4) should now have a feathered value > 0.0
    assert!(feathered[3 * width + 4] > 0.0);
}

#[test]
fn test_execution_provider_formatting() {
    assert_eq!(ExecutionProvider::Cuda.to_string(), "NVIDIA CUDA");
    assert_eq!(ExecutionProvider::DirectML.to_string(), "Windows DirectML");
    assert_eq!(ExecutionProvider::Cpu.to_string(), "Multi-Threaded CPU");
}
