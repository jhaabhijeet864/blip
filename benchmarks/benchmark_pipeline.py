"""
Performance benchmark suite for Blip.
Measures latency and throughput across MediaPipe tracking, segmentation, and FX rendering.
"""

from __future__ import annotations

import time

import numpy as np

from blip.effects.instant_transmission import InstantTransmissionEffect
from blip.effects.thanos_dust import ThanosSnapEffect
from blip.vision.hand_tracker import HandTracker
from blip.vision.segmenter import SelfieSegmenter


def run_benchmark(num_frames: int = 50):
    print(f"⚡ Running Blip Performance Benchmarks ({num_frames} frames)...")
    h, w = 720, 1280
    synth_frame = np.random.randint(0, 255, (h, w, 3), dtype=np.uint8)
    bg_plate = np.full((h, w, 3), 40, dtype=np.uint8)
    mask = np.zeros((h, w), dtype=np.float32)
    mask[150:650, 400:900] = 1.0

    # 1. MediaPipe Hands
    tracker = HandTracker()
    t0 = time.perf_counter()
    for _ in range(num_frames):
        tracker.process(synth_frame)
    t1 = time.perf_counter()
    hands_ms = ((t1 - t0) / num_frames) * 1000.0
    tracker.close()

    # 2. MediaPipe Selfie Segmentation
    segmenter = SelfieSegmenter()
    t0 = time.perf_counter()
    for _ in range(num_frames):
        segmenter.process(synth_frame)
    t1 = time.perf_counter()
    seg_ms = ((t1 - t0) / num_frames) * 1000.0
    segmenter.close()

    # 3. Thanos Snap Ash Particles
    thanos = ThanosSnapEffect(duration_frames=num_frames, particle_count=2500)
    thanos.start(synth_frame, mask, bg_plate)
    t0 = time.perf_counter()
    for _ in range(num_frames):
        thanos.render(synth_frame, mask, bg_plate)
        thanos.update()
    t1 = time.perf_counter()
    thanos_ms = ((t1 - t0) / num_frames) * 1000.0

    # 4. Goku Instant Transmission
    goku = InstantTransmissionEffect(duration_frames=num_frames)
    goku.start(synth_frame, mask, bg_plate)
    t0 = time.perf_counter()
    for _ in range(num_frames):
        goku.render(synth_frame, mask, bg_plate)
        goku.update()
    t1 = time.perf_counter()
    goku_ms = ((t1 - t0) / num_frames) * 1000.0

    print("\nBenchmark Results (Average latency per 720p frame):")
    print(f"  - MediaPipe Hand Tracking:      {hands_ms:6.2f} ms")
    print(f"  - MediaPipe Selfie Seg:         {seg_ms:6.2f} ms")
    print(f"  - Thanos Ash Particle Shader:   {thanos_ms:6.2f} ms")
    print(f"  - Goku Anime Flash & Speedlines: {goku_ms:6.2f} ms")

    total_fps = 1000.0 / (hands_ms + seg_ms + max(thanos_ms, goku_ms))
    print(f"\n  Projected Full Pipeline Throughput: ~{total_fps:.1f} FPS")


if __name__ == "__main__":
    run_benchmark(num_frames=30)
