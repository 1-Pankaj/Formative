import React from 'react';
import { CardSpotlight } from './CardSpotlight';
import { Icons } from './Icons';

interface FeatureItem {
  step: string;
  title: string;
  description: string;
  tag: string;
  icon: keyof typeof Icons;
  highlightColor: string;
}

const FEATURES: FeatureItem[] = [
  {
    step: '01',
    title: 'Non-Invasive AST Discovery',
    description: 'Scans your local repository syntax-trees across TypeScript, Vue SFC, Svelte, Astro, Python, Go, and Rust. Discovers routes, schemas, and cross-file imports without ever running project code.',
    tag: 'STATIC PARSER',
    icon: 'ArchitectureMap',
    highlightColor: 'text-cyan-400',
  },
  {
    step: '02',
    title: 'Bundled 270 MB SmolLM2 LLM',
    description: 'Embedded quantized GGUF weights executed on-device via node-llama-cpp on your CPU or Vulkan GPU. 0ms network latency, zero cloud costs, and conversational coworker dialogue.',
    tag: 'APACHE 2.0',
    icon: 'LocalLlm',
    highlightColor: 'text-amber-400',
  },
  {
    step: '03',
    title: 'Supervised CLI Agent Hooks',
    description: 'Hooks into your locally installed Claude Code and Codex CLI tools. Safely streams live tool invocations, grep searches, and file diffs in a strict read-only plan mode.',
    tag: 'READ-ONLY SANDBOX',
    icon: 'AgentCli',
    highlightColor: 'text-brand',
  },
  {
    step: '04',
    title: 'Air-Gapped & Zero Cloud',
    description: 'Formative transmits 0.00 bytes to remote servers. There are no user accounts, no login walls, no tracking cookies, and no cloud dependency. 100% on-device privacy.',
    tag: 'PRIVATE BY DESIGN',
    icon: 'SecurityShield',
    highlightColor: 'text-emerald-400',
  },
  {
    step: '05',
    title: 'Interactive 3D Office Stage',
    description: 'A procedural spatial floor rendered with Three.js. Up to 23 customizable specialist teammates and coordinators whose ambient activity reflects real CLI agent tasks.',
    tag: 'THREE.JS HUB',
    icon: 'Office3D',
    highlightColor: 'text-purple-400',
  },
  {
    step: '06',
    title: 'Live Transcript Ingestion',
    description: 'Watches local JSON and JSONL agent session directories. Reads and formats multi-step tool calls, thoughts, and diff outputs with automatic live file monitoring.',
    tag: 'OBSERVABILITY',
    icon: 'Terminal',
    highlightColor: 'text-cyan-400',
  },
  {
    step: '07',
    title: 'Infinite Editable Canvas',
    description: 'Draw, connect, and rearrange components on a responsive zoomable canvas. Preserves user-authored architectural plans alongside live syntax-tree scans.',
    tag: 'CANVAS ENGINE',
    icon: 'Sparkles',
    highlightColor: 'text-white',
  },
  {
    step: '08',
    title: 'Native Windows Single .exe',
    description: 'Shipped as both an interactive NSIS setup installer and a standalone portable executable. Both packages embed the 270MB LLM weights for instant out-of-the-box execution.',
    tag: 'PRE-COMPILED',
    icon: 'Windows',
    highlightColor: 'text-brand',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-28 px-6 lg:px-16 max-w-7xl mx-auto bg-black">
      {/* Section Header */}
      <div className="max-w-3xl mb-16">
        <div className="text-sm font-body text-white/70 mb-4 font-light">
          // Architectural Pillars
        </div>
        <h2 className="font-heading italic text-5xl sm:text-6xl md:text-7xl leading-[0.9] tracking-[-3px] text-white">
          Engineered for privacy,{'\n'}designed for speed.
        </h2>
        <p className="text-sm sm:text-base text-white/80 font-body font-light max-w-xl mt-4 leading-relaxed">
          Formative merges static analysis, local neural inference, and real agent CLI supervision into a unified desktop environment.
        </p>
      </div>

      {/* Aceternity Features Section Demo 3 Grid (4x2 layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {FEATURES.map((feature, idx) => {
          const IconComp = Icons[feature.icon];
          return (
            <CardSpotlight
              key={idx}
              radius={280}
              className="flex flex-col justify-between min-h-[300px] border border-white/[0.07] bg-[#090a0f] hover:border-white/[0.2] transition-colors"
            >
              {/* Card Top: Step + Tag */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-white">
                    <IconComp size={18} className={feature.highlightColor} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-white/60">
                    {feature.tag}
                  </span>
                </div>

                <div className="text-xs font-mono text-white/40 mb-1">
                  PHASE // {feature.step}
                </div>
                <h3 className="font-heading italic text-2xl tracking-[-0.5px] leading-tight text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs font-body font-light text-white/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Card Bottom subtle border line */}
              <div className="mt-6 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-white/40">
                <span>LOCAL RUNTIME</span>
                <span className="text-white/60">100% AIR-GAPPED</span>
              </div>
            </CardSpotlight>
          );
        })}
      </div>
    </section>
  );
};
