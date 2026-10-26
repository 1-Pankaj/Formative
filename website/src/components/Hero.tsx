import React, { useState } from 'react';
import { Icons } from './Icons';

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const copyCloneCmd = () => {
    navigator.clipboard.writeText('git clone https://github.com/1-Pankaj/Formative.git');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 overflow-hidden bg-[#07080b]"
    >
      {/* Precision Background Grid with Radial Mask */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 mask-radial pointer-events-none" />

      {/* Aceternity Interactive Mouse-Tracking Spotlight */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `
            radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, rgba(224, 68, 24, 0.14), transparent 70%),
            radial-gradient(circle 500px at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(6, 182, 212, 0.08), transparent 70%)
          `,
        }}
      />

      {/* Ambient Top Glow Cone */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-brand/20 via-brand/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Engineering Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#12131b] border border-white/[0.08] text-xs font-mono text-ink-secondary mb-8 shadow-inner shadow-white/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-ink-muted">OPEN SOURCE DESKTOP WORKSPACE</span>
          <span className="text-white/20">|</span>
          <span className="text-brand font-semibold">ZERO CLOUD TELEMETRY</span>
        </div>

        {/* Master Headline with Precision Grotesque Typography */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
          The autonomous engineering workbench for{' '}
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand via-[#ff7a50] to-[#f59e0b]">
            diagrams, agents & code.
          </span>
        </h1>

        {/* Technical Sub-headline */}
        <p className="text-base sm:text-lg md:text-xl text-ink-muted max-w-2xl font-normal leading-relaxed mb-10">
          Orchestrate real <strong className="text-white font-medium">Claude Code</strong> and <strong className="text-white font-medium">Codex CLI</strong> runs, explore syntax-tree architecture maps, and converse with an <strong className="text-white font-medium">offline 270MB local LLM</strong> inside an interactive 3D studio.
        </p>

        {/* Call-to-Action Group */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
          {/* Shimmer Border Primary Button */}
          <a
            href="#download"
            className="relative group p-[1px] overflow-hidden rounded-xl w-full sm:w-auto transition-transform active:scale-[0.98]"
          >
            {/* Rotating Shimmer Gradient */}
            <span className="absolute inset-[-1000%] animate-shimmer bg-[conic-gradient(from_90deg_at_50%_50%,#e04418_0%,#ffffff_50%,#e04418_100%)] opacity-80" />
            
            <span className="relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[11px] bg-[#0d0e14] text-white font-medium text-sm group-hover:bg-[#12141c] transition-colors">
              <Icons.Windows size={18} className="text-brand" />
              <span>Download for Windows</span>
              <span className="text-xs text-ink-muted font-mono">(1.0.0-beta)</span>
            </span>
          </a>

          {/* Secondary Outline Button */}
          <a
            href="#architecture"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-white font-medium text-sm w-full sm:w-auto transition-all"
          >
            <Icons.ArchitectureMap size={18} className="text-cyan-400" />
            <span>Interactive Demos</span>
            <Icons.ArrowRight size={14} className="text-ink-muted" />
          </a>
        </div>

        {/* Quick Terminal Clone Widget */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0e1017] border border-white/[0.08] text-xs font-mono text-ink-muted max-w-lg w-full justify-between shadow-lg">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-brand select-none">$</span>
            <span className="text-ink-secondary">git clone https://github.com/1-Pankaj/Formative.git</span>
          </div>
          <button
            onClick={copyCloneCmd}
            className="p-1.5 rounded hover:bg-white/10 text-ink-muted hover:text-white transition-colors flex-shrink-0"
            title="Copy command"
          >
            {copied ? <Icons.Check size={14} className="text-emerald-400" /> : <Icons.Copy size={14} />}
          </button>
        </div>
      </div>
    </section>
  );
};
