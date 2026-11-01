import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  metadataBase: new URL("https://jhaabhijeet864.github.io/blip"),
  title: "Blip — Real-Time Gesture-Controlled Virtual Camera",
  description:
    "Instant meeting exit utility for Google Meet, Zoom, and Teams. Snap or tap to dissolve into your calibrated background plate with sub-5ms pipeline latency.",
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: "any" },
      { url: `${basePath}/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
      { url: `${basePath}/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
      { url: `${basePath}/icon.png`, sizes: "192x192", type: "image/png" },
    ],
    shortcut: `${basePath}/favicon.ico`,
    apple: `${basePath}/apple-touch-icon.png`,
  },
  openGraph: {
    title: "Blip — Virtual Camera Disappearance Engine",
    description:
      "A cinematic, gesture-triggered virtual camera utility with local neural segmentation and DirectShow integration.",
    url: "https://jhaabhijeet864.github.io/blip",
    siteName: "Blip",
    images: [
      {
        url: `${basePath}/icon.png`,
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
      <head>
        <link rel="icon" href={`${basePath}/favicon.ico`} sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href={`${basePath}/favicon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${basePath}/favicon-16x16.png`} />
        <link rel="apple-touch-icon" href={`${basePath}/apple-touch-icon.png`} />
      </head>
      <body className="min-h-screen bg-[#000000] text-[#ededed] antialiased selection:bg-red-500 selection:text-white">
        {children}
        {/* Cloudflare Web Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "c11fdd757856483095a7c9caa311f384"}'
        />
      </body>
    </html>
  );
}
