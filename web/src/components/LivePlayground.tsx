"use client";

import React, { useEffect, useRef, useState } from "react";

export default function LivePlayground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const plateCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isVanished, setIsVanished] = useState(false);
  const [activeEffect, setActiveEffect] = useState<"none" | "snap" | "goku">("none");
  const [hasPlate, setHasPlate] = useState(false);
  const [fps, setFps] = useState(0);
  const [particleCount, setParticleCount] = useState(0);

  // Particles state
  const particlesRef = useRef<{
    x: number[];
    y: number[];
    vx: number[];
    vy: number[];
    size: number[];
    alpha: number[];
    life: number[];
    maxLife: number[];
    r: number[];
    g: number[];
    b: number[];
  }>({
    x: [],
    y: [],
    vx: [],
    vy: [],
    size: [],
    alpha: [],
    life: [],
    maxLife: [],
    r: [],
    g: [],
    b: [],
  });

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const effectProgressRef = useRef(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);
        };
      }
    } catch {
      alert("Webcam permission denied or camera unavailable.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setIsVanished(false);
    setActiveEffect("none");
  };

  const calibrateRoom = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    if (!plateCanvasRef.current) {
      plateCanvasRef.current = document.createElement("canvas");
    }
    plateCanvasRef.current.width = w;
    plateCanvasRef.current.height = h;
    const ctx = plateCanvasRef.current.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, w, h);
      setHasPlate(true);
    }
  };

  const triggerSnap = () => {
    if (!canvasRef.current || isVanished) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const ctx = canvasRef.current.getContext("2d");

    // Spawn 1500 ash particles from center silhouette
    const count = 1500;
    const p = particlesRef.current;
    p.x = new Array(count);
    p.y = new Array(count);
    p.vx = new Array(count);
    p.vy = new Array(count);
    p.size = new Array(count);
    p.alpha = new Array(count);
    p.life = new Array(count);
    p.maxLife = new Array(count);
    p.r = new Array(count);
    p.g = new Array(count);
    p.b = new Array(count);

    let imgData: ImageData | null = null;
    try {
      if (ctx) imgData = ctx.getImageData(0, 0, w, h);
    } catch {
      // Mock environment
    }

    const cx = w / 2;
    const cy = h * 0.55;
    const rx = w * 0.28;
    const ry = h * 0.42;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      const px = Math.floor(cx + Math.cos(angle) * rx * r);
      const py = Math.floor(cy + Math.sin(angle) * ry * r);

      p.x[i] = px;
      p.y[i] = py;
      p.vx[i] = (Math.random() - 0.5) * 45;
      p.vy[i] = -40 - Math.random() * 90;
      p.size[i] = 1.5 + Math.random() * 3.5;
      p.alpha[i] = 0.9;
      p.maxLife[i] = 1.2 + Math.random() * 0.8;
      p.life[i] = p.maxLife[i];

      if (imgData) {
        const idx = (py * w + px) * 4;
        p.r[i] = imgData.data[idx] || 160;
        p.g[i] = imgData.data[idx + 1] || 150;
        p.b[i] = imgData.data[idx + 2] || 140;
      } else {
        p.r[i] = 180;
        p.g[i] = 160;
        p.b[i] = 140;
      }
    }

    effectProgressRef.current = 0;
    setActiveEffect("snap");
    setParticleCount(count);
  };

  const triggerGoku = () => {
    if (isVanished) return;
    effectProgressRef.current = 0;
    setActiveEffect("goku");
  };

  const triggerReappear = () => {
    setIsVanished(false);
    setActiveEffect("none");
    effectProgressRef.current = 0;
    setParticleCount(0);
  };

  useEffect(() => {
    if (!isStreaming) return;

    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const now = performance.now();
      const dt = 1 / 30;

      // 1. Live camera render or clean room plate
      if (!isVanished && activeEffect === "none") {
        ctx.drawImage(video, 0, 0, w, h);
      } else if (isVanished) {
        if (hasPlate && plateCanvasRef.current) {
          ctx.drawImage(plateCanvasRef.current, 0, 0, w, h);
        } else {
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = "#64748b";
          ctx.font = "14px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Empty Room Plate (Vanished)", w / 2, h / 2);
        }
      }

      // 2. Snap effect transition
      if (activeEffect === "snap") {
        effectProgressRef.current += dt / 1.5;
        const progress = effectProgressRef.current;

        // Background underneath
        if (hasPlate && plateCanvasRef.current) {
          ctx.drawImage(plateCanvasRef.current, 0, 0, w, h);
        } else {
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, w, h);
        }

        // Fading subject
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1.0 - progress);
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();

        // Particles
        const p = particlesRef.current;
        let alive = 0;
        ctx.save();
        for (let i = 0; i < p.x.length; i++) {
          if (p.life[i] > 0) {
            p.life[i] -= dt;
            const curlX = Math.sin(p.y[i] * 0.02 + now * 0.003) * 20;
            p.x[i] += (p.vx[i] + curlX) * dt;
            p.y[i] += p.vy[i] * dt;
            const a = Math.max(0, p.life[i] / p.maxLife[i]);

            ctx.fillStyle = `rgba(${p.r[i]}, ${p.g[i]}, ${p.b[i]}, ${a})`;
            ctx.beginPath();
            ctx.arc(p.x[i], p.y[i], p.size[i], 0, Math.PI * 2);
            ctx.fill();
            alive++;
          }
        }
        ctx.restore();
        setParticleCount(alive);

        if (progress >= 1.0) {
          setActiveEffect("none");
          setIsVanished(true);
        }
      } else if (activeEffect === "goku") {
        effectProgressRef.current += dt / 0.8;
        const progress = effectProgressRef.current;

        if (hasPlate && plateCanvasRef.current) {
          ctx.drawImage(plateCanvasRef.current, 0, 0, w, h);
        } else {
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, w, h);
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1.0 - progress * 2);
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();

        // Anime speedlines
        ctx.save();
        const cx = w / 2;
        const cy = h * 0.45;
        const lineCount = 36;
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - progress * 1.5)})`;
        ctx.lineWidth = 2.5;

        for (let i = 0; i < lineCount; i++) {
          const angle = (i * (Math.PI * 2)) / lineCount;
          const rInner = 60 + progress * 140;
          const rOuter = Math.max(w, h);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * rInner, cy + Math.sin(angle) * rInner);
          ctx.lineTo(cx + Math.cos(angle) * rOuter, cy + Math.sin(angle) * rOuter);
          ctx.stroke();
        }
        ctx.restore();

        if (progress >= 1.0) {
          setActiveEffect("none");
          setIsVanished(true);
        }
      }

      // FPS tracking
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isStreaming, isVanished, activeEffect, hasPlate]);

  return (
    <section id="demo" className="py-20 border-t border-[#1e293b] bg-[#05070e] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-3 uppercase tracking-wider">
            Zero-Install Interactive Demo
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Try the Finger Snap Live in Your Browser
          </h2>
          <p className="text-[#94a3b8] max-w-2xl mx-auto text-base">
            No software to install. Grant camera access to test the Thanos ash disintegration and Goku instant transmission effect right inside your browser window. 100% private and on-device.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-[#0b0f19] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
          {/* Top Bar */}
          <div className="px-5 py-3 border-b border-[#1e293b] flex items-center justify-between bg-[#0e1424]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <span className="text-xs font-mono text-[#64748b] ml-2">blip-webcam-canvas: 1280x720</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-emerald-400 font-semibold">{fps} FPS</span>
              {particleCount > 0 && <span className="text-purple-400">{particleCount} Particles</span>}
            </div>
          </div>

          {/* Viewfinder Area */}
          <div className="relative aspect-video bg-[#000000] flex items-center justify-center">
            <video ref={videoRef} className="hidden" playsInline muted autoPlay />
            <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-cover" />

            {!isStreaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4 font-black text-2xl">
                  B
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Webcam Feed Inactive</h3>
                <p className="text-sm text-[#94a3b8] max-w-md mb-6">
                  Click below to enable your camera and test the disappearance effect live in your browser.
                </p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  Start Live Browser Camera
                </button>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="p-5 bg-[#0e1424] border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={triggerSnap}
                disabled={!isStreaming || isVanished}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-lg transition-all"
              >
                Snap to Dust
              </button>
              <button
                onClick={triggerGoku}
                disabled={!isStreaming || isVanished}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-lg transition-all"
              >
                Goku Flash
              </button>
              <button
                onClick={triggerReappear}
                disabled={!isStreaming || !isVanished}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-lg transition-all"
              >
                Reappear Live
              </button>
              <button
                onClick={calibrateRoom}
                disabled={!isStreaming}
                className="px-3 py-2 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-40 disabled:pointer-events-none text-xs text-white rounded-lg transition-all"
              >
                {hasPlate ? "Room Calibrated" : "Calibrate Room Plate"}
              </button>
            </div>

            {isStreaming && (
              <button
                onClick={stopCamera}
                className="px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Extension Callout */}
        <div className="mt-8 text-center text-xs text-[#64748b]">
          Looking for Google Meet and Teams integration? Load the Blip Extension via Developer Mode in Chrome.
        </div>
      </div>
    </section>
  );
}

