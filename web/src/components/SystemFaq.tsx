"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function SystemFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Will people in my meeting know I'm using Blip?",
      a: "No! Google Meet, Zoom, and Teams simply treat Blip as a regular webcam device. Everyone in the call just sees you dissolve or teleport away into your empty chair, exactly like a natural camera feed.",
    },
    {
      q: "Do I need a green screen or special studio lighting?",
      a: "Not at all. Blip automatically isolates you in front of any normal home or office background. It also includes automatic room lighting compensation so your empty room plate looks totally natural.",
    },
    {
      q: "Is my video uploaded to any cloud or external server?",
      a: "Zero. Blip runs 100% locally on your machine. No frames, audio, or telemetry ever touch the internet. It works completely offline even with your Wi-Fi disconnected.",
    },
    {
      q: "Does this work with my laptop's built-in webcam?",
      a: "Yes! Any standard built-in laptop webcam or external USB camera is immediately detected and supported.",
    },
    {
      q: "Which meeting apps can I use this in?",
      a: "Google Meet (all browsers), Zoom Desktop, Microsoft Teams, Discord, Skype, and OBS Studio—any application with a camera selection dropdown.",
    },
    {
      q: "How do I return back to the call when I want to?",
      a: "Simply repeat your gesture in front of the camera, or press the universal shortcut Ctrl+Alt+S. Blip will smoothly fade you right back into your chair.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-[#000000] border-b border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-red-500">
            Clear Answers
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Everything you need to know about using Blip on your calls.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="divide-y divide-zinc-800 border border-zinc-800 bg-[#09090b] rounded-2xl overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="transition-colors hover:bg-zinc-950/60">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 sm:px-8 py-5 flex items-center justify-between text-left transition-colors"
                >
                  <span className="font-semibold text-base sm:text-lg text-zinc-200 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-8 pb-6 pt-1 text-sm sm:text-base text-zinc-400 leading-relaxed border-t border-zinc-900 bg-black/40">
                    <p className="max-w-3xl">
                      {faq.a}
                    </p>
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
