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
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 shadow-sm">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
                alt="Blip Logo"
                width={24}
                height={24}
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

          {/* Links & Product Hunt Badge */}
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
            <a
              href="https://www.producthunt.com/products/blip-12?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-blip-13"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-90 ml-0 sm:ml-2"
            >
              <img
                alt="Blip - Snap your fingers to vanish from your meetings. 100% Free. | Product Hunt"
                width="180"
                height="38"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1300131&theme=dark&t=1793521394392"
                className="w-[180px] h-auto object-contain"
              />
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
