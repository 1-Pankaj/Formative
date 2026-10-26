import React, { useRef, useEffect, useState } from 'react';
import { Icons } from './Icons';

export const ContainerScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState(15);
  const [scale, setScale] = useState(0.92);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress of container entering viewport
      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height * 0.5), 0), 1);
      
      // Smoothly tilt from 18deg to 0deg as it reaches center
      setRotate(Math.max(18 * (1 - progress * 1.5), 0));
      setScale(Math.min(0.92 + progress * 0.08, 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center justify-center [perspective:1200px]"
    >
      {/* Section Sub-heading */}
      <div className="text-center mb-10 max-w-2xl">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
          NATIVE DESKTOP ARCHITECTURE
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 tracking-tight">
          One unified canvas for systems, agents, and local models.
        </h2>
      </div>

      {/* 3D Perspective Tilt Container */}
      <div 
        style={{
          transform: `rotateX(${rotate}deg) scale(${scale})`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative w-full rounded-2xl p-1.5 sm:p-2 bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent shadow-2xl shadow-brand/10 border border-white/[0.08]"
      >
        {/* Glow halo behind window */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand/20 via-cyan-500/10 to-amber-500/20 rounded-2xl blur-xl opacity-50 pointer-events-none" />

        {/* The Desktop Application Window */}
        <div className="relative rounded-xl overflow-hidden bg-[#0c0d13] border border-white/[0.06] shadow-2xl">
          {/* Window Titlebar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#11121a] border-b border-white/[0.06] select-none">
            {/* Window Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]/80 border border-[#e0443e]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]/80 border border-[#dea123]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]/80 border border-[#1aab29]" />
              <span className="ml-3 text-xs font-mono text-ink-muted">Formative Studio</span>
            </div>

            {/* Breadcrumb & Project Tag */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] text-xs font-mono text-ink-secondary">
              <span className="text-brand font-medium">project</span>
              <span className="text-ink-muted">/</span>
              <span>Hyperion-Autonomous-Core</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                online
              </span>
            </div>

            {/* Right Window Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="hidden sm:inline">Local LLM: Ready</span>
            </div>
          </div>

          {/* Application Body Mockup */}
          <div className="grid grid-cols-12 min-h-[480px] sm:min-h-[580px] bg-[#090a0f]">
            {/* Left Nav Strip */}
            <div className="col-span-1 sm:col-span-1 bg-[#0e1017] border-r border-white/[0.06] p-2 flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                <Icons.ArchitectureMap size={18} />
              </div>
              <div className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-ink-muted">
                <Icons.LocalLlm size={18} />
              </div>
              <div className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-ink-muted">
                <Icons.AgentCli size={18} />
              </div>
              <div className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-ink-muted">
                <Icons.Office3D size={18} />
              </div>
            </div>

            {/* Center Canvas with Node Visualizer */}
            <div className="col-span-11 sm:col-span-8 p-6 relative bg-grid-pattern bg-[#08090d] flex items-center justify-center overflow-hidden">
              {/* Telemetry Packet Laser Beam (Simulated Flow) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <line x1="28%" y1="35%" x2="55%" y2="50%" stroke="rgba(224, 68, 24, 0.4)" strokeWidth="2" strokeDasharray="6 4" />
                <line x1="55%" y1="50%" x2="78%" y2="35%" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="6 4" />
                <line x1="55%" y1="50%" x2="55%" y2="78%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeDasharray="6 4" />
              </svg>

              {/* Node 1: Claude Code / Codex Agent */}
              <div className="absolute top-[22%] left-[18%] p-3.5 rounded-xl bg-[#13151f] border border-brand/40 shadow-xl shadow-brand/10 w-44 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-brand animate-ping" />
                  <span className="text-[10px] font-mono uppercase text-brand font-semibold">Active Agent Run</span>
                </div>
                <div className="text-xs font-semibold text-white">Claude Code CLI</div>
                <div className="text-[11px] text-ink-muted font-mono mt-1">Mode: Plan (Read-Only)</div>
              </div>

              {/* Node 2: Core Architecture Central Hub */}
              <div className="relative z-10 p-5 rounded-2xl bg-[#141724] border border-cyan-500/50 shadow-2xl shadow-cyan-500/10 w-56 text-center">
                <div className="inline-flex p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mb-2 border border-cyan-500/20">
                  <Icons.ArchitectureMap size={24} />
                </div>
                <div className="text-sm font-bold text-white">Architecture AST Map</div>
                <div className="text-xs text-ink-muted mt-1">48 Modules • 114 Imports</div>
                <div className="mt-3 px-2 py-1 rounded bg-black/40 text-[10px] font-mono text-cyan-300 border border-white/5">
                  AST Parser: Active
                </div>
              </div>

              {/* Node 3: Local Offline SmolLM2 */}
              <div className="absolute top-[22%] right-[12%] p-3.5 rounded-xl bg-[#13151f] border border-amber-500/40 shadow-xl shadow-amber-500/10 w-44 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">Local LLM (GGUF)</span>
                </div>
                <div className="text-xs font-semibold text-white">SmolLM2-360M</div>
                <div className="text-[11px] text-ink-muted font-mono mt-1">270 MB • 0 Cloud Calls</div>
              </div>

              {/* Node 4: 3D Office Coordinator */}
              <div className="absolute bottom-[14%] p-3.5 rounded-xl bg-[#13151f] border border-emerald-500/40 shadow-xl shadow-emerald-500/10 w-48 text-center backdrop-blur-md">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">3D Coordinator</span>
                </div>
                <div className="text-xs font-semibold text-white">Office Coordinator "Rex"</div>
                <div className="text-[11px] text-ink-muted font-mono">Three.js Procedural Stage</div>
              </div>
            </div>

            {/* Right Telemetry Inspector */}
            <div className="hidden sm:block sm:col-span-3 bg-[#0d0f16] border-l border-white/[0.06] p-4 flex flex-col gap-4">
              <div className="text-xs font-mono uppercase text-ink-muted font-semibold tracking-wider">
                System Telemetry
              </div>

              {/* Metric Card 1 */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] font-mono text-ink-muted">LOCAL RUNTIME</div>
                <div className="text-sm font-semibold text-white mt-0.5">node-llama-cpp v3</div>
                <div className="text-xs text-emerald-400 font-mono mt-1">CPU / Vulkan Acceleration</div>
              </div>

              {/* Metric Card 2 */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] font-mono text-ink-muted">CLOUD DATA LEAKAGE</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">0.00 bytes</div>
                <div className="text-[11px] text-ink-muted mt-1">100% on-device execution</div>
              </div>

              {/* Metric Card 3 */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[10px] font-mono text-ink-muted">SUPPORTED AGENT CLIS</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand/10 text-brand border border-brand/20">
                    Claude Code
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Codex CLI
                  </span>
                </div>
              </div>

              {/* Activity Log Feed */}
              <div className="mt-auto p-2.5 rounded bg-black/40 border border-white/[0.04] text-[10px] font-mono text-ink-muted space-y-1">
                <div className="text-cyan-400">&gt; AST parse: 48 files [OK]</div>
                <div className="text-amber-400">&gt; LLM weights loaded [270MB]</div>
                <div className="text-emerald-400">&gt; Telemetry socket: active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
