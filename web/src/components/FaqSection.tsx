"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Will people in my meeting know I'm using Blip?",
      a: "No! Google Meet, Zoom, and Teams simply treat Blip as a regular webcam device. Everyone in the call just sees you dissolve or teleport away into your empty chair, exactly like a camera feed.",
    },
    {
      q: "Do I need a green screen or special studio lighting?",
      a: "Not at all. Blip uses on-device selfie segmentation to automatically isolate your silhouette in front of any normal background. It also includes automatic room lighting compensation so your empty room plate looks totally natural.",
    },
    {
      q: "Is my video uploaded to any server or AI cloud?",
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
    <section id="faq" className="py-24 bg-[#0c0c0e] relative border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Everything you need to know about using Blip on your calls.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {faq.a}
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
