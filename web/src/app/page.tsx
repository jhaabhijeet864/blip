import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GoogleMeetDemo from "@/components/GoogleMeetDemo";
import ThreeStepGuide from "@/components/ThreeStepGuide";
import EffectSelector from "@/components/EffectSelector";
import PracticalUseCases from "@/components/PracticalUseCases";
import DownloadSection from "@/components/DownloadSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5] overflow-x-hidden selection:bg-amber-400 selection:text-black">
      <Navbar />
      <Hero />
      <GoogleMeetDemo />
      <ThreeStepGuide />
      <EffectSelector />
      <PracticalUseCases />
      <DownloadSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
