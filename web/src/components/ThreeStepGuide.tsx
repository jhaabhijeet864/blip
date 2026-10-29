"use client";

import React from "react";
import { Camera, Hand, Video, ArrowRight } from "lucide-react";

export default function ThreeStepGuide() {
  const steps = [
    {
      num: "01",
      title: "Launch Blip",
      desc: "Download and double-click Blip.exe on your Windows PC. No registration, no login, and no terminal required.",
      icon: Video,
      tip: "Runs completely offline in the background",
    },
    {
      num: "02",
      title: "Step Back for 3 Seconds",
      desc: "Click 'Calibrate Background' and step out of camera view. Blip captures a clean, noise-reduced plate of your empty room.",
      icon: Camera,
      tip: "Automatically balances lighting changes",
    },
    {
      num: "03",
      title: "Snap & Vanish in Meetings",
      desc: "In Google Meet, Zoom, or Teams, set your camera to 'Blip Virtual Camera'. Snap your fingers or tap your temple to disappear whenever you need to.",
      icon: Hand,
      tip: "Works instantly across all browser & desktop apps",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#09090b] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
            Frictionless Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Up and running in 30 seconds.
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            No complex configuration. Built for everyday video calls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl p-7 bg-[#121214] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black font-mono text-zinc-700 group-hover:text-amber-400/80 transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                      <Icon className="w-5 h-5 text-zinc-300" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-900 text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {step.tip}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
