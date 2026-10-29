//! Gesture Recognition subsystem: Thanos Snap, Goku Instant Transmission, and Debounce Engine.

pub mod engine;
pub mod instant_transmission;
pub mod snap;

pub use engine::{GestureEngine, TriggeredAction};
pub use instant_transmission::InstantTransmissionDetector;
pub use snap::SnapGestureDetector;

