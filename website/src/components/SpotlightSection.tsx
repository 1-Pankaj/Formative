import React from 'react';
import { CardSpotlight } from './ui/card-spotlight';
import { Icons } from './Icons';

export const SpotlightSection: React.FC = () => {
  return (
    <section id="privacy" className="relative z-20 mx-auto max-w-7xl py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/70 font-body inline-block mb-4">
          Security & Privacy
        </div>
        <h2 className="text-4xl sm:text-6xl font-heading italic text-white tracking-[-3px] leading-[0.95]">
          Know what stays local and what goes to a provider.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-white/60 font-body font-light max-w-lg mx-auto">
          Project scans happen on your device. Starting a provider run is a separate action with a separate data boundary.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: local scans */}
        <CardSpotlight className="h-full flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/90 mb-6">
              <Icons.SecurityShield size={24} />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
              Local analysis
            </div>
            <h3 className="text-2xl font-heading italic text-white tracking-tight mb-3">
              Project scans stay on-device
            </h3>
            <p className="text-xs sm:text-sm font-body font-light text-white/60 leading-relaxed">
              The folder scan and architecture map read selected project files locally. They do not upload source files to Formative and do not execute project code.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/50">
            <span>Project scan: local</span>
            <span className="text-white font-medium">No code execution</span>
          </div>
        </CardSpotlight>

        {/* Card 2: provider-run boundary */}
        <CardSpotlight className="h-full flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/90 mb-6">
              <Icons.AgentCli size={24} />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
              Provider connection
            </div>
            <h3 className="text-2xl font-heading italic text-white tracking-tight mb-3">
              Read-only CLI runs
            </h3>
            <p className="text-xs sm:text-sm font-body font-light text-white/60 leading-relaxed">
              Formative can start supported Codex CLI and Claude Code CLI runs in read-only mode. Your prompt and selected project context may be sent to the provider service and may incur provider charges.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/50">
            <span>Codex CLI · Claude Code CLI</span>
            <span className="text-white font-medium">Provider terms apply</span>
          </div>
        </CardSpotlight>

        {/* Card 3: optional local model */}
        <CardSpotlight className="h-full flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/90 mb-6">
              <Icons.Windows size={24} />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
              Optional local feature
            </div>
            <h3 className="text-2xl font-heading italic text-white tracking-tight mb-3">
              Bring a GGUF model
            </h3>
            <p className="text-xs sm:text-sm font-body font-light text-white/60 leading-relaxed">
              Model weights are not in the repository or default Windows packages. Choose a compatible file in Project Office; Formative copies it to local app data and runs it on this device.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/50">
            <span>Not bundled by default</span>
            <span className="text-white font-medium">Responses may be inaccurate</span>
          </div>
        </CardSpotlight>
      </div>
    </section>
  );
};
