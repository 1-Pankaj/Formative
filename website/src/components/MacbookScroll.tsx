import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Icons } from './Icons';

interface MacbookScrollProps {
  src?: string;
  showGradient?: boolean;
  title?: React.ReactNode;
  badge?: React.ReactNode;
}

export const MacbookScroll: React.FC<MacbookScrollProps> = ({
  title,
  badge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const rotate = useTransform(scrollYProgress, [0, 0.6], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.82, 1]);
  const translate = useTransform(scrollYProgress, [0, 0.6], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0.8, 1, 1, 0.9]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[180vh] flex flex-col items-center py-20 px-4 bg-black overflow-hidden [perspective:1400px]"
    >
      {/* Sticky Header and Title */}
      <div className="sticky top-20 z-20 flex flex-col items-center text-center max-w-4xl mx-auto mb-8 px-4">
        {badge || (
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-body font-light text-white/80 mb-4 inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
            <span>NATIVE WORKBENCH PERSPECTIVE</span>
          </div>
        )}
        {title || (
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-heading italic text-white tracking-[-3px] leading-[0.9]">
            Every system, agent, and diagram.{'\n'}Live on your screen.
          </h2>
        )}
      </div>

      {/* 3D Macbook Model Sticky Container */}
      <div className="sticky top-32 z-10 w-full max-w-5xl flex flex-col items-center">
        {/* Animated Screen Lid */}
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            translateY: translate,
            opacity,
            transformOrigin: 'bottom center',
          }}
          className="relative w-full max-w-4xl rounded-[1.6rem] p-3 sm:p-4 bg-[#14151a] border border-white/[0.15] shadow-[0_20px_80px_rgba(0,0,0,0.9)]"
        >
          {/* Top Notch & Camera */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30">
            <div className="w-1.5 h-1.5 rounded-full bg-[#20222a] border border-white/20" />
            <div className="w-0.5 h-0.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Glossy Bezel Frame */}
          <div className="relative rounded-xl overflow-hidden bg-[#090a0f] border border-white/[0.08] shadow-2xl aspect-[16/10] flex flex-col">
            {/* Desktop Window Titlebar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0f1118] border-b border-white/[0.06] select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                <span className="ml-2.5 text-[11px] font-mono text-white/50">Formative Studio</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-white/80">
                <span className="text-brand">project</span>
                <span className="text-white/30">/</span>
                <span>Hyperion-Architecture-v1</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SmolLM2: Online</span>
              </div>
            </div>

            {/* Screen Workspace Interior */}
            <div className="relative flex-1 bg-grid-pattern bg-[#07080b] p-4 sm:p-6 grid grid-cols-12 gap-4 overflow-hidden">
              {/* Left Toolbar */}
              <div className="col-span-1 bg-[#0d0e14] border border-white/[0.06] rounded-lg p-1.5 flex flex-col items-center gap-3">
                <div className="w-7 h-7 rounded bg-brand/20 text-brand flex items-center justify-center">
                  <Icons.ArchitectureMap size={16} />
                </div>
                <div className="w-7 h-7 rounded hover:bg-white/5 text-white/40 flex items-center justify-center">
                  <Icons.LocalLlm size={16} />
                </div>
                <div className="w-7 h-7 rounded hover:bg-white/5 text-white/40 flex items-center justify-center">
                  <Icons.AgentCli size={16} />
                </div>
                <div className="w-7 h-7 rounded hover:bg-white/5 text-white/40 flex items-center justify-center">
                  <Icons.Office3D size={16} />
                </div>
              </div>

              {/* Main Center Canvas Preview */}
              <div className="col-span-8 relative flex items-center justify-center">
                {/* Node 1: Route */}
                <div className="absolute top-4 left-6 p-2.5 rounded-xl bg-[#12141d] border border-cyan-500/40 w-36 shadow-lg">
                  <div className="text-[9px] font-mono text-cyan-400">ENDPOINT</div>
                  <div className="text-xs font-bold text-white">/api/v1/auth</div>
                  <div className="text-[8px] font-mono text-white/40">Next.js 15 App Route</div>
                </div>

                {/* Node 2: Central AST Hub */}
                <div className="relative z-10 p-4 rounded-2xl bg-[#141724] border border-brand/60 w-48 text-center shadow-2xl shadow-brand/20">
                  <div className="text-[9px] font-mono text-brand font-semibold uppercase">Syntax-Tree Engine</div>
                  <div className="text-sm font-bold text-white mt-0.5">Architecture AST</div>
                  <div className="text-[10px] text-white/60 mt-1">48 Modules • 114 Imports</div>
                </div>

                {/* Node 3: Local SmolLM2 Agent */}
                <div className="absolute bottom-4 right-6 p-2.5 rounded-xl bg-[#12141d] border border-amber-500/40 w-40 shadow-lg">
                  <div className="text-[9px] font-mono text-amber-400">LOCAL MODEL</div>
                  <div className="text-xs font-bold text-white">SmolLM2-360M</div>
                  <div className="text-[8px] font-mono text-white/40">270 MB • 0 Cloud Calls</div>
                </div>

                {/* Connecting SVG laser lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="25%" y1="20%" x2="50%" y2="50%" stroke="rgba(6,182,212,0.5)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="rgba(224,68,24,0.5)" strokeWidth="1.5" strokeDasharray="4 4" />
                </svg>
              </div>

              {/* Right Telemetry Pane */}
              <div className="col-span-3 bg-[#0c0d13] border border-white/[0.06] rounded-lg p-3 flex flex-col justify-between text-[10px] font-mono">
                <div>
                  <div className="text-white/40 font-semibold mb-2">SYSTEM TELEMETRY</div>
                  <div className="p-2 rounded bg-black/40 border border-white/[0.04] mb-2">
                    <div className="text-white/40">OFFLINE LLM</div>
                    <div className="text-white font-bold">SmolLM2 (Q8_0)</div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/[0.04]">
                    <div className="text-white/40">AGENT CLI</div>
                    <div className="text-cyan-400 font-bold">Claude Code (Plan)</div>
                  </div>
                </div>

                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Zero cloud telemetry transmitted. Air-gapped.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Macbook Aluminum Base & Trackpad */}
        <div className="relative w-full max-w-4xl h-5 sm:h-6 bg-gradient-to-b from-[#222329] via-[#1a1b20] to-[#121316] rounded-b-2xl border-x border-b border-white/[0.12] shadow-2xl flex items-center justify-center">
          {/* Center thumb indent */}
          <div className="w-16 h-1 bg-[#101114] rounded-b-md border-b border-white/20" />
        </div>
      </div>
    </div>
  );
};
