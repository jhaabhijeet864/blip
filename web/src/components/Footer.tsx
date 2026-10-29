"use client";

import React from "react";
import Image from "next/image";
import { Terminal, Shield, GitBranch, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 bg-[#050507] border-t border-zinc-800 text-zinc-400 font-mono text-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-900">
          
          {/* Brand & System Spec */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1">
              <Image
                src="/logo.svg"
                alt="Blip Logo"
                width={16}
                height={16}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-white tracking-wider">
                BLIP
              </span>
              <span className="text-zinc-600 ml-2">
                // SYSTEM RELEASE V0.1.0 (BUILD 8F9B3E)
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-zinc-500">
            <a
              href="https://github.com/jhaabhijeet864/blip"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SOURCE REPO</span>
            </a>
            <a
              href="https://github.com/jhaabhijeet864/blip/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              MIT LICENSE
            </a>
            <a
              href="https://github.com/jhaabhijeet864/blip/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              ISSUE TRACKER
            </a>
          </div>

        </div>

        {/* Bottom Technical Status Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-zinc-600 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>OPERATIONAL STATUS: NOMINAL · DIRECTSHOW KERNEL FILTER ACTIVE</span>
          </div>
          <div>
            100% AIR-GAPPED &amp; LOCAL COMPUTATION · ZERO ANALYTICS OR CLOUD LOGGING
          </div>
        </div>
      </div>
    </footer>
  );
}
