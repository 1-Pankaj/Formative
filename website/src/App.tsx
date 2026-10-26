import React from 'react';
import { Hero } from './components/Hero';
import { MacbookScroll } from './components/MacbookScroll';
import FeaturesSectionDemo from './components/ui/features-section-demo-3';
import { HowItWorksSection } from './components/HowItWorksSection';
import { SpotlightSection } from './components/SpotlightSection';
import { ComparisonSection } from './components/ComparisonSection';
import { QuickstartSection } from './components/QuickstartSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="relative bg-black text-white selection:bg-white/20 selection:text-white overflow-x-hidden min-h-screen font-body">
      <Hero />

      <MacbookScroll />

      <FeaturesSectionDemo />

      <HowItWorksSection />

      <SpotlightSection />

      <ComparisonSection />

      <QuickstartSection />

      <FaqSection />

      <Footer />
    </div>
  );
};

export default App;
