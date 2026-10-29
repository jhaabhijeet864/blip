"use client";

import React, { useState } from "react";
import { Sparkles, Zap, RotateCcw, Check, Layers, Sliders } from "lucide-react";

export default function EffectSelector() {
  const [selectedEffect, setSelectedEffect] = useState<"thanos" | "goku">("thanos");

  return (
    <section id="effects" className="py-24 bg-[#0c0c0e] relative border-t border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Title */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
            Cinematic Disappearance Engine
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Two iconic effects. One instant exit.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Choose your signature exit. Each effect is rendered locally at 30 FPS using hardware-accelerated computer vision.
          </p>
        </div>

        {/* Effect Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Thanos Snap */}
          <div
            onClick={() => setSelectedEffect("thanos")}
            className={`rounded-2xl p-8 sm:p-10 border cursor-pointer transition-all relative overflow-hidden ${
              selectedEffect === "thanos"
                ? "bg-zinc-900/90 border-amber-500/50 shadow-[0_0_35px_-10px_rgba(245,158,11,0.2)]"
                : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
            }`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                Pinch &amp; Flick Gesture
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Thanos Dust Dissolve</h3>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
              Your silhouette decomposes into 2,500+ individual ash particles sampled directly from your clothes and skin. Particles drift upward with turbulent wind dynamics, cleanly revealing your empty chair.
            </p>

            {/* Effect Specs */}
            <div className="space-y-3 pt-6 border-t border-zinc-800/80 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Real-time color sampling from your camera feed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Simulated wind turbulence &amp; progressive top-to-bottom erosion</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Clean empty room plate sustained indefinitely</span>
              </div>
            </div>
          </div>

          {/* Card 2: Goku Instant Transmission */}
          <div
            onClick={() => setSelectedEffect("goku")}
            className={`rounded-2xl p-8 sm:p-10 border cursor-pointer transition-all relative overflow-hidden ${
              selectedEffect === "goku"
                ? "bg-zinc-900/90 border-amber-500/50 shadow-[0_0_35px_-10px_rgba(245,158,11,0.2)]"
                : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
            }`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                Two Fingers at Temple
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Instant Transmission Vanish</h3>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
              Raise two fingers to your temple to charge the teleport. Radial anime speedlines radiate outward with chromatic aberration, followed by a blinding electric flash explosion that leaves you gone in a blink.
            </p>

            {/* Effect Specs */}
            <div className="space-y-3 pt-6 border-t border-zinc-800/80 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Geometric head-pose &amp; temple landmark tracking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Dynamic radial speedlines &amp; expanding shockwave circle</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instantaneous vanish in under 0.5 seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reappearance Callout Banner */}
        <div className="mt-10 rounded-2xl p-6 sm:p-7 bg-[#141416] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Seamless Reappearance Included</h4>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Ready to step back into the call? Repeat your gesture or press <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono">Ctrl+Alt+S</kbd> to smoothly fade back into the frame with a celestial shimmer.
              </p>
            </div>
          </div>

          <a
            href="#demo"
            className="shrink-0 text-xs font-semibold px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors"
          >
            Test in Live Demo ↑
          </a>
        </div>
      </div>
    </section>
  );
}
