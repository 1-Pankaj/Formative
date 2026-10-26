import React, { useRef, useEffect, useState } from 'react';
import { Icons } from './Icons';

interface Step {
  step: string;
  title: string;
  desc: string;
  badge: string;
  codeSnippet?: string;
}

const STEPS: Step[] = [
  {
    step: '01',
    title: 'Point Formative to any local repository',
    desc: 'Select your project directory. Formative immediately indexes root files, builds folder taxonomies, and parses TypeScript, Vue, Svelte, Go, Rust, and Python codebases while strictly skipping .env secrets, git trees, and binary caches.',
    badge: 'NON-INVASIVE SCAN',
    codeSnippet: '$ formative ./my-hyperion-app --read-only',
  },
  {
    step: '02',
    title: 'Inspect syntax-tree relationships on an infinite canvas',
    desc: 'The AST engine traces cross-file imports and maps REST/RPC endpoints into an interactive diagram. You can organize components, annotate workflows, and configure specialist characters in the 3D office floor.',
    badge: 'AST GRAPH & 3D HUB',
    codeSnippet: '✓ Inferred: /api/v1/auth -> AuthService.ts\n✓ Inferred: AuthService.ts -> RedisPool',
  },
  {
    step: '03',
    title: 'Supervise agent CLI runs and consult the offline LLM',
    desc: 'Launch read-only Claude Code or Codex tasks. Formative captures tool calls and file diffs in real-time, while Rex (the offline SmolLM2 coordinator) answers questions on-device without internet access.',
    badge: 'AIR-GAPPED ORCHESTRATION',
    codeSnippet: '[Claude Code] Tool: GrepSearch { query: "TokenValidator" }\n[SmolLM2] Status: 0 cloud calls • 270MB weights active',
  },
];

export const TracingBeam: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [beamHeight, setBeamHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const start = rect.top - windowHeight * 0.4;
      const total = rect.height;
      const progress = Math.min(Math.max(-start / total, 0), 1);
      
      setBeamHeight(progress * 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative py-24 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
          WORKFLOW SPECIFICATION
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
          How Formative operates on your machine.
        </h2>
        <p className="text-ink-muted text-base sm:text-lg mt-3">
          Zero complex configuration. Download the executable and run your first project in seconds.
        </p>
      </div>

      <div className="relative pl-6 sm:pl-16">
        {/* Aceternity Vertical Tracing Laser Beam Line */}
        <div className="absolute left-2 sm:left-6 top-3 bottom-8 w-[2px] bg-white/[0.08]">
          {/* Active Glowing Beam */}
          <div
            className="w-full bg-gradient-to-b from-brand via-cyan-400 to-brand transition-all duration-150 shadow-[0_0_12px_rgba(224,68,24,0.8)]"
            style={{ height: `${beamHeight}%` }}
          />
        </div>

        {/* Steps Stack */}
        <div className="space-y-16">
          {STEPS.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Step indicator node on the beam */}
              <div className="absolute -left-[27px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-[#0a0c12] border-2 border-brand/60 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-lg shadow-brand/20">
                {item.step}
              </div>

              {/* Step Card Content */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0e15] border border-white/[0.07] hover:border-white/[0.15] transition-all duration-300 shadow-xl">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.04] text-cyan-400 border border-cyan-500/20">
                    {item.badge}
                  </span>
                  <span className="text-xs font-mono text-ink-muted">PHASE // {item.step}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed mb-4">
                  {item.desc}
                </p>

                {item.codeSnippet && (
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.05] font-mono text-xs text-ink-secondary overflow-x-auto">
                    <pre className="whitespace-pre">{item.codeSnippet}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
