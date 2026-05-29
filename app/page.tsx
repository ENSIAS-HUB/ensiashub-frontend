"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import HeroSection from "./landing/sections/HeroSection";
import CarteSection from "./landing/sections/CarteSection";
import FeedSection from "./landing/sections/FeedSection";
import DriveSection from "./landing/sections/DriveSection";
import EatsSection from "./landing/sections/EatsSection";
import CTASection from "./landing/sections/CTASection";
import LandingNavbar from "./landing/components/LandingNavbar";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  return (
    <main
      ref={containerRef}
      className="relative bg-[#080b14] text-white overflow-x-hidden"
    >
      <LandingNavbar scrollYProgress={scrollYProgress} />
      <HeroSection />
      <CarteSection />
      <FeedSection />
      <DriveSection />
      <EatsSection />
      <CTASection />
    </main>
  );
}
