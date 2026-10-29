"use client";

import React from "react";
import Image from "next/image";
import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 bg-[#09090b] border-t border-zinc-900 text-xs text-zinc-500">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 overflow-hidden">
            <Image
              src="/logo.svg"
              alt="Blip Logo"
              width={22}
              height={22}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">BLIP</span>
            <span className="ml-2 text-zinc-500">· Now you see me. Blip.</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/jhaabhijeet864/blip"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
          <a
            href="https://github.com/jhaabhijeet864/blip/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            MIT License
          </a>
          <a
            href="https://github.com/jhaabhijeet864/blip/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            Releases
          </a>
        </div>

        <div className="text-zinc-600 text-center sm:text-right">
          Built for people who sit through too many meetings.
        </div>
      </div>
    </footer>
  );
}
