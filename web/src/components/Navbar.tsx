"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Sparkles, Video, ExternalLink, Zap } from "lucide-react";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/80 py-3 shadow-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-amber-500/50 transition-colors shadow-inner">
            <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              BLIP
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                v0.1
              </span>
            </span>
            <span className="text-[10px] text-zinc-400 tracking-wide font-medium -mt-0.5">
              Instant Meeting Vanish
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a
            href="#demo"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Video className="w-4 h-4 text-zinc-500" />
            Live Meet Demo
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#effects" className="hover:text-white transition-colors">
            Cinematic Effects
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/jhaabhijeet864/blip"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            GitHub
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>

          <a
            href="#download"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-[0_0_20px_-3px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            Download for Windows
          </a>
        </div>
      </div>
    </header>
  );
}
