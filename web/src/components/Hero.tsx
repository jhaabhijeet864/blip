"use client";

import React from "react";
import { Download, Shield, Zap, EyeOff, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-[#09090b]">
      {/* Subtle background ambient glow (amber and silver only - zero purple) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-amber-500/[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[350px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-40" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 text-center relative z-10">
        {/* Release / Status Pill without emojis */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 mb-8 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>v0.1.0 Ready for Windows · DirectShow &amp; OBS Virtual Camera</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
          Never give an awkward excuse to leave a meeting again.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Snap your fingers or tap your temple. Blip detects your natural hand gesture and instantly dissolves you into a pre-captured empty room plate right inside Google Meet, Zoom, or Teams.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#download"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white text-zinc-950 font-extrabold text-sm hover:bg-zinc-200 transition-all shadow-[0_0_25px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download for Windows (Free)
          </a>

          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-sm transition-all hover:border-zinc-700 active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Try Interactive Meet Demo
          </a>
        </div>

        {/* Confidence & Platform Badges */}
        <div className="mt-16 pt-10 border-t border-zinc-900 flex flex-wrap items-center justify-center gap-y-4 gap-x-10 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>100% Offline &amp; Private (Zero Cloud)</span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Works with Google Meet, Zoom &amp; Teams</span>
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
