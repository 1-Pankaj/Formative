import React from 'react';
import { motion } from 'framer-motion';
import { BackgroundRippleEffect } from './ui/background-ripple-effect';
import { BlurText } from './BlurText';
import { Icons } from './Icons';
import { FormativeLogo } from './FormativeLogo';

const motionProps = (delay: number) => ({
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
});

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black flex flex-col justify-between">
      {/* Official Aceternity Background Ripple Effect */}
      <BackgroundRippleEffect rows={14} cols={34} cellSize={54} />

      {/* Atmospheric Top Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-white/[0.06] via-white/[0.01] to-transparent blur-3xl pointer-events-none" />

      {/* Fixed Liquid Glass Navbar */}
      <header className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-16 pointer-events-none">
        {/* Left: liquid-glass circle with Formative Logo */}
        <a
          href="#"
          className="liquid-glass h-12 w-12 rounded-full flex items-center justify-center pointer-events-auto hover:scale-105 active:scale-95 transition-transform p-1 overflow-hidden"
          title="Formative Home"
        >
          <FormativeLogo className="h-full w-full object-contain" withBackground={true} />
        </a>

        {/* Center: liquid-glass pill with navigation links */}
        <nav className="hidden md:flex items-center gap-1 liquid-glass rounded-full px-2 py-1.5 pointer-events-auto shadow-2xl">
          <a href="#preview" className="px-3.5 py-1.5 text-xs font-medium text-white/80 font-body hover:text-white transition-colors">
            Workspace
          </a>
          <a href="#features" className="px-3.5 py-1.5 text-xs font-medium text-white/80 font-body hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="px-3.5 py-1.5 text-xs font-medium text-white/80 font-body hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#privacy" className="px-3.5 py-1.5 text-xs font-medium text-white/80 font-body hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#capabilities" className="px-3.5 py-1.5 text-xs font-medium text-white/80 font-body hover:text-white transition-colors">
            Current scope
          </a>
          <a
            href="#download"
            className="bg-white text-black rounded-full px-4 py-1.5 text-xs font-medium font-body flex items-center gap-1.5 hover:bg-white/90 transition-colors ml-1 shadow-sm"
          >
            <span>Source & releases</span>
            <Icons.ArrowUpRight size={13} />
          </a>
        </nav>

        {/* Right: liquid-glass circle with GitHub icon */}
        <a
          href="https://github.com/1-Pankaj/Formative"
          target="_blank"
          rel="noreferrer"
          className="liquid-glass h-12 w-12 rounded-full flex items-center justify-center pointer-events-auto text-white hover:text-white/80 hover:scale-105 active:scale-95 transition-all"
          title="GitHub Repository"
        >
          <Icons.GitHub size={18} />
        </a>
      </header>

      {/* Main Centered Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-32 pb-12 px-4 text-center max-w-5xl mx-auto">
        {/* Simple, Human Announcement Pill */}
        <motion.div {...motionProps(0.2)} className="liquid-glass rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-6">
          <span className="text-xs text-white/90 font-body">
            Open-source · Windows-first desktop workspace
          </span>
        </motion.div>

        {/* Headline with Staggered Word-by-Word BlurText */}
        <div className="max-w-4xl">
          <BlurText
            text="Keep the project, map, and agent run together."
            className="text-5xl sm:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.88] tracking-[-4px]"
          />
        </div>

        {/* Clear, Accessible Subtext for Everyone */}
        <motion.p {...motionProps(0.5)} className="mt-6 text-sm sm:text-base text-white/70 max-w-2xl font-body font-light leading-relaxed">
          Formative scans selected project files locally, keeps an editable canvas and task list with the project, and starts read-only Codex CLI or Claude Code CLI runs. Provider runs may send your prompt and selected context to that provider. Local office chat is optional and needs a GGUF model you choose.
        </motion.p>

        {/* CTA buttons */}
        <motion.div {...motionProps(0.7)} className="mt-8 flex items-center gap-6 flex-wrap justify-center">
          <a
            href="https://github.com/1-Pankaj/Formative/releases"
            target="_blank"
            rel="noreferrer"
            className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-body font-medium text-white flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
          >
            <span>Check GitHub Releases</span>
            <Icons.Download size={15} />
          </a>

          <a
            href="#preview"
            className="text-sm font-body font-normal text-white/80 hover:text-white flex items-center gap-2 transition-colors py-2.5 px-3 rounded-full hover:bg-white/[0.04]"
          >
            <div className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center">
              <Icons.Play size={11} className="ml-0.5" />
            </div>
            <span>See what works</span>
          </a>
        </motion.div>

        {/* Current product boundaries, not performance claims */}
        <motion.div {...motionProps(0.9)} className="mt-12 flex flex-wrap gap-4 justify-center">
          <div className="liquid-glass p-5 w-[190px] sm:w-[210px] rounded-[1.25rem] text-left">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/80">
              <Icons.ClockIcon size={16} />
            </div>
            <div className="text-3xl sm:text-4xl font-heading italic tracking-[-1px] leading-none mt-4 text-white">
              Windows
            </div>
            <div className="text-xs font-body text-white/50 mt-1.5 leading-snug">
              First desktop target
            </div>
          </div>

          <div className="liquid-glass p-5 w-[190px] sm:w-[210px] rounded-[1.25rem] text-left">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/80">
              <Icons.GlobeIcon size={16} />
            </div>
            <div className="text-3xl sm:text-4xl font-heading italic tracking-[-1px] leading-none mt-4 text-white">
              2 CLIs
            </div>
            <div className="text-xs font-body text-white/50 mt-1.5 leading-snug">
              Codex CLI and Claude Code CLI
            </div>
          </div>

          <div className="liquid-glass p-5 w-[190px] sm:w-[210px] rounded-[1.25rem] text-left">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/80">
              <Icons.ArchitectureMap size={16} />
            </div>
            <div className="text-3xl sm:text-4xl font-heading italic tracking-[-1px] leading-none mt-4 text-white">
              Optional
            </div>
            <div className="text-xs font-body text-white/50 mt-1.5 leading-snug">
              Local GGUF office chat
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Tech Ecosystem */}
      <motion.div {...motionProps(1.0)} className="relative z-10 flex flex-col items-center gap-4 pb-10 px-4">
        <div className="text-xs text-white/50 font-body">
          Built on proven open-source technologies
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-white/40">
          <span className="font-heading italic text-xl md:text-2xl tracking-tight hover:text-white/80 transition-colors">TypeScript</span>
          <span className="font-heading italic text-xl md:text-2xl tracking-tight hover:text-white/80 transition-colors">Claude Code</span>
          <span className="font-heading italic text-xl md:text-2xl tracking-tight hover:text-white/80 transition-colors">Codex CLI</span>
          <span className="font-heading italic text-xl md:text-2xl tracking-tight hover:text-white/80 transition-colors">SmolLM2</span>
          <span className="font-heading italic text-xl md:text-2xl tracking-tight hover:text-white/80 transition-colors">Three.js</span>
          <span className="font-heading italic text-xl md:text-2xl tracking-tight hover:text-white/80 transition-colors">Electron</span>
        </div>
      </motion.div>
    </section>
  );
};
