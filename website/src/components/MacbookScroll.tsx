import React from 'react';
import { MacbookScroll as AceternityMacbookScroll } from './ui/macbook-scroll';
import appScreen from '@/assets/formative-canvas-screen.png';

export const MacbookScroll: React.FC = () => {
  return (
    <div id="preview" className="relative w-full bg-black overflow-hidden pt-6">
      <AceternityMacbookScroll
        src={appScreen}
        showGradient={true}
        title={
          <div className="flex flex-col items-center">
            <span className="font-heading italic text-4xl sm:text-6xl lg:text-7xl tracking-[-3px] text-white leading-[0.95] max-w-4xl mx-auto block">
              Keep project context together.{'\n'}
              <span className="text-white/60">See the current workspace.</span>
            </span>
            <p className="mt-4 text-sm sm:text-base text-white/60 font-body font-light max-w-lg mx-auto">
              Review the project overview, editable canvas, tasks, source map, and supported agent conversations in one desktop workspace.
            </p>
          </div>
        }
      />
    </div>
  );
};
