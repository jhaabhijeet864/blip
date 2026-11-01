import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MeetingDemoVideo from "@/components/MeetingDemoVideo";
import TelemetryStrip from "@/components/TelemetryStrip";
import ThreeStepGuide from "@/components/ThreeStepGuide";
import EffectSelector from "@/components/EffectSelector";
import PracticalUseCases from "@/components/PracticalUseCases";
import DownloadBlueprint from "@/components/DownloadBlueprint";
import SystemFaq from "@/components/SystemFaq";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#000000] text-zinc-900 dark:text-[#ededed] overflow-x-hidden selection:bg-red-500 selection:text-white transition-colors duration-300">
      <Navbar />
      <Hero />
      <MeetingDemoVideo />
      <TelemetryStrip />
      <ThreeStepGuide />
      <EffectSelector />
      <PracticalUseCases />
      <DownloadBlueprint />
      <SystemFaq />
      <Footer />
    </main>
  );
}
