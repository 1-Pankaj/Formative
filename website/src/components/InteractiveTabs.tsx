import React, { useState } from 'react';
import { Icons } from './Icons';

interface TabItem {
  id: string;
  label: string;
  badge: string;
  icon: keyof typeof Icons;
  title: string;
  description: string;
}

const TABS: TabItem[] = [
  {
    id: 'architecture',
    label: 'AST Architecture Map',
    badge: 'Zero-Runtime',
    icon: 'ArchitectureMap',
    title: 'Static Syntax-Tree Graph Generation',
    description: 'Scans your local repository files across TypeScript, Vue, Svelte, Python, Go, and Rust. Traces explicit imports, framework routes, and inferred API schemas without ever executing dangerous project code.',
  },
  {
    id: 'llm',
    label: 'Offline SmolLM2 LLM',
    badge: '270 MB GGUF',
    icon: 'LocalLlm',
    title: '100% On-Device Neural Dialogue Engine',
    description: 'Bundles quantized weights derived from SmolLM2-360M-Instruct under the Apache 2.0 license. Powered by node-llama-cpp on local CPU/Vulkan with zero cloud network requests and zero latency.',
  },
  {
    id: 'agents',
    label: 'Agent CLI Telemetry',
    badge: 'Claude Code & Codex',
    icon: 'AgentCli',
    title: 'Supervised Read-Only Agent Orchestration',
    description: 'Hooks into your locally installed Claude Code and Codex command-line tools. Streams live tool invocations, token steps, and file diffs in a safe read-only sandbox.',
  },
  {
    id: 'office',
    label: '3D Project Office',
    badge: 'Three.js Stage',
    icon: 'Office3D',
    title: 'Spatial Team Hub with Real Agent States',
    description: 'An interactive 3D spatial floor where project teammates and coordinators reflect real CLI agent runs. Fully procedural character generation with custom roles, departments, and avatars.',
  },
];

export const InteractiveTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('architecture');
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  // Interactive playground states
  const [simPrompt, setSimPrompt] = useState('how does our auth module connect to database?');
  const [llmOutput, setLlmOutput] = useState('Our auth module routes tokens through the Redis session cache before validating user records in PostgreSQL.');
  const [simulating, setSimulating] = useState(false);

  const runSim = (text: string) => {
    setSimPrompt(text);
    setSimulating(true);
    setTimeout(() => {
      if (text.includes('auth')) {
        setLlmOutput('Our auth module routes tokens through the Redis session cache before validating user records in PostgreSQL.');
      } else if (text.includes('architecture') || text.includes('module')) {
        setLlmOutput('The codebase is grouped into 6 top-level modules. The API Gateway forwards requests to the user service via internal gRPC.');
      } else {
        setLlmOutput('All services are humming along nicely today. Keeping dependencies decoupled and review queues clean.');
      }
      setSimulating(false);
    }, 400);
  };

  return (
    <section id="architecture" className="relative py-20 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-4">
          <Icons.Sparkles size={14} />
          <span>FOUR INTEGRATED SYSTEMS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Explore the engine under the hood.
        </h2>
        <p className="text-ink-muted text-base sm:text-lg mt-3">
          Click through Formative's core systems to inspect live demonstrations of each component.
        </p>
      </div>

      {/* Fluid Tab Pills Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#0f1017] border border-white/[0.08] max-w-3xl mx-auto mb-10 shadow-xl">
        {TABS.map((tab) => {
          const IconComponent = Icons[tab.icon];
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 select-none ${
                isActive
                  ? 'text-white bg-[#1a1c28] border border-white/[0.12] shadow-lg shadow-black/50'
                  : 'text-ink-muted hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <IconComponent size={16} className={isActive ? 'text-brand' : 'opacity-60'} />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                isActive ? 'bg-brand/20 text-brand' : 'bg-white/5 text-ink-muted'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Demonstration Workspace Card */}
      <div className="rounded-2xl bg-[#0d0e15] border border-white/[0.08] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Description Column */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono uppercase text-brand tracking-wider font-semibold">
              Deep Dive / {current.badge}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {current.title}
            </h3>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              {current.description}
            </p>

            {/* Technical Highlights list */}
            <div className="space-y-2.5 pt-2">
              {activeTab === 'architecture' && (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-cyan-400" />
                    <span>Cross-file module discovery with zero execution</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-cyan-400" />
                    <span>Inferred REST / RPC routes & schema connections</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-cyan-400" />
                    <span>Preserves user-drawn editable diagrams independently</span>
                  </div>
                </>
              )}

              {activeTab === 'llm' && (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-amber-400" />
                    <span>SmolLM2-360M quantized weights bundled inside executable</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-amber-400" />
                    <span>Apache 2.0 licensed with zero external API fees</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-amber-400" />
                    <span>Non-robotic dialogue: coworker persona with zero AI slop</span>
                  </div>
                </>
              )}

              {activeTab === 'agents' && (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-emerald-400" />
                    <span>Real-time Claude Code & Codex CLI event streaming</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-emerald-400" />
                    <span>Guaranteed read-only sandbox execution</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-emerald-400" />
                    <span>JSON and JSONL transcript discovery & live monitoring</span>
                  </div>
                </>
              )}

              {activeTab === 'office' && (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-purple-400" />
                    <span>Procedural 3D avatars rendered with Three.js</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-purple-400" />
                    <span>Up to 23 customizable specialist teammates</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <Icons.Check size={14} className="text-purple-400" />
                    <span>Live office telemetry driven by active agent CLI runs</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Live Interactive Demonstration Widget */}
          <div className="lg:col-span-7 rounded-xl bg-[#07080c] border border-white/[0.08] p-5 shadow-inner">
            {activeTab === 'architecture' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-white/[0.06] pb-3">
                  <span>LIVE AST GRAPH SIMULATOR</span>
                  <span className="text-cyan-400">4 Modules / 9 Links</span>
                </div>

                {/* Micro Architecture Graph View */}
                <div className="relative h-64 bg-grid-pattern rounded-lg p-4 flex items-center justify-around border border-white/[0.04]">
                  {/* Link lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="50%" y1="50%" x2="75%" y2="30%" stroke="#e04418" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="50%" y1="50%" x2="75%" y2="70%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                  </svg>

                  {/* Node: Client Route */}
                  <div className="relative z-10 p-3 rounded-lg bg-[#12141e] border border-cyan-500/40 text-center w-28">
                    <div className="text-[10px] font-mono text-cyan-400 font-semibold">ROUTE</div>
                    <div className="text-xs font-bold text-white mt-0.5">/api/v1/auth</div>
                    <div className="text-[9px] text-ink-muted font-mono mt-1">Next.js 15</div>
                  </div>

                  {/* Node: Controller */}
                  <div className="relative z-10 p-3 rounded-lg bg-[#151724] border border-brand/50 text-center w-32 shadow-lg shadow-brand/10">
                    <div className="text-[10px] font-mono text-brand font-semibold">SERVICE</div>
                    <div className="text-xs font-bold text-white mt-0.5">AuthManager.ts</div>
                    <div className="text-[9px] text-ink-muted font-mono mt-1">AST: Inferred</div>
                  </div>

                  {/* Node: Storage Targets */}
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="p-2.5 rounded-lg bg-[#12141e] border border-amber-500/40 text-center w-28">
                      <div className="text-[10px] font-mono text-amber-400">CACHE</div>
                      <div className="text-xs font-bold text-white">Redis Cluster</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#12141e] border border-emerald-500/40 text-center w-28">
                      <div className="text-[10px] font-mono text-emerald-400">DATABASE</div>
                      <div className="text-xs font-bold text-white">PostgreSQL</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-ink-muted font-mono bg-white/[0.02] p-2.5 rounded border border-white/[0.05]">
                  <span className="text-cyan-400 font-semibold">[AST Parser]</span> Successfully linked `src/routes/auth.ts` &rarr; `src/services/AuthManager.ts` through static AST resolution.
                </div>
              </div>
            )}

            {activeTab === 'llm' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>LOCAL LLM RUNTIME (SMOLLM2-360M)</span>
                  </div>
                  <span className="text-amber-400">Offline (0ms network)</span>
                </div>

                {/* Sample Prompt Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runSim('how does our auth module connect to database?')}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-ink-secondary border border-white/[0.08] transition-colors"
                  >
                    "explain auth module"
                  </button>
                  <button
                    onClick={() => runSim('what are the project architecture modules?')}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-ink-secondary border border-white/[0.08] transition-colors"
                  >
                    "list architecture modules"
                  </button>
                  <button
                    onClick={() => runSim('who are you?')}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-ink-secondary border border-white/[0.08] transition-colors"
                  >
                    "who are you"
                  </button>
                </div>

                {/* Simulated Conversation Box */}
                <div className="p-4 rounded-xl bg-[#0a0c12] border border-white/[0.06] space-y-3 font-sans">
                  {/* User message */}
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="px-3.5 py-2 rounded-xl rounded-tr-none bg-brand/20 border border-brand/30 text-xs text-white max-w-sm">
                      {simPrompt}
                    </div>
                  </div>

                  {/* Teammate response */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] font-bold text-amber-300">
                      R
                    </div>
                    <div className="px-3.5 py-2 rounded-xl rounded-tl-none bg-[#151722] border border-white/[0.08] text-xs text-ink-secondary max-w-sm leading-relaxed">
                      {simulating ? (
                        <span className="inline-flex items-center gap-1 font-mono text-ink-muted">
                          <span className="animate-spin text-amber-400">/</span> generating locally...
                        </span>
                      ) : (
                        llmOutput
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted px-1">
                  <span>Context: 1024 tokens</span>
                  <span>Weights: formativellm.gguf (Q8_0)</span>
                </div>
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>CLAUDE CODE CLI STREAM</span>
                  </div>
                  <span className="text-emerald-400 font-mono">SANDBOX: READ-ONLY</span>
                </div>

                {/* Interactive Terminal Stream */}
                <div className="p-4 rounded-xl bg-[#090b10] border border-white/[0.06] font-mono text-xs text-ink-muted space-y-2 h-64 overflow-y-auto">
                  <div className="text-ink-secondary">&gt; claude --permission-mode plan</div>
                  <div className="text-cyan-400">&gt; Provider: Anthropic Claude Code (v0.2.29)</div>
                  <div className="text-ink-muted">&gt; Working Directory: D:\projects\hyperion</div>
                  <div className="text-brand">&gt; Tool Call: GrepSearch &#123; path: 'src/lib', query: 'TokenVerifier' &#125;</div>
                  <div className="pl-4 text-emerald-400">&#10003; 3 matches found in src/lib/token.ts:42</div>
                  <div className="text-brand">&gt; Tool Call: ViewFile &#123; path: 'src/lib/token.ts', lines: [40, 60] &#125;</div>
                  <div className="pl-4 text-ink-secondary">Reviewing token signing algorithms...</div>
                  <div className="p-2.5 rounded bg-[#10121a] border border-white/[0.05] text-ink-secondary text-[11px] my-2">
                    "Tokens are signed using RS256 with key rotation every 24 hours. The verification pipeline meets standard security criteria."
                  </div>
                  <div className="text-emerald-400">&gt; Status: Run completed in 2.14s. 0 files modified.</div>
                </div>
              </div>
            )}

            {activeTab === 'office' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-white/[0.06] pb-3">
                  <span>3D THREE.JS STAGE</span>
                  <span className="text-purple-400">1 Coordinator + 4 Teammates</span>
                </div>

                {/* 3D Office Stage Preview Card */}
                <div className="relative h-64 bg-[#0a0c14] rounded-lg p-4 flex flex-col items-center justify-center border border-white/[0.04] overflow-hidden">
                  <div className="absolute inset-0 bg-dot-pattern opacity-40" />

                  {/* Character Avatars Row */}
                  <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-active border-2 border-brand/50 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand/20">
                        Rex
                      </div>
                      <span className="text-[10px] font-mono text-brand font-semibold">Coordinator</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#181a28] border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                        Elena
                      </div>
                      <span className="text-[10px] font-mono text-ink-muted">Frontend</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#181a28] border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm">
                        Marcus
                      </div>
                      <span className="text-[10px] font-mono text-ink-muted">Backend</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#181a28] border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                        Nate
                      </div>
                      <span className="text-[10px] font-mono text-ink-muted">DevOps</span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-ink-secondary">
                    Coordinator is active • Listening for project tasks
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
