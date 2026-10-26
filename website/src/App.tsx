import React from 'react';
import { Hero } from './components/Hero';
import { Capabilities } from './components/Capabilities';

export const App: React.FC = () => {
  return (
    <div className="relative bg-black text-white selection:bg-white/20 selection:text-white overflow-x-hidden min-h-screen">
      {/* Section 1: Hero */}
      <Hero />

      {/* Section 2: Capabilities */}
      <Capabilities />
    </div>
  );
};
