"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, ExternalLink, Terminal } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
        scrolled
          ? "bg-[#000000]/95 backdrop-blur-md border-zinc-800 py-3 shadow-xl"
          : "bg-[#000000]/80 backdrop-blur-sm border-zinc-900 py-4"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Left: Technical Brand & Status */}
        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 group-hover:border-zinc-700 transition-colors">
              <Image
                src="/logo.svg"
                alt="Blip Symbol"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-wider text-white">
                BLIP
              </span>
              <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline">
                // SYS.VCAM
              </span>
            </div>
          </a>

          {/* Active Record Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-semibold">REC</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">30.0 FPS</span>
          </div>
        </div>

        {/* Center: Monospaced Nav Links */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-zinc-400">
          <a
            href="#simulator"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="text-zinc-600">01 //</span> SIMULATOR
          </a>
          <a
            href="#architecture"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="text-zinc-600">02 //</span> ARCHITECTURE
          </a>
          <a
            href="#telemetry"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="text-zinc-600">03 //</span> TELEMETRY
          </a>
          <a
            href="#terminal"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="text-zinc-600">04 //</span> TERMINAL
          </a>
          <a
            href="#releases"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="text-zinc-600">05 //</span> RELEASES
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/jhaabhijeet864/blip"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-mono text-xs transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-zinc-600" />
          </a>

          {/* High-Contrast Single-Accent Red CTA */}
          <a
            href="#releases"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white font-mono font-semibold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD V0.1.0</span>
          </a>
        </div>
      </div>
    </header>
  );
}
