# Phase 8: High-Performance SIMD Effects & Background Plate — Context & Decisions

**Phase:** Phase 8  
**Status:** Decisions Locked  
**Created:** 2026-10-29  

---

## 1. Core Decisions Locked

### Zero-Allocation SIMD Particle Pool (`glam` + `rayon`)
- **Particle Buffer Allocation:** Pre-allocated continuous memory pool of 3,500 particles per disintegration sequence. Zero heap allocations or reallocations inside the 30/60 FPS render loop.
- **SIMD Vector Math:** Uses `glam::Vec2` for 2D position, velocity, and acceleration computations benefiting from SSE2/AVX2 auto-vectorization on x86_64.
- **Parallel Integration:** Particle updates (kinematic physics, turbulence, lifetime decay, bounds checks) processed in parallel chunks across available cores using `rayon::par_iter_mut()`.
- **Latency Budget:** Frame particle update + blend render must execute in `<= 2.0ms` at 720p resolution.

### Thanos Ash Disintegration Mechanics
- **Erosion Front:** Progressive vertical disintegration gradient ascending from bottom-of-torso upwards to the head, governed by a non-linear ease-in-out progress variable (`t: 0.0 -> 1.0` over 1.8 seconds).
- **Pixel Color Ingestion:** As the erosion front sweeps across person silhouette mask pixels, newly spawned particles sample and lock the exact RGB color of the source frame at their origin coordinates.
- **Curl Noise & Wind Flutter:**
  - Upward buoyancy force combined with deterministic trigonometric curl vector field:
    `dx = sin(pos.y * 0.02 + seed) * wind_strength`
    `dy = -base_lift + cos(pos.x * 0.02 + seed) * lift_variation`
  - Particle radius shrinks dynamically as lifetime decays, fading out smoothly into transparent ash motes.

### Goku Instant Transmission Mechanics
- **Animation Sequence (0 to 350ms):**
  - **Charge Phase (0ms - 120ms):** High-contrast radial anime speedlines projecting outwards from forehead landmark coordinate to screen edges.
  - **Flash/Pop Phase (120ms - 180ms):** Exponential exposure bloom / whiteout flash covering the silhouette, accompanied by an expanding high-velocity shockwave ring.
  - **Vanish Phase (180ms+):** Silhouette alpha cut immediately to 0.0, cleanly revealing the background plate with residual dissipating shockwave ring.

### Background Clean Plate Manager & Lighting Compensation
- **Non-Blocking Calibration:** 3-second countdown state machine allowing the user to step out of camera view. Accumulates and averages 10 consecutive video frames into a noise-free clean reference plate buffer (`RgbImage`).
- **LAB Luminance Drift Compensation:**
  - During live vanished state, environmental lighting (sunlight, room lamps, monitor glow) fluctuates.
  - Computes the average luminance difference ($\Delta L$) in peripheral non-subject zones between the live sensor frame and the stored clean plate.
  - Scales clean plate luminance dynamically: prevents dark or washed-out "cardboard cutout" artifacts in long-running meetings.
- **Fluid Reappearance:**
  - Smooth 300ms cubic ease-out alpha dissolve or reverse flash when user triggers reappear (via Ctrl+Alt+S, gesture, or UI button).

---

## 2. Requirements Addressed

- **RSIMD-01**: SIMD/vectorized Thanos ash particle disintegration engine (2,500+ particles) with upward curl noise and organic vertical erosion using `glam` and `rayon`.
- **RSIMD-02**: Goku Instant Transmission anime speedlines, expanding shockwave ring, exposure flash, and instant vanish.
- **RBG-01**: Background clean plate capture with 3-second countdown and real-time LAB color space luminance compensation.
- **RREV-01**: Fluid manual and auto reappear mechanics restoring the live camera feed smoothly.
