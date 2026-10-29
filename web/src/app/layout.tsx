import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jhaabhijeet864.github.io/blip"),
  title: "Blip — Real-Time Gesture-Controlled Virtual Camera",
  description:
    "Instant meeting exit utility for Google Meet, Zoom, and Teams. Snap or tap to dissolve into your calibrated background plate with sub-5ms pipeline latency.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Blip — Virtual Camera Disappearance Engine",
    description:
      "A cinematic, gesture-triggered virtual camera utility with local neural segmentation and DirectShow integration.",
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
      <body className="min-h-screen bg-[#000000] text-[#ededed] antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
