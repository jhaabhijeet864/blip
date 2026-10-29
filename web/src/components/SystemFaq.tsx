"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function SystemFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      id: "01",
      q: "How does Blip interface with meeting software without a plugin?",
      a: "Blip registers as a native DirectShow virtual capture filter on Windows and an IPC virtual camera sink for OBS Studio. Meeting applications (Google Meet in Chrome/Edge, Zoom, Teams) query the operating system's standard media device enumeration API, treating Blip identical to an external physical USB camera.",
    },
    {
      id: "02",
      q: "Does any video frame or telemetry leave the local computer?",
      a: "Zero. Blip operates completely air-gapped. MediaPipe hand landmark extraction, person silhouette segmentation, particle physics, and frame blending execute entirely on your local CPU/GPU using on-device FP16 neural models. No network sockets or cloud telemetry exist in the binary.",
    },
    {
      id: "03",
      q: "What camera hardware and lighting conditions are required?",
      a: "Any standard DirectShow-compatible webcam (built-in 720p/1080p laptop cameras or external USB webcams) is immediately supported. Blip performs automatic adaptive luminance matching when calibrating your background plate to ensure natural transition blending under varying room lighting.",
    },
    {
      id: "04",
      q: "How do I instantly restore my camera feed when returning?",
      a: "You can repeat your gesture in front of the camera, or press the global system shortcut Ctrl+Alt+S. Blip smoothly transitions from the calibrated background plate back to your live video feed.",
    },
    {
      id: "05",
      q: "What is the memory and CPU overhead during active calls?",
      a: "Blip maintains a resident memory profile of approximately 38MB to 45MB. Inference runs with sub-5ms pipeline latency at 30 FPS, utilizing less than 3% CPU overhead on modern multi-core processors.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-[#000000] border-b border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="font-mono text-xs text-red-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>TECHNICAL SPEC // FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              System architecture &amp; security FAQs.
            </h2>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="divide-y divide-zinc-800 border border-zinc-800 bg-[#09090b] rounded-lg overflow-hidden reticle-corner">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="transition-colors hover:bg-zinc-950/60">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-zinc-500">
                      {faq.id} //
                    </span>
                    <span className="font-mono font-bold text-sm sm:text-base text-zinc-200">
                      {faq.q}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 bg-black/40">
                    <div className="max-w-4xl pl-10 border-l border-zinc-800">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
