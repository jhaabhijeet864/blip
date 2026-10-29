"use client";

import React, { useState } from "react";
import { Sparkles, Zap, Check, RotateCcw } from "lucide-react";

export default function EffectSelector() {
  const [selectedEffect, setSelectedEffect] = useState<"thanos" | "goku">("thanos");

  return (
    <section id="effects" className="py-24 bg-[#050507] border-b border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-red-500">
            Signature Exit Effects
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Two iconic exits. One effortless gesture.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Choose your signature exit. Each effect runs locally at 30 FPS right on your machine.
          </p>
        </div>

        {/* 2 Effect Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Effect 1: Thanos Dust Dissolve */}
          <div
            onClick={() => setSelectedEffect("thanos")}
            className={`rounded-2xl p-8 sm:p-10 border cursor-pointer transition-all relative overflow-hidden ${
              selectedEffect === "thanos"
                ? "bg-zinc-950 border-red-500/60 shadow-[0_0_30px_-10px_rgba(239,68,68,0.25)]"
                : "bg-[#09090b] border-zinc-800/80 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                Gesture: Pinch &amp; Flick Snap
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
              Thanos Dust Dissolve
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
              Your silhouette disintegrates into 2,500+ individual ash particles sampled directly from your clothes and skin. Particles drift upward with wind dynamics, cleanly revealing your empty chair.
            </p>

            <div className="space-y-3 pt-6 border-t border-zinc-800/80 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-red-500 shrink-0" />
                <span>Real-time color sampling from your camera feed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-red-500 shrink-0" />
                <span>Simulated wind turbulence &amp; progressive top-to-bottom erosion</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-red-500 shrink-0" />
                <span>Seamlessly blends into your calibrated empty room plate</span>
              </div>
            </div>
          </div>

          {/* Effect 2: Goku Instant Transmission */}
          <div
            onClick={() => setSelectedEffect("goku")}
            className={`rounded-2xl p-8 sm:p-10 border cursor-pointer transition-all relative overflow-hidden ${
              selectedEffect === "goku"
                ? "bg-zinc-950 border-red-500/60 shadow-[0_0_30px_-10px_rgba(239,68,68,0.25)]"
                : "bg-[#09090b] border-zinc-800/80 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-400">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                Gesture: Tap Temple with Two Fingers
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
              Goku Instant Transmission
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
              Pay homage to Dragon Ball Z. Place index and middle finger on your forehead: screen speedlines flash across the frame, an electric aura pops, and you vanish in under 100ms.
            </p>

            <div className="space-y-3 pt-6 border-t border-zinc-800/80 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-red-500 shrink-0" />
                <span>Geometric radial speedlines &amp; camera lens aura flare</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-red-500 shrink-0" />
                <span>Instantaneous 100ms cutaway to empty chair</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-red-500 shrink-0" />
                <span>Smooth audio continuation with zero call disconnect</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
