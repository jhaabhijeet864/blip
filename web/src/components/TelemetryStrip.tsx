"use client";

import React from "react";
import { Cpu, Zap, HardDrive, Eye, Radio } from "lucide-react";

export default function TelemetryStrip() {
  const stats = [
    {
      label: "CORE_RUNTIME",
      value: "TAURI 2.0 / RUST",
      detail: "Low-overhead native wrapper",
      icon: Cpu,
    },
    {
      label: "PIPE_LATENCY",
      value: "< 4.8MS / FRAME",
      detail: "Zero frame-drop threshold",
      icon: Zap,
    },
    {
      label: "MEMORY_PROFILE",
      value: "~38MB RESIDENT",
      detail: "Non-blocking background daemon",
      icon: HardDrive,
    },
    {
      label: "SEGMENTATION",
      value: "ON-DEVICE FP16",
      detail: "No cloud telemetry or upload",
      icon: Eye,
    },
    {
      label: "DRIVER_INTEGRATION",
      value: "DIRECTSHOW & OBS",
      detail: "Direct sink virtual camera loop",
      icon: Radio,
    },
  ];

  return (
    <section id="telemetry" className="border-b border-zinc-800 bg-[#050507]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-5 flex flex-col justify-between hover:bg-zinc-950/60 transition-colors"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-2">
                  <span>[{stat.label}]</span>
                  <Icon className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div>
                  <div className="font-mono font-bold text-sm text-white tracking-wide">
                    {stat.value}
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 mt-1">
                    {stat.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
