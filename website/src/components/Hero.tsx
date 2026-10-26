import React from 'react';
import { motion } from 'framer-motion';
import { FadingVideo } from './FadingVideo';
import { BlurText } from './BlurText';
import { Icons } from './Icons';

const motionProps = (delay: number) => ({
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
});

export const Hero: React.FC = () => {
  return (
    <section className="relative h-screen overflow-hidden bg-black flex flex-col justify-between">
      {/* Background Cinematic Video with smooth fade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4"
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0 pointer-events-none"
        style={{ width: '120%', height: '120%' }}
      />

      {/* Atmospheric dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0 pointer-events-none" />

      {/* Fixed Liquid Glass Navbar */}
      <header className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 pointer-events-none">
        {/* Left: liquid-glass circle with italic F */}
        <a
          href="#"
          className="liquid-glass h-12 w-12 rounded-full flex items-center justify-center pointer-events-auto hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="font-heading italic text-2xl text-white">F</span>
        </a>

        {/* Center: liquid-glass pill with navigation links */}
        <nav className="hidden md:flex items-center gap-1 liquid-glass rounded-full px-1.5 py-1.5 pointer-events-auto">
          <a href="#capabilities" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">
            Capabilities
          </a>
          <a href="#architecture" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#llm" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">
            Offline LLM
          </a>
          <a href="#agents" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">
            Agent CLI
          </a>
          <a
            href="https://github.com/1-Pankaj/Formative/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium font-body flex items-center gap-1.5 hover:bg-white/90 transition-colors ml-1"
          >
            <span>Download v1.0.0</span>
            <Icons.ArrowUpRight size={15} />
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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-24 px-4 text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div {...motionProps(0.4)} className="liquid-glass rounded-full px-3 py-1 flex items-center gap-2">
          <span className="bg-white text-black text-[10px] font-semibold font-body px-2 py-0.5 rounded-full uppercase tracking-wider">
            New
          </span>
          <span className="text-xs text-white/90 font-body font-light">
            Formative v1.0.0 Public Beta — Desktop-First Open Source
          </span>
        </motion.div>

        {/* Headline with BlurText */}
        <div className="mt-6 max-w-4xl">
          <BlurText
            text="Autonomous Engineering Workspace Built For Your Machine"
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] tracking-[-4px]"
          />
        </div>

        {/* Subtext */}
        <motion.p {...motionProps(0.8)} className="mt-4 text-sm md:text-base text-white/90 max-w-2xl font-body font-light leading-snug">
          A desktop environment unifying syntax-tree architecture diagrams, offline SmolLM2 neural intelligence, and supervised Claude Code and Codex CLI execution. Precise typography, cinematic motion, and code you can be proud of.
        </motion.p>

        {/* CTA buttons */}
        <motion.div {...motionProps(1.1)} className="mt-6 flex items-center gap-6 flex-wrap justify-center">
          <a
            href="https://github.com/1-Pankaj/Formative/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-body font-medium text-white flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Download for Windows</span>
            <Icons.ArrowUpRight size={16} />
          </a>

          <a
            href="#capabilities"
            className="flex items-center gap-2 text-sm font-body font-light text-white/90 hover:text-white transition-colors"
          >
            <Icons.Play size={14} />
            <span>Explore Capabilities</span>
          </a>
        </motion.div>

        {/* Stats cards */}
        <motion.div {...motionProps(1.3)} className="mt-8 flex gap-4 flex-wrap justify-center">
          <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left">
            <Icons.ClockIcon size={22} className="text-white/90" />
            <div className="text-4xl font-heading italic tracking-[-1px] leading-none mt-4 text-white">
              270 MB
            </div>
            <div className="text-xs text-white/80 font-body font-light mt-1">
              Bundled SmolLM2-360M Offline Weights
            </div>
          </div>

          <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left">
            <Icons.GlobeIcon size={22} className="text-white/90" />
            <div className="text-4xl font-heading italic tracking-[-1px] leading-none mt-4 text-white">
              0 Bytes
            </div>
            <div className="text-xs text-white/80 font-body font-light mt-1">
              Cloud Telemetry or Code Transmitted
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Trust & Platform Bar */}
      <motion.div {...motionProps(1.4)} className="relative z-10 flex flex-col items-center gap-4 pb-8 px-4">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/80 font-body font-light">
          Trusted by founders, operators, and systems architects worldwide
        </div>

        <div className="flex items-center gap-8 sm:gap-12 md:gap-16 flex-wrap justify-center">
          {['Claude Code', 'OpenAI Codex', 'TypeScript AST', 'node-llama-cpp', 'Three.js'].map((brand) => (
            <span key={brand} className="font-heading italic text-2xl md:text-3xl tracking-tight text-white/80">
              {brand}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
