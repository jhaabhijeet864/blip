"use client";

import React, { useState } from "react";
import { Sparkles, Zap, Check, RotateCcw } from "lucide-react";

export default function EffectSelector() {
  const [selectedEffect, setSelectedEffect] = useState<"thanos" | "goku">("thanos");

  return (
    <section id="effects" className="py-24 bg-[#050507] border-b border-zinc-800 relative overflow-hidden">
      {/* Ambient background red hue */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[350px] bg-red-600/[0.05] blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-red-500 font-mono">
            Signature Exit Effects
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Two iconic exits. One effortless gesture.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Choose your signature exit. Each effect runs locally at 30 FPS right on your machine.
          </p>
        </div>

        {/* 2 Effect Cards with Glassmorphism & Pop Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Effect 1: Thanos Dust Dissolve */}
          <div
            onClick={() => setSelectedEffect("thanos")}
            className={`hard-glass-card rounded-3xl p-8 sm:p-10 cursor-pointer relative overflow-hidden ${
              selectedEffect === "thanos"
                ? "!border-red-500/70 !bg-zinc-950/90 shadow-[0_0_40px_-5px_rgba(239,68,68,0.35)]"
                : ""
            }`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center text-red-400 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-900/90 border border-white/10 text-zinc-300">
                Gesture: Pinch &amp; Flick Snap
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
              Thanos Dust Dissolve
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
              Dissolve into 1,500+ cinematic ash particles that scatter into the breeze before leaving a pristine, empty room view.
            </p>

            {/* Spec details */}
            <div className="space-y-3 border-t border-zinc-800/80 pt-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">Particle Count</span>
                <span className="text-white font-mono font-medium">1,500 local points</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">Turbulence Physics</span>
                <span className="text-white font-mono font-medium">Trigonometric Curl Noise</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">Dissolve Timing</span>
                <span className="text-white font-mono font-medium">1.8s progressive ash</span>
              </div>
            </div>

            {selectedEffect === "thanos" && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-mono">
                <Check className="w-3.5 h-3.5" />
                <span>Selected</span>
              </div>
            )}
          </div>

          {/* Effect 2: Goku Instant Transmission */}
          <div
            onClick={() => setSelectedEffect("goku")}
            className={`hard-glass-card rounded-3xl p-8 sm:p-10 cursor-pointer relative overflow-hidden ${
              selectedEffect === "goku"
                ? "!border-red-500/70 !bg-zinc-950/90 shadow-[0_0_40px_-5px_rgba(239,68,68,0.35)]"
                : ""
            }`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center text-yellow-400 shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-900/90 border border-white/10 text-zinc-300">
                Gesture: 2 Fingers to Forehead
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
              Goku Instant Transmission
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
              Tap your temple with index and middle fingers to trigger anime radial speedlines, whiteout flash bloom, and an instant vanishing cut.
            </p>

            {/* Spec details */}
            <div className="space-y-3 border-t border-zinc-800/80 pt-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">Speedline Rays</span>
                <span className="text-white font-mono font-medium">32 dynamic radial beams</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">Flash Duration</span>
                <span className="text-white font-mono font-medium">200ms whiteout bloom</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">Camera Cut</span>
                <span className="text-white font-mono font-medium">Instant empty plate switch</span>
              </div>
            </div>

            {selectedEffect === "goku" && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-mono">
                <Check className="w-3.5 h-3.5" />
                <span>Selected</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
