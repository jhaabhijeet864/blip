"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Sparkles, ExternalLink } from "lucide-react";

export default function MeetingDemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const youtubeEmbedUrl = "https://www.youtube.com/embed/P_nakVxrFf0?autoplay=1&rel=0";

  return (
    <section className="relative py-16 md:py-24 bg-zinc-50 dark:bg-[#030304] border-b border-black/[0.08] dark:border-zinc-800/80 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs font-mono mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE DEMO RECORDING
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight transition-colors duration-300">
              See Blip in an Actual Meeting
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl transition-colors duration-300">
              Watch a quick gesture vanish the video feed directly inside Google Meet, switching instantly to a calibrated empty room plate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/demo/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-black/10 dark:border-zinc-700/80 text-zinc-900 dark:text-white font-medium text-xs tracking-normal transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Try Live Interactive Simulator</span>
            </Link>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-zinc-800 bg-white dark:bg-[#09090b] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Header Bar Simulation */}
          <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900/90 border-b border-black/10 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">Google Meet - Live Call Capture</span>
            </div>
            <a
              href="https://youtu.be/P_nakVxrFf0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1 uppercase transition-colors"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Video or YouTube Player Frame */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {isPlaying ? (
              <iframe
                src={youtubeEmbedUrl}
                title="Blip Demo Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                className="relative w-full h-full cursor-pointer group"
                onClick={() => setIsPlaying(true)}
              >
                {/* YouTube High-Res Thumbnail */}
                <img
                  src="https://img.youtube.com/vi/P_nakVxrFf0/maxresdefault.jpg"
                  alt="Blip Live Demo Thumbnail"
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    aria-label="Play Demo Video"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
                  >
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Sub-note */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-2">
          <span>Hosted on YouTube (HD 1080p)</span>
          <span className="text-zinc-500">Want to test it directly in your browser? <Link href="/demo/" className="text-red-500 underline hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">Open Browser Simulator</Link></span>
        </div>

      </div>
    </section>
  );
}
