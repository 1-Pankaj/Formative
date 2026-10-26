import React, { useState } from 'react';
import { Icons } from './Icons';

interface BentoCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Icons;
  tag: string;
  tagColor: string;
  className?: string;
  children?: React.ReactNode;
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  tag,
  tagColor,
  className = '',
  children,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const IconComponent = Icons[icon];

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group rounded-2xl p-6 sm:p-8 bg-[#0b0c12] border border-white/[0.08] overflow-hidden transition-all duration-300 hover:border-white/[0.18] flex flex-col justify-between ${className}`}
    >
      {/* Mouse-Tracking Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.06), transparent 80%)`,
        }}
      />

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <IconComponent size={20} />
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${tagColor}`}>
            {tag}
          </span>
        </div>

        <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">{subtitle}</span>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 mb-2">
          {title}
        </h3>
        <p className="text-sm text-ink-muted leading-relaxed">
          {description}
        </p>
      </div>

      {/* Card Content or Visual Widget */}
      <div className="mt-6 pt-4 border-t border-white/[0.05]">
        {children}
      </div>
    </div>
  );
};

export const BentoGrid: React.FC = () => {
  return (
    <section id="telemetry" className="relative py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-brand font-semibold">
          SECURITY & LOCAL EXECUTION
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
          Engineered for privacy, speed, and zero cloud lock-in.
        </h2>
        <p className="text-ink-muted text-base sm:text-lg mt-3">
          Formative has no user accounts, no subscriptions, and transmits zero telemetry to any remote cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: Air-Gapped Security (Wide) */}
        <BentoCard
          title="Air-Gapped & Zero Cloud Telemetry"
          subtitle="Privacy By Design"
          description="Your source code, AST graphs, and project files never leave your machine. Formative does not operate remote servers, tracking pixels, or third-party telemetry collectors."
          icon="SecurityShield"
          tag="AIR-GAPPED"
          tagColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
          className="md:col-span-7"
        >
          <div className="grid grid-cols-3 gap-3 font-mono text-center">
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04]">
              <div className="text-xs text-ink-muted">CLOUD SERVERS</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">0</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04]">
              <div className="text-xs text-ink-muted">ACCOUNT REQUIRED</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">NONE</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04]">
              <div className="text-xs text-ink-muted">LICENSE</div>
              <div className="text-sm font-bold text-white mt-0.5">MIT</div>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Local SmolLM2 Offline LLM (Tall) */}
        <BentoCard
          title="Bundled SmolLM2-360M Local Weights"
          subtitle="Neural Intelligence"
          description="Shipped directly inside the installer as an embedded 270 MB GGUF weight file. Executes instantly via node-llama-cpp on your CPU or Vulkan GPU with zero API charges."
          icon="LocalLlm"
          tag="APACHE 2.0"
          tagColor="bg-amber-500/10 text-amber-400 border-amber-500/25"
          className="md:col-span-5"
        >
          <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-ink-muted">
              <span>WEIGHT FORMAT:</span>
              <span className="text-white">GGUF (Q8_0)</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>CONTEXT WINDOW:</span>
              <span className="text-amber-400">1024 TOKENS</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>INFERENCE ENGINE:</span>
              <span className="text-white">node-llama-cpp</span>
            </div>
          </div>
        </BentoCard>

        {/* Card 3: Non-Invasive AST Discovery */}
        <BentoCard
          title="Syntax-Tree Architecture Parsing"
          subtitle="Deep Static Analysis"
          description="Groups files into architectural modules, traces imports, and discovers REST/RPC endpoints across Next.js, Remix, Nuxt, and SvelteKit without ever executing untrusted scripts."
          icon="ArchitectureMap"
          tag="STATIC AST"
          tagColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
          className="md:col-span-5"
        >
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {['TypeScript', 'Vue SFC', 'Svelte', 'Astro', 'Python', 'Go', 'Rust', 'Java'].map((lang) => (
              <span key={lang} className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-ink-secondary">
                {lang}
              </span>
            ))}
          </div>
        </BentoCard>

        {/* Card 4: Claude Code & Codex CLI Orchestration */}
        <BentoCard
          title="Read-Only Agent CLI Telemetry"
          subtitle="Supervised Autonomous AI"
          description="Formative connects to your locally authenticated Codex and Claude Code CLI tools. It provides rich live telemetry streams and file diff inspections in a strict read-only sandbox."
          icon="AgentCli"
          tag="CLI HOOKS"
          tagColor="bg-brand/10 text-brand border-brand/25"
          className="md:col-span-7"
        >
          <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-ink-secondary">Claude Code CLI</span>
            </div>
            <span className="text-ink-muted">Mode: Plan (Read-Only)</span>
            <span className="text-emerald-400 font-semibold">[VERIFIED]</span>
          </div>
        </BentoCard>
      </div>
    </section>
  );
};
