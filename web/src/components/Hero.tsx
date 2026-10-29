"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, Terminal, ChevronRight, Activity, Crosshair, RotateCcw, Sparkles, Zap, Shield, Play } from "lucide-react";

export default function Hero() {
  const [activeState, setActiveState] = useState<"normal" | "thanos" | "goku" | "empty">("normal");
  const [activeTrigger, setActiveTrigger] = useState<string>("NONE");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger Thanos Dissolve
  const triggerThanos = () => {
    setActiveState("thanos");
    setActiveTrigger("PINCH_VELOCITY_SNAP (THANOS)");
    setTimeout(() => {
      setActiveState("empty");
      setActiveTrigger("STREAMING_CALIBRATED_PLATE");
    }, 1800);
  };

  // Trigger Goku Teleport
  const triggerGoku = () => {
    setActiveState("goku");
    setActiveTrigger("TEMPLE_COORDINATE_TAP (GOKU)");
    setTimeout(() => {
      setActiveState("empty");
      setActiveTrigger("STREAMING_CALIBRATED_PLATE");
    }, 1000);
  };

  // Reset Camera Feed
  const resetStream = () => {
    setActiveState("normal");
    setActiveTrigger("LIVE_RESTORE");
  };

  // Canvas particle disintegration engine for Thanos Snap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }> = [];

    if (activeState === "thanos") {
      const pCount = 380;
      for (let i = 0; i < pCount; i++) {
        particles.push({
          x: canvas.width * 0.35 + Math.random() * (canvas.width * 0.3),
          y: canvas.height * 0.25 + Math.random() * (canvas.height * 0.5),
          vx: (Math.random() - 0.5) * 4.5 + 2.5,
          vy: -Math.random() * 5.5 - 1.5,
          size: Math.random() * 2.8 + 1,
          alpha: Math.random() * 0.8 + 0.2,
          color: Math.random() > 0.4 ? "#a1a1aa" : "#71717a",
        });
      }

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy -= 0.05; // upward drift
          p.alpha -= 0.012;

          if (p.alpha > 0) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillRect(p.x, p.y, p.size, p.size);
          }
        });

        particles = particles.filter((p) => p.alpha > 0);
        if (particles.length > 0) {
          animId = requestAnimationFrame(render);
        }
      };

      render();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeState]);

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
          {/* RIGHT COLUMN: Interactive Camera Viewfinder HUD Simulator */}
          {/* ========================================================= */}
          <div className="lg:col-span-6">
            <div className="relative rounded-lg border border-zinc-800 bg-[#09090b] shadow-2xl overflow-hidden reticle-corner">
              
              {/* Viewfinder Top Bar / Metadata Strip */}
              <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white font-bold">DEV_VCAM_01</span>
                  <span className="text-zinc-600">|</span>
                  <span>1280x720 RAW</span>
                </div>
                <div className="flex items-center gap-4 text-zinc-500">
                  <span>30.0 FPS</span>
                  <span className="text-zinc-400 font-semibold">3.8 MS</span>
                </div>
              </div>

              {/* Viewfinder Canvas Stage */}
              <div className="relative w-full aspect-video bg-[#050507] overflow-hidden flex items-center justify-center">
                
                {/* Viewfinder Reticle Corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-zinc-600 pointer-events-none" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-zinc-600 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-zinc-600 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-zinc-600 pointer-events-none" />

                {/* Viewfinder Center Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-12 h-px bg-white" />
                  <div className="h-12 w-px bg-white -ml-[24px]" />
                </div>

                {/* Background Plate Representation (Office Room Chair) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Subtle room boundary lines */}
                  <div className="w-full h-full opacity-10 flex flex-col justify-end items-center pb-8">
                    <div className="w-48 h-36 border border-dashed border-zinc-500 rounded-t-3xl" />
                    <div className="w-24 h-12 border-x border-zinc-500" />
                    <div className="w-40 h-2 bg-zinc-700" />
                  </div>
                </div>

                {/* Dynamic Subject Silhouette */}
                {activeState === "normal" && (
                  <div className="relative z-10 flex flex-col items-center justify-center transition-opacity duration-300">
                    {/* Bounding Box with tracking coordinates */}
                    <div className="relative border border-dashed border-red-500/60 p-4 rounded bg-red-500/[0.02]">
                      <div className="absolute -top-5 left-0 font-mono text-[10px] text-red-400 bg-black/90 px-1 border border-zinc-800">
                        TARGET: SILHOUETTE [CONF: 0.984]
                      </div>

                      {/* Head and torso wireframe */}
                      <div className="w-24 h-24 rounded-full border-2 border-zinc-400 bg-zinc-800/80 flex items-center justify-center shadow-lg mx-auto relative">
                        <div className="w-16 h-16 rounded-full border border-zinc-600 bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-300">
                          FACE_01
                        </div>
                      </div>
                      <div className="w-44 h-20 bg-zinc-800/90 border border-zinc-600 rounded-t-3xl mt-2 flex items-center justify-center">
                        <span className="font-mono text-[10px] text-zinc-400">TORSO_MATTE_FP16</span>
                      </div>

                      {/* 21-point Hand Landmark Coordinate Lattice Simulation */}
                      <div className="absolute -bottom-2 -right-10 bg-black/90 border border-zinc-700 p-2 rounded">
                        <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-400 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>HAND_LANDMARKS [21 PTS]</span>
                        </div>
                        {/* Mini joint lattice dots */}
                        <div className="w-16 h-14 relative border border-zinc-800/80 bg-zinc-950 flex items-center justify-center">
                          <div className="absolute w-1 h-1 bg-red-400 rounded-full top-2 left-3" />
                          <div className="absolute w-1 h-1 bg-red-400 rounded-full top-4 left-6" />
                          <div className="absolute w-1 h-1 bg-red-400 rounded-full top-3 left-10" />
                          <div className="absolute w-1 h-1 bg-red-400 rounded-full top-8 left-8" />
                          <div className="absolute w-1 h-1 bg-red-400 rounded-full bottom-2 left-7" />
                          {/* Connecting coordinate vector line */}
                          <svg className="w-full h-full absolute inset-0 opacity-40">
                            <line x1="12" y1="8" x2="24" y2="16" stroke="#ef4444" strokeWidth="1" />
                            <line x1="24" y1="16" x2="40" y2="12" stroke="#ef4444" strokeWidth="1" />
                            <line x1="24" y1="16" x2="32" y2="32" stroke="#ef4444" strokeWidth="1" />
                            <line x1="32" y1="32" x2="28" y2="48" stroke="#ef4444" strokeWidth="1" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Goku Speedlines Flash State */}
                {activeState === "goku" && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-white/10 animate-pulse">
                    <div className="font-mono text-xs text-white bg-black/80 px-3 py-1.5 border border-zinc-700">
                      [GOKU_TELEPORT // 100MS SPEEDLINE DISPATCH]
                    </div>
                  </div>
                )}

                {/* Empty State Overlay */}
                {activeState === "empty" && (
                  <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
                    <div className="px-3 py-1 rounded bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-zinc-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>EMPTY PLATE BROADCAST ACTIVE</span>
                    </div>
                    <p className="mt-2 text-xs font-mono text-zinc-500">
                      Zero human silhouette detected · Meeting attendees see calibrated office background
                    </p>
                  </div>
                )}

                {/* Particle disintegration canvas for Thanos snap */}
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={337}
                  className="absolute inset-0 pointer-events-none z-20 w-full h-full"
                />

                {/* Bottom HUD Overlay */}
                <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between font-mono text-[10px] text-zinc-400 pointer-events-none z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600">TRIGGER:</span>
                    <span className="text-zinc-200 font-semibold">{activeTrigger}</span>
                  </div>
                  <div className="text-zinc-500">
                    SHM_SINK: /dev/shm/blip_pipe
                  </div>
                </div>
              </div>

              {/* Viewfinder Controls Toolbar */}
              <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={triggerThanos}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-mono text-xs text-zinc-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    <span>[TRG_01] THANOS DISSOLVE</span>
                  </button>

                  <button
                    onClick={triggerGoku}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-mono text-xs text-zinc-200 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-zinc-400" />
                    <span>[TRG_02] GOKU TELEPORT</span>
                  </button>
                </div>

                <button
                  onClick={resetStream}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-mono text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>[RST] RESTORE</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
