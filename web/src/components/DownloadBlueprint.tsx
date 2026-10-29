"use client";

import React, { useState } from "react";
import { Download, ExternalLink, HardDrive, ShieldCheck, Check, Copy, Terminal } from "lucide-react";

export default function DownloadBlueprint() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("pip install blip");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="download" className="py-24 bg-[#050507] border-b border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Main Download Card */}
        <div className="rounded-3xl p-8 sm:p-14 bg-[#09090b] border-2 border-zinc-800 shadow-2xl relative overflow-hidden text-center">
          
          <div className="max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-wider font-bold text-red-500">
              Get Started In Seconds
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
              Ready to Blip?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-400">
              Download the standalone Windows app. Just unzip and run. No installation wizards, account logins, or background telemetry.
            </p>

            {/* Primary Action Button */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/jhaabhijeet864/blip/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-base transition-all shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-5 h-5 text-white" />
                <span>Download for Windows (.zip)</span>
              </a>

              <a
                href="https://github.com/jhaabhijeet864/blip/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm border border-zinc-800 transition-colors"
              >
                <span>All Releases</span>
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </a>
            </div>

            {/* Verification & System Specs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-zinc-500" />
                <span>Windows 10 / 11 (64-bit)</span>
              </span>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Offline &amp; Free</span>
              </span>
              <span className="text-zinc-700">·</span>
              <span>Standalone Portable (~42 MB)</span>
            </div>

            {/* Clean, Discreet Pip Install Snippet */}
            <div className="mt-10 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
                <Terminal className="w-3.5 h-3.5" />
                <span>Prefer terminal?</span>
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs font-mono text-zinc-300">
                <span>pip install blip</span>
                <button
                  onClick={copyCommand}
                  className="p-1 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
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
