import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jhaabhijeet864.github.io/blip"),
  title: "Blip — Disappear from Meetings with a Snap",
  description:
    "The gesture-triggered virtual camera utility for Google Meet, Zoom, and Teams. Snap your fingers or tap your temple to vanish from awkward video calls into an empty room.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Blip — Now You See Me. Blip.",
    description:
      "A cinematic virtual camera desktop app that lets you vanish from video meetings with natural hand gestures.",
    url: "https://jhaabhijeet864.github.io/blip",
    siteName: "Blip",
    images: [
      {
        url: "/icon.png",
        width: 256,
        height: 256,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
