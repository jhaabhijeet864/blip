"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Download,
  Terminal,
  ExternalLink,
  HardDrive,
  ShieldCheck,
  Check,
  Copy,
  Chrome,
  Monitor,
  Apple,
  FolderArchive,
  Info,
  ChevronRight,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

export default function DownloadPage() {
  const [copiedPip, setCopiedPip] = useState(false);
  const [copiedShaWindows, setCopiedShaWindows] = useState(false);
  const [copiedShaExtension, setCopiedShaExtension] = useState(false);

  const windowsSha256 = "158b77631b41138a3f552329f01af72d7d580d15298a9713881713f39e198e37";
  const extensionSha256 = "283D32B0AFF3CF10CCF742857DA9FEF1861843ED64B0A061BC9F4E3C1820711B";

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed] selection:bg-red-500 selection:text-white flex flex-col bg-blueprint-grid">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12">
          
          {/* Breadcrumb & Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-zinc-800 bg-zinc-950 font-mono text-[11px] text-zinc-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>GLOBAL DISTRIBUTION HUB</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-300 font-semibold">100% FREE &amp; OPEN SOURCE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Download Blip for Your Setup
            </h1>
            <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              Select your platform below. Blip runs entirely locally on your device with zero cloud tracking, no mandatory account sign-ups, and sub-5ms disappearance shaders.
            </p>
          </div>

          {/* ========================================================= */}
          {/* PRIMARY DOWNLOAD MATRIX (EXTENSION & WINDOWS DESKTOP)     */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            
            {/* ------------------------------------------------------- */}
            {/* CARD 1: CHROME EXTENSION (ZERO-INSTALL WEBRTC)          */}
            {/* ------------------------------------------------------- */}
            <div className="relative rounded-2xl border-2 border-red-500/40 bg-[#09090b] p-7 sm:p-9 shadow-2xl flex flex-col justify-between reticle-corner overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-500/10 border-b border-l border-red-500/30 text-red-400 font-mono text-[11px] font-bold rounded-bl-xl">
                RECOMMENDED FOR MEET &amp; CHROMIUM
              </div>

              <div>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-sm">
                    <Chrome className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Chrome Extension
                    </h2>
                    <span className="text-xs font-mono text-zinc-400">
                      v1.0.0 · Packaged ZIP Archive (~35 KB)
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                  Zero-install WebRTC interceptor. Seamlessly integrates directly into Google Meet, Teams Web, and Zoom Web inside Chrome, Edge, and Brave without needing OBS or OS virtual camera drivers.
                </p>

                {/* Compatibility Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-8 text-xs font-mono text-zinc-400">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">Google Chrome</span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">Brave</span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">Microsoft Edge</span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">Arc</span>
                </div>

                {/* Direct Download Button */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
                  <a
                    href="/downloads/blip-extension.zip"
                    download="blip-extension.zip"
                    className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_-5px_rgba(239,68,68,0.5)] hover:scale-[1.01] active:scale-[0.99] text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Extension (.zip)</span>
                  </a>

                  <a
                    href="https://github.com/jhaabhijeet864/blip/releases/latest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-mono text-xs transition-colors"
                    title="View GitHub Release"
                  >
                    <span>Mirrors</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                </div>

                {/* 3-Step Load Unpacked Walkthrough */}
                <div className="rounded-xl border border-zinc-800/90 bg-[#050507] p-5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-zinc-300 font-bold mb-3">
                    <Info className="w-4 h-4 text-red-400" />
                    <span>How to Install in 30 Seconds (Load Unpacked):</span>
                  </div>

                  <ol className="space-y-2 text-zinc-400 leading-relaxed list-decimal list-inside">
                    <li>
                      Download and extract <span className="text-zinc-200 font-semibold">blip-extension.zip</span> to any folder.
                    </li>
                    <li>
                      Open your browser and navigate to <code className="text-red-400 bg-zinc-900 px-1 py-0.5 rounded">chrome://extensions</code>.
                    </li>
                    <li>
                      Turn on <span className="text-zinc-200 font-semibold">Developer mode</span> (toggle in top-right corner).
                    </li>
                    <li>
                      Click <span className="text-zinc-200 font-semibold">Load unpacked</span> and choose the extracted folder.
                    </li>
                  </ol>
                </div>
              </div>

              {/* SHA256 Verification */}
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                <span className="truncate max-w-[280px]">
                  SHA256: {extensionSha256.slice(0, 16)}...
                </span>
                <button
                  onClick={() => copyToClipboard(extensionSha256, setCopiedShaExtension)}
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedShaExtension ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* CARD 2: WINDOWS STANDALONE PORTABLE APP (.ZIP / .EXE)    */}
            {/* ------------------------------------------------------- */}
            <div className="relative rounded-2xl border-2 border-zinc-800 bg-[#09090b] p-7 sm:p-9 shadow-2xl flex flex-col justify-between reticle-corner overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-zinc-800/60 border-b border-l border-zinc-700 text-zinc-300 font-mono text-[11px] font-bold rounded-bl-xl">
                SYSTEM-WIDE VIRTUAL CAMERA
              </div>

              <div>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-sm">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Windows Desktop
                    </h2>
                    <span className="text-xs font-mono text-zinc-400">
                      v1.0.1 · Standalone Portable Archive (~95 MB)
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                  DirectShow OS-level virtual camera utility. Broadcasts high-performance SIMD disappearance streams across Zoom desktop, Microsoft Teams desktop, Google Meet, OBS Studio, and Discord.
                </p>

                {/* Compatibility Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-8 text-xs font-mono text-zinc-400">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">Windows 10 / 11 (64-bit)</span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">Zoom Desktop</span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">Teams Client</span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">OBS VirtualCam</span>
                </div>

                {/* Direct Download Button */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
                  <a
                    href="https://github.com/jhaabhijeet864/blip/releases/latest/download/Blip-Windows-x64.zip"
                    className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-mono font-bold text-sm tracking-wide transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download for Windows (.zip)</span>
                  </a>

                  <a
                    href="https://github.com/jhaabhijeet864/blip/releases/latest/download/Blip-Studio.exe"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-mono text-xs transition-colors text-center"
                    title="Standalone Executable"
                  >
                    <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Studio .exe</span>
                  </a>
                </div>

                {/* Portable Execution Walkthrough */}
                <div className="rounded-xl border border-zinc-800/90 bg-[#050507] p-5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-zinc-300 font-bold mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Portable Standalone Setup (Zero Installer Wizard):</span>
                  </div>

                  <ol className="space-y-2 text-zinc-400 leading-relaxed list-decimal list-inside">
                    <li>
                      Download <span className="text-zinc-200 font-semibold">Blip-Windows-x64.zip</span> and extract to any folder.
                    </li>
                    <li>
                      Double click <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded">Blip.exe</code> to start the camera engine.
                    </li>
                    <li>
                      Select your physical webcam, click <span className="text-zinc-200 font-semibold">Start Camera</span>.
                    </li>
                    <li>
                      In Zoom or Teams, select <span className="text-red-400 font-semibold">Blip Virtual Camera</span> as your video device.
                    </li>
                  </ol>
                </div>
              </div>

              {/* SHA256 Verification */}
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                <span className="truncate max-w-[280px]">
                  SHA256: {windowsSha256.slice(0, 16)}...
                </span>
                <button
                  onClick={() => copyToClipboard(windowsSha256, setCopiedShaWindows)}
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedShaWindows ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* UPCOMING GLOBAL PLATFORMS (MACOS & LINUX - GRAYED OUT)    */}
          {/* ========================================================= */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Upcoming Platform Ecosystems
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Apple macOS (Grayed Out) */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-6 opacity-60 cursor-not-allowed relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Apple className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-300">Apple macOS Universal</h4>
                      <span className="text-[11px] font-mono text-zinc-500">Apple Silicon (M1-M4) &amp; Intel x64</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
                    COMING SOON
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Native macOS CoreMediaIO Camera Extension with hardware Metal shaders for macOS Sequoia &amp; Sonoma. Currently in active development.
                </p>
                <div className="mt-4 pt-3 border-t border-zinc-900/80 flex items-center justify-between text-[11px] font-mono text-zinc-600">
                  <span>Target: macOS Universal (.dmg)</span>
                  <span>CoreMediaIO Sink</span>
                </div>
              </div>

              {/* Linux Desktop (Grayed Out) */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-6 opacity-60 cursor-not-allowed relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-300">Linux Desktop</h4>
                      <span className="text-[11px] font-mono text-zinc-500">Ubuntu, Debian, Fedora &amp; Arch</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
                    COMING SOON
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  V4L2 (Video4Linux2) loopback virtual camera sink with local ONNX inference. Standalone AppImage and source distributions in preparation.
                </p>
                <div className="mt-4 pt-3 border-t border-zinc-900/80 flex items-center justify-between text-[11px] font-mono text-zinc-600">
                  <span>Target: Portable (.AppImage)</span>
                  <span>v4l2loopback Sink</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

