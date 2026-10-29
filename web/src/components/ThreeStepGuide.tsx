"use client";

import React from "react";
import { Download, Camera, Video, Hand, ArrowRight } from "lucide-react";

export default function ThreeStepGuide() {
  const steps = [
    {
      num: "01",
      title: "Launch Blip on Windows",
      desc: "Download and double-click Blip.exe on your Windows PC. No accounts, no signups, and no installer wizard required.",
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
    <section id="how-it-works" className="py-24 bg-[#000000] border-b border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-red-500">
            Frictionless Setup
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Up and running in 30 seconds.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            No complex configuration. Built for everyday meetings.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl p-8 bg-[#09090b] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-4xl font-extrabold font-mono text-zinc-700 group-hover:text-red-500 transition-colors">
                      {step.num}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                      <Icon className="w-6 h-6 text-zinc-300" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-900 text-xs text-zinc-500 font-medium flex items-center gap-2">
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
