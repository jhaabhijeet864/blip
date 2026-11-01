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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
        scrolled
          ? "bg-[#000000]/95 backdrop-blur-md border-zinc-800 py-3.5 shadow-xl"
          : "bg-[#000000]/80 backdrop-blur-sm border-zinc-900 py-4"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Left: Brand Logo and Product Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 group-hover:border-zinc-700 transition-colors">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
              alt="Blip Logo"
              width={26}
              height={26}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
            BLIP
          </span>
        </Link>

        {/* Center: Clean & Standard Sized Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-medium text-zinc-400">
          <Link href="/demo/" className="hover:text-white transition-colors text-red-400 font-semibold">
            Live Simulator
          </Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">
            Architecture
          </Link>
          <Link href="/#effects" className="hover:text-white transition-colors">
            Shaders &amp; FX
          </Link>
          <Link href="/download/" className="hover:text-white transition-colors font-semibold text-zinc-200">
            Download
          </Link>
          {/* Non-clickable crossed-out Pricing item (No free badge) */}
          <div className="relative flex items-center cursor-not-allowed select-none" title="Blip is 100% free and open-source.">
            <span className="text-zinc-500 line-through decoration-red-500 decoration-[1.5px]">
              Pricing
            </span>
          </div>
          <Link href="/#faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/jhaabhijeet864/blip"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white text-sm font-mono transition-colors"
          >
            <Terminal className="w-4 h-4 text-zinc-400" />
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>

          <Link
            href="/download/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Get Blip</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
