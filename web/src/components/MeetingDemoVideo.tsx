"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX, Sparkles, ExternalLink } from "lucide-react";

export default function MeetingDemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const videoSrc = `${basePath}/videos/google-meet-demo.mp4`;
  const posterSrc = `${basePath}/videos/demo-poster.jpg`;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <section className="relative py-16 md:py-24 bg-[#030304] border-b border-zinc-800/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE DEMO RECORDING
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              See Blip in an Actual Meeting
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-xl">
              Watch a quick gesture vanish the video feed directly inside Google Meet, switching instantly to a calibrated empty room plate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/demo/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white font-medium text-xs tracking-normal transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Try Live Interactive Simulator</span>
            </Link>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
          {/* Header Bar Simulation */}
          <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-zinc-400">Google Meet - Live Call Capture</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 uppercase">
              Gesture: Snap / Pinch
            </div>
          </div>

          {/* Video Element */}
          <div
            className="relative aspect-video w-full bg-black cursor-pointer flex items-center justify-center"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              playsInline
              muted={isMuted}
              loop
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />

            {/* Play Overlay Button */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity">
                <button
                  type="button"
                  aria-label="Play Demo Video"
                  onClick={togglePlay}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-105"
                >
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                </button>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sub-note */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-2">
          <span>Resolution: 720p 30fps | Zero Cloud Transmission</span>
          <span className="text-zinc-400">Want to test it directly in your browser? <Link href="/demo/" className="text-red-400 underline hover:text-red-300">Open Browser Simulator</Link></span>
        </div>

      </div>
    </section>
  );
}

