"use client";

import React from "react";
import { Download, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-24 bg-[#000000] border-b border-zinc-800/80 bg-blueprint-grid">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Asymmetrical Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Sharp Typography & Direct Engineering CTAs */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Architecture Classification Taxonomy Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-zinc-800 bg-zinc-950 font-mono text-[11px] text-zinc-400 mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>SYS_ARCH // DIRECTSHOW VIRTUAL CAMERA</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-300 font-semibold">TAURI V2 + RUST</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-white leading-[1.04]">
              Blip out of your next meeting.{" "}
              <span className="text-red-500">Instantly.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl font-normal">
              A real-time, gesture-controlled virtual camera. Blip tracks your hand landmarks locally at 30 FPS, triggers visual disappearance shaders upon pinch or temple-tap, and seamlessly switches your video stream to a calibrated empty room plate.
            </p>

            {/* High-Contrast Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="#releases"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded bg-red-500 hover:bg-red-600 text-white font-mono font-bold text-xs tracking-wider transition-colors shadow-sm text-center"
              >
                <Download className="w-4 h-4" />
                <span>[ DOWNLOAD LATEST BINARY ]</span>
              </a>

              <a
                href="#architecture"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-300 font-mono text-xs transition-colors text-center"
              >
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                <span>[ VIEW ARCHITECTURE ]</span>
              </a>
            </div>

            {/* Performance & Spec Strip */}
            <div className="mt-8 pt-6 border-t border-zinc-900 grid grid-cols-3 gap-4 font-mono text-[11px]">
              <div>
                <span className="text-zinc-600 block">[TARGET]</span>
                <span className="text-zinc-300 font-semibold">WIN-X64 STANDALONE</span>
              </div>
              <div>
                <span className="text-zinc-600 block">[LATENCY]</span>
                <span className="text-zinc-300 font-semibold">&lt; 4.8MS PIPELINE</span>
              </div>
              <div>
                <span className="text-zinc-600 block">[PRIVACY]</span>
                <span className="text-zinc-300 font-semibold">100% AIR-GAPPED</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Official Blip Hand Snap Logo Showcase      */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
              {/* Subtle ambient back-glow */}
              <div className="absolute inset-0 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

              {/* Clean blueprint container for logo */}
              <div className="relative z-10 w-full h-full max-w-[380px] max-h-[380px] sm:max-w-[400px] sm:max-h-[400px] flex items-center justify-center p-8 rounded-2xl border border-zinc-800 bg-[#09090b]/80 backdrop-blur-sm shadow-2xl reticle-corner">
                {/* Viewfinder corner accents */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-zinc-700 pointer-events-none" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-zinc-700 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-zinc-700 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-zinc-700 pointer-events-none" />

                <img
                  src="/logo.svg"
                  alt="Blip Gesture Hand Snap"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
