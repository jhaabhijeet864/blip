"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Download } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
}

export default function Hero() {
  const [isVanished, setIsVanished] = useState(false);
  const [isDisintegrating, setIsDisintegrating] = useState(false);
  const [isReappearing, setIsReappearing] = useState(false);
  const [clickHint, setClickHint] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const handImgRef = useRef<HTMLImageElement | null>(null);

  // Trigger Thanos snap disappearance when user touches/clicks the floating hand
  const triggerHandVanish = useCallback(() => {
    if (isDisintegrating || isVanished) return;

    setClickHint(false);
    setIsDisintegrating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw hand image onto canvas to sample pixels for authentic particle colors
    ctx.clearRect(0, 0, w, h);
    if (handImgRef.current && handImgRef.current.complete) {
      try {
        ctx.drawImage(handImgRef.current, w * 0.1, h * 0.1, w * 0.8, h * 0.8);
      } catch {
        // Fallback if cross-origin or canvas security blocks reading
      }
    }

    let imgData: ImageData | null = null;
    try {
      imgData = ctx.getImageData(0, 0, w, h);
    } catch {
      imgData = null;
    }
    ctx.clearRect(0, 0, w, h);

    // Spawn 800 organic disintegrating ash particles
    const count = 800;
    const particles: Particle[] = [];
    const cx = w * 0.5;
    const cy = h * 0.5;
    const rx = w * 0.32;
    const ry = h * 0.38;

    for (let i = 0; i < count; i++) {
      let px = cx;
      let py = cy;
      let r = 240, g = 90, b = 60; // Vibrant fiery/ember snap defaults

      if (imgData) {
        // Pick random valid pixel within bounding box
        for (let attempt = 0; attempt < 8; attempt++) {
          const randX = Math.floor(cx + (Math.random() - 0.5) * 2 * rx);
          const randY = Math.floor(cy + (Math.random() - 0.5) * 2 * ry);
          if (randX >= 0 && randX < w && randY >= 0 && randY < h) {
            const idx = (randY * w + randX) * 4;
            const alpha = imgData.data[idx + 3];
            if (alpha > 40) {
              px = randX;
              py = randY;
              r = imgData.data[idx];
              g = imgData.data[idx + 1];
              b = imgData.data[idx + 2];
              break;
            }
          }
        }
      } else {
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.sqrt(Math.random());
        px = cx + Math.cos(angle) * rx * rad;
        py = cy + Math.sin(angle) * ry * rad;
      }

      const maxLife = 1.0 + Math.random() * 0.8;
      particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 60 + 20,
        vy: -50 - Math.random() * 95,
        size: 1.5 + Math.random() * 3,
        alpha: 0.95,
        life: maxLife,
        maxLife,
        r,
        g,
        b,
      });
    }

    particlesRef.current = particles;
    let lastTime = performance.now();
    let progress = 0;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      progress += dt / 1.3;

      ctx.clearRect(0, 0, w, h);

      const pList = particlesRef.current;
      let alive = 0;

      for (let i = 0; i < pList.length; i++) {
        const p = pList[i];
        if (p.life > 0) {
          p.life -= dt;
          const curl = Math.sin(p.y * 0.02 + time * 0.003) * 25;
          p.x += (p.vx + curl) * dt;
          p.y += p.vy * dt;
          p.alpha = Math.max(0, p.life / p.maxLife);

          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          alive++;
        }
      }

      if (alive > 0 && progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, w, h);
        setIsDisintegrating(false);
        setIsVanished(true);

        // Auto reappear from dust after 2.6 seconds
        setTimeout(() => {
          setIsReappearing(true);
          setTimeout(() => {
            setIsVanished(false);
            setIsReappearing(false);
          }, 700);
        }, 2600);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  }, [isDisintegrating, isVanished]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

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
              <div
                onClick={triggerHandVanish}
                className={`relative z-10 w-full h-full max-w-[380px] max-h-[380px] sm:max-w-[420px] sm:max-h-[420px] flex items-center justify-center p-8 rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#09090b]/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] reticle-corner group transition-all duration-500 cursor-pointer select-none ${
                  isVanished && !isReappearing ? "opacity-30 border-dashed" : "hover:scale-[1.02] hover:border-red-500/40"
                }`}
                title="Touch or click to vanish into dust"
              >
                {/* Viewfinder corner accents */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-zinc-400 dark:border-zinc-700 pointer-events-none group-hover:border-red-500/70 transition-colors" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-zinc-400 dark:border-zinc-700 pointer-events-none group-hover:border-red-500/70 transition-colors" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-zinc-400 dark:border-zinc-700 pointer-events-none group-hover:border-red-500/70 transition-colors" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-zinc-400 dark:border-zinc-700 pointer-events-none group-hover:border-red-500/70 transition-colors" />

                {/* Micro interaction hint */}
                {clickHint && !isVanished && !isDisintegrating && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/10 text-[11px] font-mono text-zinc-400 group-hover:text-red-400 group-hover:border-red-500/30 transition-all pointer-events-none whitespace-nowrap shadow-md">
                    Click to vanish ⚡
                  </div>
                )}

                {/* Vanished empty state indicator */}
                {isVanished && !isReappearing && (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <span className="font-mono text-xs text-red-400 font-bold tracking-wider mb-1 animate-pulse">
                      [BLIPPED // EMPTY PLATE]
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Reappearing shortly...
                    </span>
                  </div>
                )}

                {/* Hand Logo Character with Disappearance & Reappearance Transition */}
                <img
                  ref={handImgRef}
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
                  alt="Blip Gesture Hand Snap"
                  className={`w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] animate-subtle-float select-none pointer-events-none transition-all duration-700 ${
                    isDisintegrating || (isVanished && !isReappearing)
                      ? "opacity-0 scale-95 blur-sm"
                      : isReappearing
                      ? "opacity-100 scale-100 blur-0"
                      : "opacity-100 scale-100"
                  }`}
                />

                {/* Particle Disintegration Canvas */}
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={400}
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
