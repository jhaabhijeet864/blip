"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Terminal, ExternalLink } from "lucide-react";

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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none px-3 sm:px-6 pt-3 sm:pt-4">
      <div
        className={`max-w-[1240px] mx-auto pointer-events-auto rounded-2xl transition-all duration-300 relative border ${
          scrolled
            ? "bg-[#09090b]/80 border-red-500/30 shadow-[0_8px_32px_rgba(239,68,68,0.18),0_4px_16px_rgba(0,0,0,0.85)] py-2.5 px-4 sm:px-6"
            : "bg-[#09090b]/65 border-white/[0.08] hover:border-red-500/25 shadow-[0_8px_30px_rgba(239,68,68,0.12),0_2px_10px_rgba(0,0,0,0.7)] py-3 px-4 sm:px-7"
        } backdrop-blur-xl backdrop-saturate-150 overflow-hidden`}
      >
        {/* Ambient Red Hue Glow inside Glassmorphism Pill */}
        <div className="absolute -top-12 left-1/4 w-80 h-28 bg-red-500/20 blur-[50px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 right-1/4 w-60 h-20 bg-red-600/15 blur-[45px] pointer-events-none rounded-full" />
        {/* Subtle top rim highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Left: Brand Logo and Product Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-700/80 group-hover:border-red-500/50 flex items-center justify-center p-1.5 transition-all shadow-sm">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
                alt="Blip Logo"
                width={26}
                height={26}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="font-black text-lg tracking-tight text-white group-hover:text-red-400 transition-colors">
              BLIP
            </span>
          </Link>

          {/* Center: Clean & Standard Sized Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-zinc-300">
            <Link
              href="/demo/"
              className="text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>Live Simulator</span>
            </Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">
              Architecture
            </Link>
            <Link href="/#effects" className="hover:text-white transition-colors">
              Shaders &amp; FX
            </Link>
            <Link href="/download/" className="hover:text-white transition-colors font-medium">
              Download
            </Link>
            {/* Non-clickable crossed-out Pricing item */}
            <div
              className="relative flex items-center cursor-not-allowed select-none opacity-60 hover:opacity-80 transition-opacity"
              title="Blip is 100% free and open-source. No paid tiers."
            >
              <span className="text-zinc-400 line-through decoration-red-500 decoration-[1.5px]">
                Pricing
              </span>
            </div>
            <Link href="/#faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href="https://github.com/jhaabhijeet864/blip"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-900/90 text-zinc-300 hover:text-white text-xs sm:text-sm font-mono transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>

            <Link
              href="/download/"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Get Blip</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
