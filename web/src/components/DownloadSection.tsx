"use client";

import React, { useState } from "react";
import { Download, ShieldCheck, Check, Copy, Terminal, ExternalLink, HardDrive } from "lucide-react";

export default function DownloadSection() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("pip install blip");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="download" className="py-24 bg-[#09090b] relative border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Download Card Container */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#141417] to-[#0d0d0f] border-2 border-zinc-800 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.04] blur-[90px] rounded-full pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
              Get Started In Seconds
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
              Ready to Blip?
            </h2>
            <p className="mt-4 text-base text-zinc-400">
              Download the standalone Windows application. Just unzip and run. No installation wizards or background bloatware.
            </p>

            {/* Primary Action Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/jhaabhijeet864/blip/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-zinc-950 font-extrabold text-base hover:bg-zinc-200 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-5 h-5 text-zinc-950" />
                <span>Download for Windows (.zip)</span>
              </a>

              <a
                href="https://github.com/jhaabhijeet864/blip/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm border border-zinc-800 transition-colors"
              >
                All Releases &amp; Checksums
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </a>
            </div>

            {/* Verification Specs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                Windows 10 / 11 (64-bit)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SHA-256 Verified
              </span>
              <span>•</span>
              <span>100% Free &amp; Open Source</span>
            </div>

            {/* Python Developer Callout */}
            <div className="mt-10 pt-8 border-t border-zinc-800/80 text-left">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  Prefer Python or Command Line?
                </span>
                <span className="text-[11px] text-zinc-500">Requires Python 3.10+</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-zinc-300">
                <span>pip install blip</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  title="Copy command"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
