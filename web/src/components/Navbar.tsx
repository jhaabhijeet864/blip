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
          ? "bg-[#000000]/95 backdrop-blur-md border-zinc-800 py-3 shadow-xl"
          : "bg-[#000000]/80 backdrop-blur-sm border-zinc-900 py-4"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Left: Brand Logo and Product Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 group-hover:border-zinc-700 transition-colors">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
              alt="Blip Logo"
              width={24}
              height={24}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white group-hover:text-zinc-200 transition-colors">
            BLIP
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
          <Link href="/#demo" className="hover:text-white transition-colors">
            Interactive Demo
          </Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/#scenarios" className="hover:text-white transition-colors">
            Everyday Uses
          </Link>
          <Link href="/download/" className="hover:text-white transition-colors font-semibold text-zinc-200">
            Download
          </Link>
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-zinc-600" />
          </a>

          <Link
            href="/download/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
