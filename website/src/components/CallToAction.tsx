import React, { useState } from 'react';
import { Icons } from './Icons';

export const CallToAction: React.FC = () => {
  const [copiedLink, setCopiedLink] = useState(false);

  const copyReleaseLink = () => {
    navigator.clipboard.writeText('https://github.com/1-Pankaj/Formative/releases/latest');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="download" className="relative py-28 px-4 overflow-hidden bg-[#07080b]">
      {/* Aceternity Perspective Laser Background Beams */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-brand/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/25 text-xs font-mono text-brand mb-6">
          <Icons.Sparkles size={14} />
          <span>OFFICIAL V1.0.0 PUBLIC BETA RELEASE</span>
        </div>

        {/* Master Heading */}
        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Ready to run autonomous engineering locally?
        </h2>
        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed mb-12">
          Download the pre-compiled Windows executable with the offline SmolLM2 language model bundled inside. No credit card, no sign-up, no cloud subscriptions.
        </p>

        {/* Binary Download Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10 text-left">
          {/* Option 1: Setup Installer */}
          <div className="p-6 rounded-2xl bg-[#0f111a] border border-brand/40 shadow-xl shadow-brand/10 hover:border-brand transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-lg bg-brand/10 text-brand">
                  <Icons.Windows size={20} />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand/15 text-brand font-semibold">
                  RECOMMENDED
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-brand transition-colors">
                Setup Installer
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Interactive Windows setup wizard with desktop shortcuts, Start Menu integration, and clean uninstaller.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-mono text-ink-muted">~350 MB (Bundles LLM)</span>
              <a
                href="https://github.com/1-Pankaj/Formative/releases/latest"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:scale-95 transition-all shadow-md shadow-brand/20"
              >
                <Icons.Download size={14} />
                <span>Get Setup.exe</span>
              </a>
            </div>
          </div>

          {/* Option 2: Portable Executable */}
          <div className="p-6 rounded-2xl bg-[#0f111a] border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-lg bg-white/[0.05] text-ink-secondary">
                  <Icons.Windows size={20} />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-ink-muted">
                  STANDALONE
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                Portable Executable
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Single self-contained .exe that runs directly from any folder or USB drive with zero admin requirements.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-mono text-ink-muted">~350 MB (Bundles LLM)</span>
              <a
                href="https://github.com/1-Pankaj/Formative/releases/latest"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-ink-secondary bg-white/[0.05] hover:bg-white/[0.1] hover:text-white active:scale-95 transition-all border border-white/[0.08]"
              >
                <Icons.Download size={14} />
                <span>Get Portable.exe</span>
              </a>
            </div>
          </div>
        </div>

        {/* Release Direct Link Copy Bar */}
        <div className="flex items-center justify-center gap-3 text-xs font-mono text-ink-muted">
          <span>Release Link:</span>
          <button
            onClick={copyReleaseLink}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-ink-secondary transition-colors"
          >
            {copiedLink ? <Icons.Check size={12} className="text-emerald-400" /> : <Icons.Copy size={12} />}
            <span>github.com/1-Pankaj/Formative/releases</span>
          </button>
        </div>
      </div>
    </section>
  );
};
