"use client";

import React, { useState } from "react";
import { Sparkles, Zap, RotateCcw, Check, Flame, Eye } from "lucide-react";

export default function EffectSelector() {
  const [selectedEffect, setSelectedEffect] = useState<"thanos" | "goku">("thanos");

  return (
    <section id="effects" className="py-24 bg-[#0c0c0e] relative border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
            Cinematic Disappearance Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Two iconic effects. One instant exit.
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Choose your signature exit. Each effect is rendered locally at 30 FPS using hardware-accelerated computer vision.
          </p>
        </div>

        {/* Effect Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Thanos Snap */}
          <div
            onClick={() => setSelectedEffect("thanos")}
            className={`rounded-2xl p-8 border cursor-pointer transition-all relative overflow-hidden ${
              selectedEffect === "thanos"
                ? "bg-zinc-900/90 border-amber-500/50 shadow-[0_0_35px_-10px_rgba(245,158,11,0.2)]"
                : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shadow-inner">
                🫰
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                Pinch &amp; Flick Gesture
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Thanos Dust Dissolve</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Your silhouette decomposes into 2,500+ individual ash particles sampled directly from your clothes and skin. Particles drift upward with turbulent wind dynamics, cleanly revealing your empty chair.
            </p>

            {/* Effect Specs */}
            <div className="space-y-2.5 pt-6 border-t border-zinc-800/80 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Real-time color sampling from your camera feed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Simulated wind turbulence &amp; progressive top-to-bottom erosion</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Clean empty room plate sustained indefinitely</span>
              </div>
            </div>
          </div>

          {/* Card 2: Goku Instant Transmission */}
          <div
            onClick={() => setSelectedEffect("goku")}
            className={`rounded-2xl p-8 border cursor-pointer transition-all relative overflow-hidden ${
              selectedEffect === "goku"
                ? "bg-zinc-900/90 border-amber-500/50 shadow-[0_0_35px_-10px_rgba(245,158,11,0.2)]"
                : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shadow-inner">
                ⚡
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                Two Fingers at Temple
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Instant Transmission Vanish</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Raise two fingers to your temple to charge the teleport. Radial anime speedlines radiate outward with chromatic aberration, followed by a blinding electric flash explosion that leaves you gone in a blink.
            </p>

            {/* Effect Specs */}
            <div className="space-y-2.5 pt-6 border-t border-zinc-800/80 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Geometric head-pose &amp; temple landmark tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Dynamic radial speedlines &amp; expanding shockwave circle</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Instantaneous vanish in under 0.5 seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reappearance Callout Banner */}
        <div className="mt-8 rounded-2xl p-6 bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Seamless Reappearance Included</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ready to step back into the call? Repeat your gesture or press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 text-[10px]">Ctrl+Alt+S</kbd> to smoothly fade back into the frame with a celestial shimmer.
              </p>
            </div>
          </div>

          <a
            href="#demo"
            className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors"
          >
            Test in Live Demo ↑
          </a>
        </div>
      </div>
    </section>
  );
}
