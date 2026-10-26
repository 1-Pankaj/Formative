import React from 'react';
import { Icons } from './Icons';

const MARQUEE_ITEMS = [
  { text: 'SmolLM2-360M-Instruct (270 MB GGUF Bundled)', icon: 'LocalLlm' as const, color: 'text-amber-400' },
  { text: 'node-llama-cpp Native Bindings (CPU/Vulkan)', icon: 'CpuChip' as const, color: 'text-brand' },
  { text: 'TypeScript AST Parser (Vue / Svelte / Astro)', icon: 'ArchitectureMap' as const, color: 'text-cyan-400' },
  { text: 'Claude Code CLI Streamer (Plan Mode)', icon: 'AgentCli' as const, color: 'text-brand' },
  { text: 'OpenAI Codex CLI Integration', icon: 'AgentCli' as const, color: 'text-emerald-400' },
  { text: 'Three.js Procedural 3D Office Floor', icon: 'Office3D' as const, color: 'text-purple-400' },
  { text: 'Zero Cloud Telemetry • 100% Local', icon: 'SecurityShield' as const, color: 'text-emerald-400' },
  { text: 'React 19 & Tailwind Engine', icon: 'Sparkles' as const, color: 'text-cyan-400' },
  { text: 'NSIS Installer & Standalone Portable .exe', icon: 'Windows' as const, color: 'text-white' },
  { text: 'Apache 2.0 & MIT Permissive Open Source', icon: 'Check' as const, color: 'text-emerald-400' },
];

export const Marquee: React.FC = () => {
  return (
    <div className="relative py-8 border-y border-white/[0.06] bg-[#08090e] overflow-hidden select-none">
      {/* Left/Right Edge Gradient Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07080b] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07080b] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-6">
        {/* Double array for infinite seamless looping */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
          const IconComp = Icons[item.icon];
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0f1118] border border-white/[0.06] text-xs font-mono text-ink-secondary whitespace-nowrap shadow-sm hover:border-white/[0.15] transition-colors"
            >
              <IconComp size={15} className={item.color} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
