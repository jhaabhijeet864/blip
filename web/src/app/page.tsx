import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TelemetryStrip from "@/components/TelemetryStrip";
import TechnicalArchitecture from "@/components/TechnicalArchitecture";
import TerminalPanel from "@/components/TerminalPanel";
import DownloadBlueprint from "@/components/DownloadBlueprint";
import SystemFaq from "@/components/SystemFaq";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#000000] text-[#ededed] overflow-x-hidden selection:bg-red-500 selection:text-white">
      <Navbar />
      <Hero />
      <TelemetryStrip />
      <TechnicalArchitecture />
      <TerminalPanel />
      <DownloadBlueprint />
      <SystemFaq />
      <Footer />
    </main>
  );
}
