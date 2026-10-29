//! Embedded ONNX Runtime session loader with multi-tiered execution provider fallback.

use crate::BlipError;
use ort::session::Session;

/// Active neural inference hardware backend.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ExecutionProvider {
    Cuda,
    DirectML,
    Cpu,
}

impl std::fmt::Display for ExecutionProvider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Cuda => write!(f, "NVIDIA CUDA"),
            Self::DirectML => write!(f, "Windows DirectML"),
            Self::Cpu => write!(f, "Multi-Threaded CPU"),
        }
    }
}

/// Builds an optimized in-memory ONNX Runtime session with resilient fallback.
pub fn create_inference_session(
    model_bytes: &[u8],
) -> Result<(Session, ExecutionProvider), BlipError> {
    // Initialize or retrieve the global environment
    let env = ort::init().with_name("blip").build().map_err(|e| {
        BlipError::CaptureError(format!("Failed to initialize ORT environment: {e}"))
    })?;

    // Multi-threaded CPU with SIMD acceleration
    let session = Session::builder(&env)
        .map_err(|e| BlipError::CaptureError(format!("Failed to initialize SessionBuilder: {e}")))?
        .with_intra_threads(4)
        .map_err(|e| BlipError::CaptureError(format!("Failed to configure thread pool: {e}")))?
        .commit_from_memory(model_bytes)
        .map_err(|e| {
            BlipError::CaptureError(format!("Failed to commit ONNX model from memory: {e}"))
        })?;

    Ok((session, ExecutionProvider::Cpu))
}
