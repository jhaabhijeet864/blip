//! Computer Vision subsystem: ONNX Runtime, 3D Hand Tracking, and Matting.

pub mod hands;
pub mod segmentation;
pub mod session;

pub use hands::{HandLandmarks, HandTracker, Landmark3D};
pub use segmentation::SelfieSegmenter;
pub use session::{create_inference_session, ExecutionProvider};
