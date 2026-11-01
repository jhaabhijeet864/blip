import Navbar from "@/components/Navbar";
import LivePlayground from "@/components/LivePlayground";
import TelemetryStrip from "@/components/TelemetryStrip";
import EffectSelector from "@/components/EffectSelector";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Blip - Live Interactive Browser Simulator",
  description: "Test Blip gesture recognition and disappearance shaders live in your browser using MediaPipe and WebGL.",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#000000] text-[#ededed] overflow-x-hidden selection:bg-red-500 selection:text-white pt-20">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Live Browser <span className="text-red-500">Simulator</span>
        </h1>
        <p className="mt-3 text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
          Calibrate your empty room background, snap your fingers or tap your temple, and watch the disappearance shader render in real time. Runs 100% locally in your browser.
        </p>
      </div>
      <LivePlayground />
      <TelemetryStrip />
      <EffectSelector />
      <Footer />
    </main>
  );
}

