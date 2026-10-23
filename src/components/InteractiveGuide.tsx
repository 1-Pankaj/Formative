import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Globe, 
  Network, 
  Server, 
  Database, 
  Zap, 
  ArrowLeftRight, 
  Cpu, 
  Crown, 
  Play, 
  Check, 
  HelpCircle,
  Lightbulb,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ThemeMode } from '../types';

interface InteractiveGuideProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onSpawnComponent?: (category: any) => void;
}

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({
  isOpen,
  onClose,
  theme,
  onSpawnComponent,
}) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'components' | 'wiring' | 'agents'>('basics');
  const [interactiveStep, setInteractiveStep] = useState(0);

  if (!isOpen) return null;

  const isDark = theme !== 'light';

  const componentCards = [
    {
      category: 'frontend',
      title: 'Frontend Client UI',
      icon: Globe,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      analogy: 'The Storefront & Display Window',
      explanation: 'This is the web or mobile screen your users actually look at, type into, and click. Built with React, Next.js, or HTML/Tailwind.',
      codeExample: 'src/app/page.tsx, components/Header.tsx',
      connectionTip: 'Connect the output of Frontend into the input of the API Gateway to send user actions.',
    },
    {
      category: 'gateway',
      title: 'API Gateway & Ingress',
      icon: Network,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      analogy: 'The Security Desk & Traffic Cop',
      explanation: 'Checks if users are logged in (JWT tokens), limits spam (rate limits), and directs requests to the correct backend service.',
      codeExample: 'src/api/gateway.ts, nginx.conf',
      connectionTip: 'Connect from Frontend, and route outward into Backend Microservices.',
    },
    {
      category: 'backend',
      title: 'Backend Microservice',
      icon: Server,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      analogy: 'The Engine Room & Kitchen',
      explanation: 'Where business logic runs: calculating prices, generating reports, executing algorithms, and coordinating with the database.',
      codeExample: 'src/services/billing.ts, controllers/user.ts',
      connectionTip: 'Receives requests from the Gateway and wires into Databases or Message Queues.',
    },
    {
      category: 'database',
      title: 'Database Storage',
      icon: Database,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      analogy: 'The Permanent Fireproof Vault',
      explanation: 'Safely saves user accounts, transactions, and project files. Retains data even when servers reboot (PostgreSQL, SQLite).',
      codeExample: 'prisma/schema.prisma, db/migrations.sql',
      connectionTip: 'Only Backend Services should connect directly to Databases for security.',
    },
    {
      category: 'cache',
      title: 'Cache & Memory',
      icon: Zap,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      analogy: "The Chef's Quick-Reach Cutting Board",
      explanation: 'Stores frequent queries in lightning-fast RAM (Redis) so the database is not overloaded by millions of repeat requests.',
      codeExample: 'src/lib/redis.ts',
      connectionTip: 'Backend checks the Cache first; if missing, it falls back to the Database.',
    },
    {
      category: 'queue',
      title: 'Message Queue & Event Bus',
      icon: ArrowLeftRight,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      analogy: 'The Order Ticket Conveyor Belt',
      explanation: 'Allows services to schedule background tasks (like sending 10,000 emails or processing video) without making users wait.',
      codeExample: 'src/queues/emailQueue.ts (BullMQ, Kafka)',
      connectionTip: 'Backend pushes jobs to the Queue, and Background Workers consume them.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className={`w-full max-w-4xl border rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden ${
        isDark ? 'bg-[#09090b] border-[#27272a] text-[#fafafa]' : 'bg-[#ffffff] border-[#e4e4e7] text-[#09090b]'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-[#1f1f23] bg-[#0c0c0e]' : 'border-[#e4e4e7] bg-[#fafafa]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Formative Architecture & Agent Learning Center
              </h3>
              <p className="text-xs text-zinc-400">
                A visual, beginner-friendly guide to modern system architecture and autonomous agent orchestration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b px-6 text-xs font-medium gap-2 shrink-0 ${
          isDark ? 'border-[#1f1f23] bg-[#09090b]' : 'border-[#e4e4e7] bg-[#f4f4f5]'
        }`}>
          {[
            { id: 'basics', label: '1. Architecture 101' },
            { id: 'components', label: '2. Component Breakdown' },
            { id: 'wiring', label: '3. Connecting Nodes' },
            { id: 'agents', label: '4. Agents & Org Chart' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-3 border-b-2 font-semibold transition-all ${
                activeTab === t.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ARCHITECTURE 101 */}
          {activeTab === 'basics' && (
            <div className="space-y-6 max-w-3xl">
              <div className="space-y-2">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Why do we need an Architecture Map?</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  When you build software with AI agents (or human engineers), building without an architecture map is like building a skyscraper without blueprints. Code gets messy, functions duplicate, and AI agents get confused about where code lives.
                </p>
              </div>

              {/* 3 Pillars Visual Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-2">
                  <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h5 className="text-xs font-bold text-white">Visual Clarity</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Instantly see how your Frontend talks to your API Gateway, and how data safely flows into PostgreSQL or Redis.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-2">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h5 className="text-xs font-bold text-white">Single-Agent Harness</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    The Chief Executive Agent orchestrates alone from the corner office, activating specialist skills on demand.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-2">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h5 className="text-xs font-bold text-white">Zero-Token Telemetry</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Reads local log files directly from disk (Claude Code, Antigravity, OpenCode) with zero API tokens consumed.
                  </p>
                </div>
              </div>

              {/* Next Step Action */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-white">Ready to learn what each node does?</h5>
                  <p className="text-[11px] text-zinc-400">Explore Frontend, API Gateway, Databases, and Queues.</p>
                </div>
                <button
                  onClick={() => setActiveTab('components')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
                >
                  <span>Explore Components</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: COMPONENT BREAKDOWN */}
          {activeTab === 'components' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  Engineering Component Library
                </h4>
                <p className="text-xs text-zinc-400">
                  Every modern system is assembled from these standardized building blocks:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {componentCards.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div 
                      key={c.category}
                      className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg border ${c.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">{c.title}</h5>
                            <span className="text-[10px] font-mono text-zinc-400 italic">
                              "{c.analogy}"
                            </span>
                          </div>
                        </div>

                        {onSpawnComponent && (
                          <button
                            onClick={() => {
                              onSpawnComponent(c.category);
                              onClose();
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                          >
                            + Add to Canvas
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {c.explanation}
                      </p>

                      <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                        <div className="text-zinc-500">Typical files: <code className="text-zinc-300">{c.codeExample}</code></div>
                        <div className="text-blue-400">Tip: {c.connectionTip}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CONNECTING NODES */}
          {activeTab === 'wiring' && (
            <div className="space-y-5 max-w-3xl">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  How Connecting Nodes Works
                </h4>
                <p className="text-xs text-zinc-400">
                  Wires in Formative represent network requests (REST, gRPC, WebSocket) or data queries:
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300 font-bold">
                    Frontend Client (Output Port ⚪)
                  </div>
                  <div className="flex-1 mx-4 border-t-2 border-dashed border-zinc-600 flex items-center justify-center relative">
                    <span className="bg-zinc-900 px-2 text-[10px] text-zinc-400 font-mono">
                      POST /api/login (HTTP Request)
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-bold">
                    (⚪ Input Port) API Gateway
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                  <p>
                    • <strong>Connecting:</strong> Hover your mouse over the right-side dot (Output) of a node, click and drag a wire across to the left-side dot (Input) of the destination node.
                  </p>
                  <p>
                    • <strong>Auto-Layout (Tidy):</strong> If your canvas ever looks messy or nodes overlap, simply click the <strong>Tidy</strong> button in the top toolbar to automatically organize all components into a clean, hierarchical tree.
                  </p>
                  <p>
                    • <strong>Inspecting & Editing:</strong> Click any node to open the right properties drawer and customize labels, paths, or documentation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AGENTS & ORG CHART */}
          {activeTab === 'agents' && (
            <div className="space-y-5 max-w-3xl">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  Single-Agent Orchestration & Org Chart
                </h4>
                <p className="text-xs text-zinc-400">
                  How Formative coordinates local AI agents without messy multi-agent token burn:
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-3">
                <div className="flex items-center gap-3 text-amber-400 font-bold text-sm">
                  <Crown className="w-5 h-5" />
                  <span>The CEO Agent (Chief Executive Agent)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  In Formative, you pair program with a primary orchestrator (the CEO). The CEO receives your prompt, formulates the execution plan, and coordinates specialized skills like Frontend, Backend, QA, and Database.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="font-semibold text-white block">Org Chart View</span>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      See the clear hierarchy of your project roles (CEO, CTO, CMO, Engineers).
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="font-semibold text-white block">Operations Floor</span>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Interactive 2D pixel studio floor where the CEO works at the corner desk.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between shrink-0 ${
          isDark ? 'border-[#1f1f23] bg-[#0c0c0e]' : 'border-[#e4e4e7] bg-[#fafafa]'
        }`}>
          <span className="text-xs text-zinc-500">
            Formative Open Source • Zero Token Cost
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Got it, let's build!
          </button>
        </div>
      </div>
    </div>
  );
};
