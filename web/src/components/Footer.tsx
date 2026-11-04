"use client";

import React from "react";
import Image from "next/image";
import { Terminal } from "lucide-react";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="py-12 bg-[#050507] text-zinc-400 text-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-900">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 shadow-sm">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
                alt="Blip Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight text-base">
                BLIP
              </span>
            </div>
          </div>

          {/* Links & Socials */}
          <div className="flex flex-wrap items-center gap-6 text-zinc-400 text-sm">
            <a
              href="https://github.com/jhaabhijeet864/blip"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5 font-mono"
            >
              <Terminal className="w-4 h-4 text-zinc-400" />
              <span>GitHub</span>
            </a>
            <a
              href="https://x.com/jhaabhijeet864"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <TwitterIcon className="w-4 h-4 text-zinc-400" />
              <span>X (Twitter)</span>
            </a>
            <a
              href="https://www.linkedin.com/in/abhijeetcreates/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LinkedinIcon className="w-4 h-4 text-zinc-400" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/jhaabhijeet864/blip/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Releases
            </a>
            <a
              href="https://github.com/jhaabhijeet864/blip/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              MIT License
            </a>
            <a
              href="https://www.producthunt.com/products/blip-12?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-blip-13"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-90 ml-0 sm:ml-2"
            >
              <img
                alt="Blip - Snap your fingers to vanish from your meetings. 100% Free. | Product Hunt"
                width="180"
                height="38"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1300131&theme=dark&t=1793521394392"
                className="w-[180px] h-auto object-contain"
              />
            </a>
          </div>

        </div>

        {/* Bottom Status Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-zinc-500 text-xs">
          <div>
            100% Local &amp; Private · Open Source Software
          </div>
          <div>
            Created by{" "}
            <a
              href="https://x.com/jhaabhijeet864"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white underline transition-colors"
            >
              Abhijeet Jha
            </a>
            . Distributed under MIT License.
          </div>
        </div>
      </div>
    </footer>
  );
}
