"use client";

import React from "react";
import { Video, Monitor, PhoneCall, Radio, Users, Laptop } from "lucide-react";

export default function TelemetryStrip() {
  const platforms = [
    {
      name: "Google Meet",
      tag: "Native Chrome Extension & Desktop",
      color: "text-emerald-400",
      accent: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Zoom Workplace",
      tag: "Virtual Camera Sink & HD 1080p",
      color: "text-blue-400",
      accent: "bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Microsoft Teams",
      tag: "DirectShow Virtual Device",
      color: "text-indigo-400",
      accent: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      name: "Discord",
      tag: "WebRTC Stream & Stage Calls",
      color: "text-purple-400",
      accent: "bg-purple-500/10 border-purple-500/20",
    },
    {
      name: "Slack Huddles",
      tag: "Browser & Desktop Huddle Video",
      color: "text-amber-400",
      accent: "bg-amber-500/10 border-amber-500/20",
    },
    {
      name: "OBS Studio",
      tag: "Broadcast Virtual Cam Output",
      color: "text-red-400",
      accent: "bg-red-500/10 border-red-500/20",
    },
    {
      name: "Webex by Cisco",
      tag: "Enterprise Meeting Integration",
      color: "text-cyan-400",
      accent: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      name: "Skype",
      tag: "Windows Video Device Loopback",
      color: "text-sky-400",
      accent: "bg-sky-500/10 border-sky-500/20",
    },
  ];

  // Duplicate items for continuous seamless loop
  const marqueeItems = [...platforms, ...platforms];

  return (
    <section className="relative py-8 bg-[#040406] border-y border-zinc-800/80 overflow-hidden select-none">
      {/* Ambient Red Glow Line behind marquee */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3/4 bg-red-600/[0.04] blur-[80px] pointer-events-none" />

      {/* Edge gradient masks for smooth fade in/out */}
      <div className="absolute left-0 inset-y-0 w-24 sm:w-40 bg-gradient-to-r from-[#040406] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-24 sm:w-40 bg-gradient-to-l from-[#040406] to-transparent z-10 pointer-events-none" />

      {/* Label Badge */}
      <div className="text-center mb-5">
        <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
          Works instantly with every major meeting app
        </span>
      </div>

      {/* Continuous Marquee Track */}
      <div className="flex overflow-hidden">
        <div className="flex gap-4 sm:gap-6 animate-marquee shrink-0 items-center">
          {marqueeItems.map((platform, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-[#0c0c10]/90 border border-white/[0.08] hover:border-red-500/40 backdrop-blur-md shadow-sm transition-all hover:scale-105 shrink-0 group cursor-default"
            >
              {/* Platform Logo / Indicator */}
              <div className={`w-8 h-8 rounded-xl ${platform.accent} border flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                <Video className={`w-4 h-4 ${platform.color}`} />
              </div>

              {/* Text Meta */}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                  {platform.name}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {platform.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
