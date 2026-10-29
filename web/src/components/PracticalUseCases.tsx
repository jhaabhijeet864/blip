"use client";

import React from "react";
import { Coffee, Package, Clock, LogOut } from "lucide-react";

export default function PracticalUseCases() {
  const useCases = [
    {
      title: "The Never-Ending Status Call",
      quote: "When an all-hands call drags into hour two with zero relevance to your day.",
      scenario: "Snap your fingers and slip away. Your camera continues showing your peaceful, empty office without awkward interruption.",
      icon: Clock,
      tag: "Time Saver",
    },
    {
      title: "The Surprise Package at the Door",
      quote: "The delivery driver is aggressively pounding on your door right in the middle of a discussion.",
      scenario: "Don't scramble for your mouse to hit mute while saying 'sorry guys hold on'. Just tap your temple, vanish, grab the package, and reappear.",
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
      title: "The Irish Exit from Giant Meetings",
      quote: "Avoid the agonizing 5-minute goodbye loop with 40 people saying 'bye' in unison.",
      scenario: "Dissolve into ash right before the call concludes. A legendary exit that colleagues will be talking about in Slack for weeks.",
      icon: LogOut,
      tag: "Iconic Exit",
    },
  ];

  return (
    <section className="py-24 bg-[#0c0c0e] relative border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
            Real World Scenarios
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Built for everyday awkward meetings.
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Practical reasons people everywhere keep Blip running in their background.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl p-7 bg-[#141416] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-800 text-amber-400 border border-zinc-700">
                      {item.tag}
                    </span>
                    <Icon className="w-5 h-5 text-zinc-500" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <blockquote className="text-xs italic text-zinc-400 mb-3 pl-3 border-l-2 border-zinc-700">
                    "{item.quote}"
                  </blockquote>
                  <p className="text-xs text-zinc-400 leading-relaxed">
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
