"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Terminal, ExternalLink, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none px-3 sm:px-6 pt-3.5 sm:pt-5 transition-all duration-300">
      {/* Background Red Atmospheric Glow behind Navbar */}
      <div className="max-w-[1240px] mx-auto relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-24 bg-gradient-to-r from-red-600/20 via-red-500/30 to-rose-600/20 blur-[55px] pointer-events-none rounded-full animate-ambient-glow" />
      </div>

      <div
        className={`max-w-[1240px] mx-auto pointer-events-auto rounded-full transition-all duration-300 relative ${
          scrolled ? "hard-glass-navbar-scrolled py-2.5 px-5 sm:px-7" : "hard-glass-navbar py-3 px-5 sm:px-8"
        }`}
      >
        {/* Specular White Rim Light Top Edge */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/50 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Left: Brand Icon + Title */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-black border border-black/10 dark:border-white/20 group-hover:border-red-500/60 flex items-center justify-center p-1.5 transition-all shadow-md group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
                alt="Blip Logo"
                width={26}
                height={26}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
              />
            </div>
            <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors drop-shadow-sm">
              BLIP
            </span>
          </Link>

          {/* Center: Standard Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <Link
              href="/demo/"
              className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-semibold transition-all flex items-center gap-1.5 hover:scale-105"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>Live Simulator</span>
            </Link>
            <Link href="/#how-it-works" className="hover:text-zinc-900 dark:hover:text-white transition-colors hover:scale-105 duration-150">
              Architecture
            </Link>
            <Link href="/#effects" className="hover:text-zinc-900 dark:hover:text-white transition-colors hover:scale-105 duration-150">
              Shaders &amp; FX
            </Link>
            <Link href="/download/" className="hover:text-zinc-900 dark:hover:text-white transition-colors hover:scale-105 duration-150 font-medium">
              Download
            </Link>
            {/* Non-clickable crossed-out Pricing */}
            <div
              className="relative flex items-center cursor-not-allowed select-none opacity-60 hover:opacity-80 transition-opacity"
              title="Blip is 100% free and open-source. No paid tiers."
            >
              <span className="text-zinc-500 dark:text-zinc-400 line-through decoration-red-500 decoration-[1.5px]">
                Pricing
              </span>
            </div>
            <Link href="/#faq" className="hover:text-zinc-900 dark:hover:text-white transition-colors hover:scale-105 duration-150">
              FAQ
            </Link>
          </nav>

          {/* Right: Actions + Dark/Light Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sun / Moon Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
              aria-label="Toggle Dark / Light Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-white" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-900" />
              )}
            </button>

            <a
              href="https://github.com/jhaabhijeet864/blip"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-200 hover:text-black dark:hover:text-white text-xs sm:text-sm font-mono transition-all hover:scale-105"
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <Link
              href="/download/"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.65)] hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Get Blip</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
