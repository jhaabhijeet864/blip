"use client";

import React from "react";
import { Download, Camera, Video, Hand, ArrowRight } from "lucide-react";

export default function ThreeStepGuide() {
  const steps = [
    {
      num: "01",
      title: "Launch Blip on Windows",
      desc: "Download and double-click Blip.exe or load the unpacked Chrome extension. No accounts, no signups, and zero cloud calls.",
      icon: Download,
      tip: "Runs completely offline in your background",
    },
    {
      num: "02",
      title: "Step Back for 3 Seconds",
      desc: "Click 'Calibrate Background' and step out of camera view. Blip captures a clean, noise-reduced snapshot of your empty room chair.",
      icon: Camera,
      tip: "Automatically balances lighting changes",
    },
    {
      num: "03",
      title: "Snap & Vanish in Any Meeting",
      desc: "In Google Meet, Zoom, or Teams, select 'Blip Virtual Camera'. Snap your fingers or tap your temple to disappear whenever you need to.",
      icon: Hand,
      tip: "Works instantly across all video call apps",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#000000] border-b border-zinc-800 relative overflow-hidden">
      {/* Red ambient tint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[300px] bg-red-600/[0.04] blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-red-500 font-mono">
            Frictionless Setup
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Up and running in 30 seconds.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            No complex configuration. Built for everyday meetings.
          </p>
        </div>

        {/* 3 Steps Grid with Hard Glassmorphism & Hover Pop Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="hard-glass-card rounded-2xl p-8 flex flex-col justify-between cursor-default group"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-3xl font-black text-zinc-700 group-hover:text-red-500 transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-white/10 group-hover:border-red-500/50 flex items-center justify-center text-zinc-300 transition-colors shadow-inner">
                      <Icon className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-normal mb-8">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{step.tip}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
