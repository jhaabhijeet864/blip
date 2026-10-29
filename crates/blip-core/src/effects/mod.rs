pub mod goku;
pub mod plate;
pub mod reappear;
pub mod thanos;

pub use goku::InstantTransmissionEffect;
pub use plate::CleanPlateManager;
pub use reappear::ReappearEffect;
pub use thanos::ThanosDisintegration;

/// Type of effect assigned to gesture triggers.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EffectType {
    None,
    ThanosSnap,
    InstantTransmission,
}

/// Global visual state of the subject in the video stream.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum EffectState {
    /// Normal live feed streaming subject unmodified.
    Idle,
    /// Disintegration or vanishing sequence currently animating.
    Disintegrating { progress: f32 },
    /// Subject has completely vanished; empty room plate displayed.
    Vanished,
    /// Reappear animation in progress restoring live camera subject.
    Reappearing { progress: f32 },
}

