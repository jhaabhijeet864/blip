"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  MonitorUp,
  PhoneOff,
  Sparkles,
  Zap,
  RotateCcw,
  ShieldCheck,
  Users,
  Layers,
  Activity,
  Sliders,
} from "lucide-react";

export default function GoogleMeetDemo() {
  const [activeState, setActiveState] = useState<"normal" | "thanos" | "goku" | "empty">("normal");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [statusText, setStatusText] = useState("Meeting in progress — You are live in Google Meet");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger Thanos Snap Disappearance
  const handleThanosSnap = () => {
    setActiveState("thanos");
    setStatusText("Gesture Recognized: Thumb-middle snap detected! Dissolving person silhouette into ash...");
    setTimeout(() => {
      setActiveState("empty");
      setStatusText("Vanished! Blip is streaming your pre-captured empty room plate to Google Meet.");
    }, 1800);
  };

  // Trigger Goku Instant Transmission Vanish
  const handleGokuVanish = () => {
    setActiveState("goku");
    setStatusText("Gesture Recognized: Two fingers at temple! Triggering anime speedlines & teleport flash...");
    setTimeout(() => {
      setActiveState("empty");
      setStatusText("Teleported! Room is completely empty. Colleague audio continues uninterrupted.");
    }, 1100);
  };

  // Trigger Reappearance
  const handleReappear = () => {
    setActiveState("normal");
    setStatusText("Reappeared! Live camera feed restored smoothly.");
  };

  // Particle canvas simulation for Thanos snap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
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
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width * 0.5;
      const centerY = height * 0.55;

      for (let i = 0; i < 550; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 110;
        particles.push({
          x: centerX + Math.cos(angle) * (radius * 0.8),
          y: centerY + Math.sin(angle) * (radius * 1.15),
          vx: Math.random() * 2.5 + 0.4,
          vy: -(Math.random() * 3.8 + 1.4),
          size: Math.random() * 3 + 1.2,
          alpha: 1.0,
          color: Math.random() > 0.4 ? "#a1a1aa" : "#71717a",
        });
      }

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let aliveCount = 0;

        for (let p of particles) {
          if (p.alpha > 0.02) {
            aliveCount++;
            p.x += p.vx + (Math.random() - 0.5) * 0.8;
            p.y += p.vy;
            p.alpha -= 0.014;

            ctx.fillStyle = `rgba(161, 161, 170, ${Math.max(0, p.alpha)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (aliveCount > 0) {
          animationFrameId = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      render();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeState]);

  return (
    <section id="demo" className="py-24 bg-[#09090b] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-amber-500/[0.03] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Interactive Google Meet Demonstration
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            See how Blip looks in a real video call.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Click the buttons below to trigger the gestures and watch what your colleagues see in Google Meet.
          </p>
        </div>

        {/* ========================================================= */}
        {/* GOOGLE MEET WINDOW SIMULATOR (Widescreen 16:9 Desktop View) */}
        {/* ========================================================= */}
        <div className="w-full rounded-2xl border border-zinc-800 bg-[#121214] shadow-2xl overflow-hidden glow-white">
          {/* Top Window Bar */}
          <div className="px-5 py-3.5 bg-[#18181b] border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/80" />
                <div className="w-3 h-3 rounded-full bg-[#eab308]/80" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]/80" />
              </div>
              <span className="font-semibold text-zinc-200 hidden sm:inline">
                Weekly Team Standup &amp; Sync
              </span>
              <span className="text-zinc-500 font-mono">blip-sync-call</span>
            </div>

            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                3 in call
              </span>
              <span className="font-mono text-zinc-400 hidden sm:inline">11:42 AM</span>
            </div>
          </div>

          {/* Video Conference Tiles Grid */}
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[460px] sm:min-h-[520px] bg-[#0c0c0e]">
            {/* Colleague 1 Tile */}
            <div className="rounded-xl border border-zinc-800/80 bg-[#141416] p-4 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between z-10">
                <span className="text-[11px] font-semibold text-zinc-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-zinc-800">
                  Sarah Miller (Lead)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              {/* Animated Speaking Avatar */}
              <div className="my-auto flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-emerald-500/50 flex items-center justify-center font-bold text-xl text-zinc-200 shadow-lg relative">
                  SM
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-full">
                    <Mic className="w-3 h-3 text-black" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 h-3">
                  <div className="w-1 bg-emerald-500 h-3 animate-pulse rounded-full" />
                  <div className="w-1 bg-emerald-500 h-2 animate-pulse rounded-full" />
                  <div className="w-1 bg-emerald-500 h-3.5 animate-pulse rounded-full" />
                  <div className="w-1 bg-emerald-500 h-1.5 animate-pulse rounded-full" />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2">"Let's review the quarterly roadmap..."</span>
              </div>

              <div className="text-[10px] text-zinc-500 z-10 flex items-center justify-between">
                <span>Mic Active</span>
                <span>Zoom / Web</span>
              </div>
            </div>

            {/* MAIN FEATURED TILE: YOU (Camera: Blip Virtual Camera) */}
            <div className="lg:col-span-3 rounded-xl border-2 border-zinc-700 bg-black relative flex flex-col justify-between overflow-hidden shadow-inner min-h-[380px] sm:min-h-[480px]">
              {/* Virtual Camera Header */}
              <div className="p-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white bg-black/75 px-3 py-1 rounded backdrop-blur-md border border-zinc-700 flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    You (Blip Virtual Camera)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-zinc-300 bg-zinc-900/90 px-2.5 py-0.5 rounded border border-zinc-800">
                    720p @ 30 FPS Lock
                  </span>
                </div>
              </div>

              {/* Canvas Overlay for Particle Ash Drift */}
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="absolute inset-0 w-full h-full pointer-events-none z-15"
              />

              {/* STAGE VISUAL: PERSON VS EMPTY ROOM */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                {/* 1. The Clean Empty Room Plate (Always Present Beneath) */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#18181b] via-[#121214] to-[#09090b] flex flex-col items-center justify-center">
                  <div className="w-full h-full relative flex items-center justify-center">
                    {/* Background Wall Decor & Shelf */}
                    <div className="absolute top-14 left-20 w-44 h-24 border border-zinc-800/80 rounded bg-zinc-900/40" />
                    <div className="absolute top-16 right-20 w-32 h-44 border border-zinc-800/80 rounded bg-zinc-900/30 flex flex-col justify-around p-3">
                      <div className="w-full h-2 bg-zinc-800 rounded" />
                      <div className="w-full h-2 bg-zinc-800 rounded" />
                      <div className="w-full h-2 bg-zinc-800 rounded" />
                    </div>

                    {/* Empty Ergonomic Office Chair */}
                    <div className="relative z-0 flex flex-col items-center">
                      <div className="w-28 h-36 rounded-t-2xl bg-zinc-800/80 border border-zinc-700 shadow-xl" />
                      <div className="w-32 h-10 rounded-b-xl bg-zinc-800 border border-zinc-700" />
                      <div className="w-5 h-20 bg-zinc-700 mt-0.5" />
                      <div className="w-28 h-3.5 bg-zinc-800 rounded-full" />
                    </div>

                    {/* Desk Surface */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-900 to-zinc-950 border-t border-zinc-800 flex items-center justify-between px-16">
                      <div className="w-20 h-10 rounded-t bg-zinc-800/60 border border-zinc-700" />
                      <div className="w-8 h-10 rounded bg-zinc-800 border border-zinc-700" />
                    </div>
                  </div>
                </div>

                {/* 2. The Person Silhouette (Disappears on effect trigger) */}
                <div
                  className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
                    activeState === "normal"
                      ? "opacity-100 scale-100"
                      : activeState === "thanos"
                      ? "opacity-30 scale-95 blur-sm"
                      : activeState === "goku"
                      ? "opacity-0 scale-125 brightness-200"
                      : "opacity-0 scale-90 pointer-events-none"
                  }`}
                >
                  {/* Person Head */}
                  <div className="w-28 h-32 rounded-full bg-zinc-300 border-2 border-white shadow-2xl relative flex items-center justify-center">
                    <div className="w-20 h-10 rounded-full bg-zinc-950/20 mt-8" />
                  </div>
                  {/* Person Shoulders / Torso */}
                  <div className="w-56 h-36 rounded-t-3xl bg-zinc-400 border-2 border-white -mt-4 shadow-2xl flex items-center justify-center">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest mt-8">
                      You
                    </span>
                  </div>
                </div>

                {/* Goku Anime Speedlines & Electric Ki Flash Overlay */}
                {activeState === "goku" && (
                  <div className="absolute inset-0 bg-white/95 z-20 animate-pulse flex items-center justify-center" />
                )}
              </div>

              {/* Bottom State Badge Overlay */}
              <div className="p-4 flex items-center justify-between z-20">
                <div className="bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-zinc-800 text-xs flex items-center gap-2.5 shadow-lg">
                  {activeState === "empty" ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-zinc-200 font-semibold">
                        Vanished — Sustaining calibrated empty room plate in Google Meet
                      </span>
                    </>
                  ) : activeState === "thanos" ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-ping" />
                      <span className="text-zinc-200 font-semibold">
                        Disintegrating into 2,500 ash particles...
                      </span>
                    </>
                  ) : activeState === "goku" ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      <span className="text-white font-semibold">
                        Instant Transmission Teleport!
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-zinc-300 font-medium">
                        Live Webcam Feed Active
                      </span>
                    </>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-black/70 px-3 py-1 rounded border border-zinc-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Zero Cloud · 100% On-Device Processing
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Google Meet Controls Bar */}
          <div className="px-6 py-4 bg-[#18181b] border-t border-zinc-800 flex items-center justify-between">
            <div className="text-xs text-zinc-400 font-medium hidden sm:block">
              Camera Input: <span className="text-white font-semibold">Blip Virtual Camera</span>
            </div>

            {/* Meet Circular Buttons */}
            <div className="flex items-center gap-3.5 mx-auto sm:mx-0">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full border transition-all ${
                  isMuted
                    ? "bg-red-500/20 border-red-500/50 text-red-400"
                    : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3.5 rounded-full border transition-all ${
                  !isVideoOn
                    ? "bg-red-500/20 border-red-500/50 text-red-400"
                    : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                }`}
                title="Camera Toggle"
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button className="p-3.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 transition-colors">
                <Hand className="w-4 h-4" />
              </button>

              <button className="p-3.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 transition-colors">
                <MonitorUp className="w-4 h-4" />
              </button>

              <button className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-lg">
                <PhoneOff className="w-4 h-4" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>

            <div className="text-xs text-emerald-400 font-semibold hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Connected
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE CONTROLLER / TRIGGER DECK */}
        {/* ========================================================= */}
        <div className="mt-8 p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#121214] shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Interactive Gesture Simulation
              </span>
              <p className="text-sm text-zinc-300 mt-1 font-medium">
                {statusText}
              </p>
            </div>

            {/* Clean Vector Action Buttons (Zero Emojis) */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleThanosSnap}
                disabled={activeState === "thanos"}
                className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs flex items-center gap-2.5 transition-all hover:border-amber-400 shadow-md active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Snap Dissolve</span>
                <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                  Pinch &amp; Flick
                </span>
              </button>

              <button
                onClick={handleGokuVanish}
                disabled={activeState === "goku"}
                className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs flex items-center gap-2.5 transition-all hover:border-amber-400 shadow-md active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Goku Teleport</span>
                <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                  Temple Tap
                </span>
              </button>

              <button
                onClick={handleReappear}
                className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center gap-2.5 transition-all shadow-md active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-zinc-950" />
                <span>Restore Camera</span>
                <span className="text-[10px] text-zinc-600 font-mono bg-zinc-200 px-2 py-0.5 rounded border border-zinc-300">
                  Ctrl+Alt+S
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
