"use client";

import React from "react";
import Image from "next/image";
import { Terminal, Shield, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 bg-[#050507] text-zinc-400 text-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-900">
          
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5">
              <Image
                src="/logo.svg"
                alt="Blip Logo"
                width={18}
                height={18}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight text-sm">
                BLIP
              </span>
              <span className="text-zinc-500 ml-2">
                · Gesture-Controlled Disappearance for Online Meetings
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-zinc-400">
            <a
              href="https://github.com/jhaabhijeet864/blip"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5 font-mono"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://github.com/jhaabhijeet864/blip/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Releases
            </a>
            <a
              href="https://github.com/jhaabhijeet864/blip/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              MIT License
            </a>
            <a
              href="https://github.com/jhaabhijeet864/blip/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Support &amp; Issues
            </a>
          </div>

        </div>

        {/* Bottom Status Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-zinc-500 text-xs">
          <div>
            100% Offline &amp; Safe · Runs locally on your device with zero cloud tracking
          </div>
          <div>
            © {new Date().getFullYear()} Blip. Free &amp; Open Source.
          </div>
        </div>
      </div>
    </footer>
  );
}
