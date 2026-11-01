"use client";

import React from "react";
import Link from "next/link";
import { Download, ExternalLink, ShieldCheck, HardDrive } from "lucide-react";

export default function DownloadBlueprint() {
  return (
    <section id="download" className="py-24 bg-[#020203] border-b border-zinc-800/80 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        
        {/* Container Blueprint */}
        <div className="relative rounded-2xl border border-zinc-800 bg-[#070709] p-8 sm:p-14 text-center overflow-hidden">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-500/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Blueprint Corner Accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-zinc-700 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-zinc-700 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-zinc-700 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-zinc-700 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Get Started In Seconds</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Blip?
            </h2>

            {/* Description */}
            <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
              Get the Chrome extension or standalone Windows app. Just extract and run. No installation wizards, account logins, or background telemetry.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/download/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-red-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Go to Downloads Hub</span>
              </Link>

              <a
                href="https://github.com/jhaabhijeet864/blip/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white font-medium text-sm transition-colors"
              >
                <span>GitHub Releases</span>
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </a>
            </div>

            {/* Verification & System Specs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-zinc-500" />
                <span>Chrome Extension &amp; Windows Desktop</span>
              </span>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Offline &amp; Free</span>
              </span>
              <span className="text-zinc-700">·</span>
              <span>Open Source MIT</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
