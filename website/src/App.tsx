import React from 'react';
import { Hero } from './components/Hero';
import { MacbookScroll } from './components/MacbookScroll';
import { FeaturesSection } from './components/FeaturesSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="relative bg-black text-white selection:bg-white/20 selection:text-white overflow-x-hidden min-h-screen font-body">
      {/* 1. Hero with Background Ripple Effect, BlurText, and Liquid Glass Navbar */}
      <Hero />

      {/* 2. Aceternity 3D Macbook Scroll Demo showcasing Formative's Desktop Workspace */}
      <MacbookScroll />

      {/* 3. Aceternity Features Section Demo 3 with 8 Spotlight Bento Cards */}
      <FeaturesSection />

      {/* 4. Luxury Footer matching uploaded screenshot with massive TextHoverEffect watermark */}
      <Footer />
    </div>
  );
};
