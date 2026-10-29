"use client";

import React from "react";
import { Download, Sparkles, Shield, ArrowDown, Zap, EyeOff, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#09090b]">
      {/* Subtle background glow - crisp amber and silver (NO PURPLE) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/[0.04] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-40" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>v0.1.0 Ready for Windows · Google Meet, Zoom &amp; Teams</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Never give an awkward excuse to leave a meeting again.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Snap your fingers or tap your temple. Blip detects your gesture and instantly dissolves you into a pre-captured empty room plate right inside your video call.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#download"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-200 transition-all shadow-[0_0_25px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download for Windows (Free)
          </a>

          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-sm transition-all hover:border-zinc-700 active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Try Interactive Demo
          </a>
        </div>

        {/* Confidence & Trust Badges */}
        <div className="mt-14 pt-8 border-t border-zinc-900 flex flex-wrap items-center justify-center gap-y-4 gap-x-8 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>100% Offline &amp; Private (Zero Cloud)</span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Works with Google Meet &amp; Zoom</span>
          </div>

          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-zinc-300" />
            <span>No Coding or Terminal Required</span>
          </div>
        </div>
      </div>
    </section>
  );
}
