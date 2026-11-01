"use client";

import React from "react";
import Link from "next/link";
import { Download } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-white dark:bg-[#000000] border-b border-black/[0.08] dark:border-zinc-800/80 bg-blueprint-grid overflow-hidden transition-colors duration-300">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-red-600/[0.08] dark:bg-red-600/[0.07] blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Asymmetrical Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Clean Typography & Consumer CTAs            */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Main Headline with high-contrast text */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight text-zinc-900 dark:text-white leading-[1.04] drop-shadow-sm transition-colors duration-300">
              Blip out of your next meeting.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Instantly.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl font-normal transition-colors duration-300">
              A real-time, gesture-controlled virtual camera. Blip tracks your hand landmarks locally at 30 FPS, triggers visual disappearance shaders upon pinch or temple-tap, and seamlessly switches your video stream to a calibrated empty room plate.
            </p>

            {/* High-Contrast Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/download/"
                className="h-[46px] inline-flex items-center justify-center gap-2.5 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm tracking-normal transition-all hover:scale-105 text-center shadow-[0_0_20px_rgba(239,68,68,0.35)] select-none"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Link>

              {/* Product Hunt Featured Badge */}
              <a
                href="https://www.producthunt.com/products/blip-12?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-blip-13"
                target="_blank"
                rel="noopener noreferrer"
                className="h-[46px] inline-flex items-center justify-center transition-all hover:scale-105 select-none"
              >
                <img
                  alt="Blip - Snap your fingers to vanish from your meetings. 100% Free. | Product Hunt"
                  width="213"
                  height="46"
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1300131&theme=dark&t=1793521394392"
                  className="h-[46px] w-auto object-contain rounded-xl"
                />
              </a>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Official Blip Hand Snap Logo Showcase      */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
              {/* Vibrant ambient back-glow behind the character */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/25 to-rose-500/15 blur-[90px] pointer-events-none animate-ambient-glow" />

              {/* Clean blueprint container with hard glass backdrop */}
              <div className="relative z-10 w-full h-full max-w-[380px] max-h-[380px] sm:max-w-[420px] sm:max-h-[420px] flex items-center justify-center p-8 rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#09090b]/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] reticle-corner group transition-colors duration-300">
                {/* Viewfinder corner accents */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-zinc-400 dark:border-zinc-700 pointer-events-none group-hover:border-red-500/70 transition-colors" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-zinc-400 dark:border-zinc-700 pointer-events-none group-hover:border-red-500/70 transition-colors" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-zinc-400 dark:border-zinc-700 pointer-events-none group-hover:border-red-500/70 transition-colors" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-zinc-400 dark:border-zinc-700 pointer-events-none group-hover:border-red-500/70 transition-colors" />

                {/* Hand Logo Character with Gentle Floating Pop Animation */}
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
                  alt="Blip Gesture Hand Snap"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] animate-subtle-float select-none pointer-events-none transition-transform duration-300"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
