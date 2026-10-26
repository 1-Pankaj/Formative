import React from 'react';
import { Hero } from './components/Hero';
import { MacbookScroll } from './components/MacbookScroll';
import FeaturesSectionDemo from './components/ui/features-section-demo-3';
import { HowItWorksSection } from './components/HowItWorksSection';
import { SpotlightSection } from './components/SpotlightSection';
import { ComparisonSection } from './components/ComparisonSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { QuickstartSection } from './components/QuickstartSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="relative bg-black text-white selection:bg-white/20 selection:text-white overflow-x-hidden min-h-screen font-body">
      {/* 1. Hero with Aceternity Background Ripple Effect & Liquid Glass */}
      <Hero />

      {/* 2. Official Aceternity 3D Macbook Scroll Demo showcasing Formative Desktop */}
      <MacbookScroll />

      {/* 3. Official Aceternity Features Section Demo 3 Bento Grid */}
      <FeaturesSectionDemo />

      {/* 4. Official Aceternity Timeline: How Formative Works in 4 Steps */}
      <HowItWorksSection />

      {/* 5. Official Aceternity Card Spotlight: Privacy & Sandboxed Execution */}
      <SpotlightSection />

      {/* 6. Comprehensive Open Source vs Cloud AI Architectural Comparison */}
      <ComparisonSection />

      {/* 7. Official Aceternity Infinite Moving Cards: Community & Reviews */}
      <TestimonialsSection />

      {/* 8. Open Source Quickstart & Installation Tabs */}
      <QuickstartSection />

      {/* 9. Frequently Asked Questions Accordion */}
      <FaqSection />

      {/* 10. Luxury Footer matching uploaded screenshot with massive TextHoverEffect watermark */}
      <Footer />
    </div>
  );
};

export default App;
