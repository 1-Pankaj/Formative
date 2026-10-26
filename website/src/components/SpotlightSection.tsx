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
          Your code never leaves your computer.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-white/60 font-body font-light max-w-lg mx-auto">
          Built for engineers who cannot risk proprietary codebase exposure to third-party cloud AI vendors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 100% Air-Gapped */}
        <CardSpotlight className="h-full flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/90 mb-6">
              <Icons.SecurityShield size={24} />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
              Privacy First
            </div>
            <h3 className="text-2xl font-heading italic text-white tracking-tight mb-3">
              Zero Outbound Data
            </h3>
            <p className="text-xs sm:text-sm font-body font-light text-white/60 leading-relaxed">
              Formative sends no telemetry, error logs, or source code to remote servers. No account setup, no cloud logins. Everything executes locally on your hardware.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/50">
            <span>Network: Offline</span>
            <span className="text-white font-medium">100% Local</span>
          </div>
        </CardSpotlight>

        {/* Card 2: Supervised Agent Hooks */}
        <CardSpotlight className="h-full flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/90 mb-6">
              <Icons.AgentCli size={24} />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
              Autonomous Tools
            </div>
            <h3 className="text-2xl font-heading italic text-white tracking-tight mb-3">
              Supervised Agent Tools
            </h3>
            <p className="text-xs sm:text-sm font-body font-light text-white/60 leading-relaxed">
              Supervise Claude Code and Codex CLI commands with strict read-only execution modes and user confirmation before any file modification occurs.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/50">
            <span>Permissions: Supervised</span>
            <span className="text-white font-medium">Sandboxed</span>
          </div>
        </CardSpotlight>

        {/* Card 3: Windows Native Exe */}
        <CardSpotlight className="h-full flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/90 mb-6">
              <Icons.Windows size={24} />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
              Standalone Desktop App
            </div>
            <h3 className="text-2xl font-heading italic text-white tracking-tight mb-3">
              Single-File Executable
            </h3>
            <p className="text-xs sm:text-sm font-body font-light text-white/60 leading-relaxed">
              Available as a Windows setup installer and a standalone portable .exe. Both packages embed the 270 MB SmolLM2 model weights for immediate offline operation.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/50">
            <span>Version: v1.0.0</span>
            <span className="text-white font-medium">Windows 10 / 11</span>
          </div>
        </CardSpotlight>
      </div>
    </section>
  );
};
