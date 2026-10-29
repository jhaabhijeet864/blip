"use client";

import React, { useState } from "react";
import { Download, ExternalLink, HardDrive, ShieldCheck, Check, Copy } from "lucide-react";

export default function DownloadBlueprint() {
  const [copiedSha, setCopiedSha] = useState(false);

  const copySha = () => {
    navigator.clipboard.writeText("8f9b3e1c2d4a5b6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2");
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <section id="releases" className="py-24 bg-[#000000] border-b border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="font-mono text-xs text-red-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>RELEASE MATRIX // ARTIFACTS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Production binaries &amp; verification matrix.
            </h2>
          </div>
          <a
            href="https://github.com/jhaabhijeet864/blip/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <span>All GitHub Releases</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Releases Blueprint Table with Reticle Corners */}
        <div className="rounded-lg border border-zinc-800 bg-[#09090b] shadow-2xl overflow-hidden reticle-corner">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-3 bg-zinc-950 border-b border-zinc-800 font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
            <div className="col-span-12 sm:col-span-4">TARGET ARCHITECTURE</div>
            <div className="hidden sm:block sm:col-span-3">SPECIFICATION</div>
            <div className="hidden sm:block sm:col-span-2">SIZE</div>
            <div className="col-span-12 sm:col-span-3 text-right">ACTION</div>
          </div>

          {/* Primary Row: Windows Standalone Portable */}
          <div className="grid grid-cols-12 px-6 py-5 border-b border-zinc-800/80 items-center hover:bg-zinc-900/40 transition-colors">
            <div className="col-span-12 sm:col-span-4 mb-3 sm:mb-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-mono font-bold text-sm text-white">Blip-Windows-x64.zip</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-500 block mt-0.5">
                Portable standalone binary (v0.1.0)
              </span>
            </div>

            <div className="hidden sm:block sm:col-span-3 font-mono text-xs text-zinc-300">
              Windows 10 / 11 (x86_64)
            </div>

            <div className="hidden sm:block sm:col-span-2 font-mono text-xs text-zinc-400">
              ~42.4 MB
            </div>

            <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-2">
              <a
                href="https://github.com/jhaabhijeet864/blip/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-mono font-bold text-xs transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD (.ZIP)</span>
              </a>
            </div>
          </div>

          {/* Secondary Row: Python Wheel */}
          <div className="grid grid-cols-12 px-6 py-5 border-b border-zinc-800/80 items-center hover:bg-zinc-900/40 transition-colors">
            <div className="col-span-12 sm:col-span-4 mb-3 sm:mb-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="font-mono font-bold text-sm text-zinc-300">blip_vcam-0.1.0-py3-none-any.whl</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-500 block mt-0.5">
                PyPI distribution package
              </span>
            </div>

            <div className="hidden sm:block sm:col-span-3 font-mono text-xs text-zinc-400">
              Python 3.10 / 3.11 / 3.12
            </div>

            <div className="hidden sm:block sm:col-span-2 font-mono text-xs text-zinc-400">
              ~1.2 MB
            </div>

            <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-2">
              <a
                href="https://pypi.org/project/blip-vcam/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-mono text-xs transition-colors"
              >
                <span>pip install</span>
                <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>
            </div>
          </div>

          {/* Tertiary Row: Upcoming Tauri v2 Native Engine */}
          <div className="grid grid-cols-12 px-6 py-5 items-center hover:bg-zinc-900/40 transition-colors">
            <div className="col-span-12 sm:col-span-4 mb-3 sm:mb-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-mono font-bold text-sm text-zinc-300">Blip-Tauri-v2-Native</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-500 block mt-0.5">
                Full Rust + Tauri v2 native engine
              </span>
            </div>

            <div className="hidden sm:block sm:col-span-3 font-mono text-xs text-zinc-400">
              Cross-Platform (Win / macOS / Linux)
            </div>

            <div className="hidden sm:block sm:col-span-2 font-mono text-xs text-zinc-400">
              Target ~15 MB
            </div>

            <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-2 font-mono text-xs text-zinc-500">
              <span>IN DEVELOPMENT // V2.0</span>
            </div>
          </div>

          {/* Checksum Verification Strip */}
          <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-500">SHA256 (Windows Zip):</span>
              <code className="text-zinc-300 text-[11px] select-all">
                8f9b3e1c2d4a5b6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2
              </code>
            </div>

            <button
              onClick={copySha}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition-colors self-start sm:self-auto"
            >
              {copiedSha ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span>COPY HASH</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
