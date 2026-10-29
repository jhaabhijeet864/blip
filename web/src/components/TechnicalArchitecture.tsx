"use client";

import React from "react";
import { Crosshair, Layers, Radio, Activity, GitBranch, Binary, Cpu } from "lucide-react";

export default function TechnicalArchitecture() {
  return (
    <section id="architecture" className="py-24 bg-[#000000] border-b border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 pb-6 border-b border-zinc-800">
          <div>
            <div className="font-mono text-xs text-red-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>SYSTEM ARCHITECTURE // THREE-LAYER PIPELINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Deterministic, on-device signal processing.
            </h2>
          </div>
          <p className="mt-4 sm:mt-0 font-mono text-xs text-zinc-500 max-w-sm">
            Zero telemetry. Zero external servers. Every frame is ingested, segmented, and injected into the DirectShow subsystem locally.
          </p>
        </div>

        {/* 3-Column Blueprint Grid with Viewfinder Corner Reticles */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border border-zinc-800 bg-zinc-950/40">
          
          {/* ========================================================= */}
          {/* LAYER 01: GESTURE MAPPING ENGINE */}
          {/* ========================================================= */}
          <div className="p-8 sm:p-10 flex flex-col justify-between relative group hover:bg-zinc-900/30 transition-colors">
            {/* Viewfinder Crosshairs */}
            <span className="absolute -top-1.5 -left-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>

            <div>
              <div className="flex items-center justify-between font-mono text-xs text-zinc-500 mb-6">
                <span>LAYER 01 // INFERENCE</span>
                <span className="text-zinc-400 font-semibold">21 KEYPOINTS</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Gesture Mapping Engine
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
                MediaPipe-based 3D landmark extractor tracking 21 skeletal joints per hand. Computes inter-finger Euclidean distance and pinch release velocity within 12ms.
              </p>

              {/* Concrete Schematic Asset: Hand Landmark Matrix */}
              <div className="rounded border border-zinc-800 bg-black p-4 font-mono text-[11px] text-zinc-400 space-y-2 mb-6">
                <div className="flex justify-between border-b border-zinc-900 pb-1 text-zinc-500">
                  <span>METRIC</span>
                  <span>THRESHOLD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">THUMB_TIP_DIST (x,y,z)</span>
                  <span className="text-red-400">&lt; 0.045 EUCLID</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">RELEASE_VELOCITY</span>
                  <span className="text-zinc-200">&gt; 180 PX/FRAME</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">TEMPLE_COORDINATE_BOX</span>
                  <span className="text-zinc-200">CONF &gt; 95%</span>
                </div>
              </div>
            </div>

            <div className="font-mono text-[11px] text-zinc-500 flex items-center gap-2 pt-4 border-t border-zinc-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Hardware-accelerated joint inference</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* LAYER 02: BACKGROUND SEGMENTATION */}
          {/* ========================================================= */}
          <div className="p-8 sm:p-10 flex flex-col justify-between relative group hover:bg-zinc-900/30 transition-colors">
            {/* Viewfinder Crosshairs */}
            <span className="absolute -top-1.5 -left-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>

            <div>
              <div className="flex items-center justify-between font-mono text-xs text-zinc-500 mb-6">
                <span>LAYER 02 // MATTING</span>
                <span className="text-zinc-400 font-semibold">FP16 DUAL-BUFFER</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Background Segmentation
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
                Synthesizes a high-precision binary alpha matte between the live presenter and the environment. Uses temporal smoothing to eliminate hair fringing and lighting jitter.
              </p>

              {/* Concrete Schematic Asset: Dual-Buffer Flow Diagram */}
              <div className="rounded border border-zinc-800 bg-black p-4 font-mono text-[11px] text-zinc-400 space-y-2 mb-6">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="text-zinc-600">[BUF_A]</span>
                  <span>LIVE RGB FRAME (1280x720)</span>
                </div>
                <div className="text-center text-zinc-700 text-xs">↓ NEURAL MATTE MASK ↓</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="text-zinc-600">[BUF_B]</span>
                  <span>CALIBRATED EMPTY ROOM PLATE</span>
                </div>
                <div className="text-center text-zinc-700 text-xs">↓ DISSOLVE / TELEPORT SHADER ↓</div>
                <div className="flex items-center justify-between text-red-400 pt-1 border-t border-zinc-900">
                  <span>DISPATCH BUFFER</span>
                  <span>30.0 FPS SYNC</span>
                </div>
              </div>
            </div>

            <div className="font-mono text-[11px] text-zinc-500 flex items-center gap-2 pt-4 border-t border-zinc-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Adaptive lighting compensation</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* LAYER 03: VIRTUAL CAMERA PIPE */}
          {/* ========================================================= */}
          <div className="p-8 sm:p-10 flex flex-col justify-between relative group hover:bg-zinc-900/30 transition-colors">
            {/* Viewfinder Crosshairs */}
            <span className="absolute -top-1.5 -left-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>

            <div>
              <div className="flex items-center justify-between font-mono text-xs text-zinc-500 mb-6">
                <span>LAYER 03 // DRIVER SINK</span>
                <span className="text-zinc-400 font-semibold">SHARED MEMORY</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Virtual Camera Pipe
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
                DirectShow and OBS Virtual Camera loopback device sink. Streams processed frames directly to kernel memory with zero IPC copies or socket overhead.
              </p>

              {/* Concrete Schematic Asset: IPC Sink Spec */}
              <div className="rounded border border-zinc-800 bg-black p-4 font-mono text-[11px] text-zinc-400 space-y-2 mb-6">
                <div className="flex justify-between border-b border-zinc-900 pb-1 text-zinc-500">
                  <span>INTEGRATION</span>
                  <span>STATUS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">GOOGLE MEET (BROWSER)</span>
                  <span className="text-emerald-400">DETECTED (PLUG &amp; PLAY)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">ZOOM DESKTOP CLIENT</span>
                  <span className="text-emerald-400">DIRECTSHOW COMPLIANT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">MICROSOFT TEAMS</span>
                  <span className="text-emerald-400">HARDWARE ACCELERATED</span>
                </div>
              </div>
            </div>

            <div className="font-mono text-[11px] text-zinc-500 flex items-center gap-2 pt-4 border-t border-zinc-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Universal OS driver loopback</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
