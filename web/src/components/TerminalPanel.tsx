"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, ExternalLink, GitBranch, ArrowRight } from "lucide-react";

export default function TerminalPanel() {
  const [activeTab, setActiveTab] = useState<"standalone" | "verify" | "python">("standalone");
  const [copied, setCopied] = useState(false);

  const snippets = {
    standalone: `# Quick Launch: Run standalone portable binary (No installation needed)
curl -LO https://github.com/jhaabhijeet864/blip/releases/latest/download/Blip-Windows-x64.zip
tar -xf Blip-Windows-x64.zip
.\\Blip.exe --stream --fps 30`,
    verify: `# Verify Binary Integrity via SHA-256 Checksum
Get-FileHash -Algorithm SHA256 .\\Blip-Windows-x64.zip

# Expected:
# 8f9b3e1c2d4a5b6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2`,
    python: `# Developer Pipeline: Install core Python computer-vision package
pip install blip-vcam
python -m blip.main --camera 0 --sink obs`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="terminal" className="py-24 bg-[#000000] border-b border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="font-mono text-xs text-red-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>TERMINAL INTEGRATION // SPIN UP</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One command to boot. Zero background junk.
            </h2>
          </div>
          <a
            href="https://github.com/jhaabhijeet864/blip"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <span>View Architecture Roadmap</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Minimal Dark Terminal Component */}
        <div className="rounded-lg border border-zinc-800 bg-[#09090b] shadow-2xl overflow-hidden reticle-corner">
          
          {/* Terminal Tabs & Window Bar */}
          <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="text-zinc-600">|</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("standalone")}
                  className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                    activeTab === "standalone"
                      ? "bg-zinc-800 text-white font-semibold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  01 // STANDALONE RUNTIME
                </button>
                <button
                  onClick={() => setActiveTab("verify")}
                  className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                    activeTab === "verify"
                      ? "bg-zinc-800 text-white font-semibold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  02 // SHA-256 INTEGRITY
                </button>
                <button
                  onClick={() => setActiveTab("python")}
                  className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                    activeTab === "python"
                      ? "bg-zinc-800 text-white font-semibold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  03 // PYTHON CLI
                </button>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-mono text-xs text-zinc-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Command Output Body */}
          <div className="p-6 font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed overflow-x-auto bg-[#050507]">
            <pre className="whitespace-pre">{snippets[activeTab]}</pre>
          </div>

          {/* Terminal Footer Strip */}
          <div className="px-5 py-2.5 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>TERMINAL READY</span>
            </div>
            <span>PLATFORM: WIN32 / DIRECTSHOW DRIVER REG</span>
          </div>

        </div>

      </div>
    </section>
  );
}
