"use client";

import { useState } from "react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { LoadingSequence } from "@/components/landing/loading-sequence";
import { HeroSection } from "@/components/landing/hero-section";
import { ScrollStory } from "@/components/landing/scroll-story";
import { LiveDashboard } from "@/components/landing/live-dashboard";
import { BentoFeatures } from "@/components/landing/bento-features";
import { SocialProof } from "@/components/landing/social-proof";

export default function LandingPage() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <main className="bg-slate-950 text-white selection:bg-blue-500/30 w-full flex flex-col">
      
      {!loadingComplete && (
        <LoadingSequence onComplete={() => setLoadingComplete(true)} />
      )}

      <div className={!loadingComplete ? "h-screen overflow-hidden w-full max-w-[100vw]" : "w-full max-w-[100vw]"}>
        <MarketingLayout>
          <HeroSection />
          <SocialProof />
          <ScrollStory />
          <div className="relative z-20 -mt-[30vh]">
            <BentoFeatures />
          </div>
          <LiveDashboard />
        </MarketingLayout>
      </div>

    </main>
  );
}
