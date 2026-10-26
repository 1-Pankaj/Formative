import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { ContainerScroll } from './components/ContainerScroll';
import { InteractiveTabs } from './components/InteractiveTabs';
import { BentoGrid } from './components/BentoGrid';
import { TracingBeam } from './components/TracingBeam';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="relative bg-[#07080b] text-[#e2e4e9] min-h-screen selection:bg-brand/30 selection:text-white">
      {/* Floating Kinetic Glass Navbar */}
      <Navbar />

      <main>
        {/* Aceternity Spotlight + Hero Laser Grid */}
        <Hero />

        {/* Technical Runtime Marquee */}
        <Marquee />

        {/* 3D Perspective Container Scroll Showcase */}
        <ContainerScroll />

        {/* Skiper UI Fluid Interactive Tabs */}
        <InteractiveTabs />

        {/* Aceternity Bento Grid with Pointer-Tracking Spotlight */}
        <BentoGrid />

        {/* Aceternity Scroll-Linked Tracing Beam Workflow */}
        <TracingBeam />

        {/* Aceternity Background Beams + Direct Exe Downloads */}
        <CallToAction />
      </main>

      {/* Architectural Clean Footer */}
      <Footer />
    </div>
  );
};
