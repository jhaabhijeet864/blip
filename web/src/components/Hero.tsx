"use client";

import React from "react";
import Link from "next/link";
import { Download } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-24 bg-[#000000] border-b border-zinc-800/80 bg-blueprint-grid">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Asymmetrical Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Clean Typography & Consumer CTAs            */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-center">
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
              <Link
                href="/download/"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm tracking-normal transition-colors text-center shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Link>
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
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
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
