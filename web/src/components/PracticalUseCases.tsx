"use client";

import React from "react";
import { Coffee, Package, Clock, LogOut } from "lucide-react";

export default function PracticalUseCases() {
  const useCases = [
    {
      title: "The Never-Ending Status Call",
      quote: "When an all-hands meeting drags into hour two with zero relevance to your day.",
      scenario: "Snap your fingers and slip away. Your camera continues showing your peaceful, empty office without awkward interruption.",
      icon: Clock,
      tag: "Time Saver",
    },
    {
      title: "The Surprise Package at the Door",
      quote: "The delivery driver is aggressively knocking right in the middle of a discussion.",
      scenario: "Don't scramble for your mouse while saying 'sorry guys hold on'. Just tap your temple, vanish, grab the package, and reappear.",
      icon: Package,
      tag: "Zero Panic",
    },
    {
      title: "The Urgent Coffee Refill",
      quote: "You desperately need water or caffeine to survive the afternoon presentation.",
      scenario: "Vanish cleanly for 3 minutes. Your chair stays visible, looking calm and intentional, while you brew your fresh cup in peace.",
      icon: Coffee,
      tag: "Stealth Comfort",
    },
    {
      title: "The Irish Exit from Giant Calls",
      quote: "Avoid the agonizing 5-minute goodbye loop with 40 people saying 'bye' in unison.",
      scenario: "Dissolve into ash right before the call concludes. A legendary exit that colleagues will be talking about in Slack for weeks.",
      icon: LogOut,
      tag: "Iconic Exit",
    },
  ];

  return (
    <section id="scenarios" className="py-24 bg-[#000000] border-b border-zinc-800 relative overflow-hidden">
      {/* Background red atmospheric tint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-red-600/[0.04] blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-red-500 font-mono">
            Real-World Scenarios
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Built for everyday awkward meetings.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Practical reasons people everywhere keep Blip running in their background.
          </p>
        </div>

        {/* 4 Cards Grid with Hard Glassmorphism & Hover Pop Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="hard-glass-card rounded-2xl p-7 flex flex-col justify-between cursor-default group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-white/10 group-hover:border-red-500/50 flex items-center justify-center text-zinc-300 transition-colors shadow-inner">
                      <Icon className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-900/90 border border-white/10 group-hover:border-red-500/30 text-zinc-300 transition-colors">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs italic text-zinc-500 mb-4 border-l-2 border-red-500/40 pl-3">
                    "{item.quote}"
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    {item.scenario}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
