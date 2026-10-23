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
  FolderOpen,
  Lightbulb,
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

  if (!isOpen) return null;

  const isDark = theme !== 'light';
  const headingColor = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const bodyColor = isDark ? 'text-zinc-300' : 'text-zinc-700';
  const mutedColor = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const cardSurface = isDark
    ? 'border-zinc-800 bg-zinc-900/60'
    : 'border-zinc-200 bg-zinc-50';
  const raisedCardSurface = isDark
    ? 'border-zinc-800 bg-zinc-900/70'
    : 'border-zinc-200 bg-white';
  const insetSurface = isDark
    ? 'border-zinc-800 bg-zinc-950'
    : 'border-zinc-200 bg-zinc-50';
  const separator = isDark ? 'border-zinc-800/80' : 'border-zinc-200';
  const stepOneBadge = isDark
    ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    : 'border-blue-200 bg-blue-50 text-blue-700';
  const stepTwoBadge = isDark
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    : 'border-amber-200 bg-amber-50 text-amber-800';
  const stepThreeBadge = isDark
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  const componentCards = [
    {
      category: 'frontend',
      title: 'Frontend Client UI',
      icon: Globe,
      colorDark: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      colorLight: 'text-blue-700 bg-blue-50 border-blue-200',
      analogy: 'The Storefront & Display Window',
      explanation: 'This is the web or mobile screen your users actually look at, type into, and click. Built with React, Next.js, or HTML/Tailwind.',
      codeExample: 'src/app/page.tsx, components/Header.tsx',
      connectionTip: 'Connect the output of Frontend into the input of the API Gateway to send user actions.',
    },
    {
      category: 'gateway',
      title: 'API Gateway & Ingress',
      icon: Network,
      colorDark: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      colorLight: 'text-purple-700 bg-purple-50 border-purple-200',
      analogy: 'The Security Desk & Traffic Cop',
      explanation: 'Checks if users are logged in (JWT tokens), limits spam (rate limits), and directs requests to the correct backend service.',
      codeExample: 'src/api/gateway.ts, nginx.conf',
      connectionTip: 'Connect from Frontend, and route outward into Backend Microservices.',
    },
    {
      category: 'backend',
      title: 'Backend Microservice',
      icon: Server,
      colorDark: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      colorLight: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      analogy: 'The Engine Room & Kitchen',
      explanation: 'Where business logic runs: calculating prices, generating reports, executing algorithms, and coordinating with the database.',
      codeExample: 'src/services/billing.ts, controllers/user.ts',
      connectionTip: 'Receives requests from the Gateway and wires into Databases or Message Queues.',
    },
    {
      category: 'database',
      title: 'Database Storage',
      icon: Database,
      colorDark: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      colorLight: 'text-amber-800 bg-amber-50 border-amber-200',
      analogy: 'The Permanent Fireproof Vault',
      explanation: 'Safely saves user accounts, transactions, and project files. Retains data even when servers reboot (PostgreSQL, SQLite).',
      codeExample: 'prisma/schema.prisma, db/migrations.sql',
      connectionTip: 'Only Backend Services should connect directly to Databases for security.',
    },
    {
      category: 'cache',
      title: 'Cache & Memory',
      icon: Zap,
      colorDark: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      colorLight: 'text-cyan-800 bg-cyan-50 border-cyan-200',
      analogy: "The Chef's Quick-Reach Cutting Board",
      explanation: 'Stores frequent queries in lightning-fast RAM (Redis) so the database is not overloaded by millions of repeat requests.',
      codeExample: 'src/lib/redis.ts',
      connectionTip: 'Backend checks the Cache first; if missing, it falls back to the Database.',
    },
    {
      category: 'queue',
      title: 'Message Queue & Event Bus',
      icon: ArrowLeftRight,
      colorDark: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      colorLight: 'text-pink-700 bg-pink-50 border-pink-200',
      analogy: 'The Order Ticket Conveyor Belt',
      explanation: 'Allows services to schedule background tasks (like sending 10,000 emails or processing video) without making users wait.',
      codeExample: 'src/queues/emailQueue.ts (BullMQ, Kafka)',
      connectionTip: 'Backend pushes jobs to the Queue, and Background Workers consume them.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`flex h-[min(85vh,48rem)] max-h-[calc(100vh_-_1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${
        isDark ? 'bg-[#09090b] border-[#27272a] text-[#fafafa]' : 'bg-[#ffffff] border-[#e4e4e7] text-[#09090b]'
      }`}>
        {/* Header */}
        <div className={`flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4 ${
          isDark ? 'border-[#1f1f23] bg-[#0c0c0e]' : 'border-[#e4e4e7] bg-[#fafafa]'
        }`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
              <BookOpen className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-700'}`} />
            </div>
            <div className="min-w-0">
              <h3 className={`truncate text-sm font-bold tracking-tight ${headingColor}`}>
                Formative Canvas Guide
              </h3>
              <p className={`truncate text-xs ${mutedColor}`}>
                A guide to project diagrams, local agent chat, and saved transcripts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close canvas guide"
            className={`shrink-0 rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex min-w-0 shrink-0 gap-2 overflow-x-auto border-b px-3 text-xs font-medium sm:px-6 ${
          isDark ? 'border-[#1f1f23] bg-[#09090b]' : 'border-[#e4e4e7] bg-[#f4f4f5]'
        }`}>
          {[
            { id: 'basics', label: '1. Canvas basics' },
            { id: 'components', label: '2. Components' },
            { id: 'wiring', label: '3. Connecting nodes' },
            { id: 'agents', label: '4. Agent chat & transcripts' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 ${
                activeTab === t.id
                  ? isDark ? 'border-white text-white' : 'border-zinc-900 text-zinc-900'
                  : isDark ? 'border-transparent text-zinc-500 hover:text-zinc-300' : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: ARCHITECTURE 101 */}
          {activeTab === 'basics' && (
            <div className="space-y-6 max-w-3xl">
              <div className="space-y-2">
                <h4 className={`flex items-center gap-2 text-base font-bold ${headingColor}`}>
                  <Lightbulb className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                  <span>What is the project canvas?</span>
                </h4>
                <p className={`text-xs leading-relaxed font-sans ${bodyColor}`}>
                  Formative has three separate project views: an editable Canvas diagram, a Project structure view based on folder names, and a read-only Architecture map built from local source code. The architecture map follows static evidence such as imports and recognized route conventions; inferred links are labeled, and runtime behavior is not shown.
                </p>
              </div>

              {/* 3 Pillars Visual Box */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className={`space-y-2 rounded-xl border p-4 ${cardSurface}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold ${stepOneBadge}`}>
                    1
                  </div>
                  <h5 className={`text-xs font-bold ${headingColor}`}>Visual Clarity</h5>
                  <p className={`text-[11px] leading-relaxed ${mutedColor}`}>
                    Add components and connect them to record the relationships you want to communicate. Formative does not verify those connections against code.
                  </p>
                </div>

                <div className={`space-y-2 rounded-xl border p-4 ${cardSurface}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold ${stepTwoBadge}`}>
                    2
                  </div>
                  <h5 className={`text-xs font-bold ${headingColor}`}>Project tasks</h5>
                  <p className={`text-[11px] leading-relaxed ${mutedColor}`}>
                    Track work in a project. You can link a task to an agent run from Agent chat; creating a task does not start an agent.
                  </p>
                </div>

                <div className={`space-y-2 rounded-xl border p-4 ${cardSurface}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold ${stepThreeBadge}`}>
                    3
                  </div>
                  <h5 className={`text-xs font-bold ${headingColor}`}>Local agent chat</h5>
                  <p className={`text-[11px] leading-relaxed ${mutedColor}`}>
                    Start read-only runs with local Codex or Claude Code installations. Provider usage may apply. Antigravity remains high priority while Formative checks for a supported connection path.
                  </p>
                </div>
              </div>

              {/* Next Step Action */}
              <div className={`flex flex-col items-start justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${insetSurface}`}>
                <div>
                  <h5 className={`text-xs font-semibold ${headingColor}`}>Ready to add a component?</h5>
                  <p className={`text-[11px] ${mutedColor}`}>Choose a project first, then place components on its canvas.</p>
                </div>
                <button
                  onClick={() => setActiveTab('components')}
                  className={`inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}
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
                <h4 className={`text-base font-bold ${headingColor}`}>
                  Engineering Component Library
                </h4>
                <p className={`text-xs ${mutedColor}`}>
                  Every modern system is assembled from these standardized building blocks:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {componentCards.map((c) => {
                  const Icon = c.icon;
                  const iconColor = isDark ? c.colorDark : c.colorLight;
                  return (
                    <div 
                      key={c.category}
                      className={`space-y-3 rounded-xl border p-4 transition-colors ${raisedCardSurface} ${isDark ? 'hover:border-zinc-700' : 'hover:border-zinc-300'}`}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className={`shrink-0 rounded-lg border p-2 ${iconColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className={`text-xs font-bold ${headingColor}`}>{c.title}</h5>
                            <span className={`text-[10px] font-mono italic ${mutedColor}`}>
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
                            className={`shrink-0 rounded border px-2 py-1 text-[10px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700' : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'}`}
                          >
                            + Add to Canvas
                          </button>
                        )}
                      </div>

                      <p className={`text-xs leading-relaxed font-sans ${bodyColor}`}>
                        {c.explanation}
                      </p>

                      <div className={`space-y-1 border-t pt-2 text-[11px] font-mono ${separator}`}>
                        <div className={mutedColor}>Typical files: <code className={isDark ? 'text-zinc-300' : 'text-zinc-800'}>{c.codeExample}</code></div>
                        <div className={isDark ? 'text-blue-400' : 'text-blue-700'}>Tip: {c.connectionTip}</div>
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
                <h4 className={`text-base font-bold ${headingColor}`}>
                  How Connecting Nodes Works
                </h4>
                <p className={`text-xs ${mutedColor}`}>
                  Wires in Formative represent network requests (REST, gRPC, WebSocket) or data queries:
                </p>
              </div>

              <div className={`space-y-4 rounded-xl border p-4 sm:p-5 ${raisedCardSurface}`}>
                <div className="flex flex-col items-stretch gap-3 text-xs font-mono sm:flex-row sm:items-center sm:justify-between">
                  <div className={`rounded-lg border p-3 font-bold ${isDark ? 'border-blue-500/30 bg-blue-500/10 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
                    Frontend Client (Output Port ⚪)
                  </div>
                  <div className={`relative flex min-w-0 flex-1 items-center justify-center border-t-2 border-dashed sm:mx-2 ${isDark ? 'border-zinc-600' : 'border-zinc-300'}`}>
                    <span className={`px-2 text-center text-[10px] font-mono ${isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-zinc-600'}`}>
                      POST /api/login (HTTP Request)
                    </span>
                  </div>
                  <div className={`rounded-lg border p-3 font-bold ${isDark ? 'border-purple-500/30 bg-purple-500/10 text-purple-300' : 'border-purple-200 bg-purple-50 text-purple-800'}`}>
                    (⚪ Input Port) API Gateway
                  </div>
                </div>

                <div className={`space-y-2 text-xs leading-relaxed ${bodyColor}`}>
                  <p>
                    • <strong>Connecting:</strong> Hover your mouse over the right-side dot (Output) of a node, click and drag a wire across to the left-side dot (Input) of the destination node.
                  </p>
                  <p>
                    • <strong>Arrange:</strong> If your canvas looks messy or nodes overlap, click <strong>Arrange</strong> in the top toolbar to organize components into a tree. Use <strong>Fit</strong> to bring every component into view.
                  </p>
                  <p>
                    • <strong>Inspecting & Editing:</strong> Click any node to open the right properties drawer and customize labels, paths, or documentation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AGENT CHAT & TRANSCRIPTS */}
          {activeTab === 'agents' && (
            <div className="space-y-5 max-w-3xl">
              <div className="space-y-1">
                <h4 className={`text-base font-bold ${headingColor}`}>
                  Agent chat and transcript activity
                </h4>
                <p className={`text-xs ${mutedColor}`}>
                  Start read-only conversations with local Codex or Claude Code installations. Formative shows live progress and saves the conversation to this project. Antigravity remains high priority, but its consumer CLI cannot be wrapped by third-party apps under current Google guidance.
                </p>
              </div>

              <div className={`space-y-3 rounded-xl border p-4 sm:p-5 ${raisedCardSurface}`}>
                <div className={`flex items-center gap-3 font-bold text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  <FolderOpen className="w-5 h-5" />
                  <span>Choose a project first</span>
                </div>
                <p className={`text-xs leading-relaxed ${bodyColor}`}>
                  Choose a project first. Agent chat uses its linked local folder; the first workflow can read project files but cannot change them. Your prompt and relevant project context may be sent to the provider, and its usage charges may apply.
                </p>
                <div className="grid grid-cols-1 gap-3 pt-2 text-xs sm:grid-cols-2">
                  <div className={`rounded-lg border p-3 ${insetSurface}`}>
                    <span className={`block font-semibold ${headingColor}`}>Tasks & Issues</span>
                    <p className={`mt-1 text-[11px] ${mutedColor}`}>
                      Create local tasks and optionally link an agent conversation to one.
                    </p>
                  </div>
                  <div className={`rounded-lg border p-3 ${insetSurface}`}>
                    <span className={`block font-semibold ${headingColor}`}>Agent chat</span>
                    <p className={`mt-1 text-[11px] ${mutedColor}`}>
                      Choose Codex or Claude Code, ask a question, and follow its read-only progress here.
                    </p>
                  </div>
                  <div className={`rounded-lg border p-3 ${insetSurface}`}>
                    <span className={`block font-semibold ${headingColor}`}>Saved transcripts</span>
                    <p className={`mt-1 text-[11px] ${mutedColor}`}>
                      Open a supported JSON or JSONL transcript to review recorded events. Watching a file does not control its agent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex shrink-0 flex-col items-start justify-between gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-3.5 ${
          isDark ? 'border-[#1f1f23] bg-[#0c0c0e]' : 'border-[#e4e4e7] bg-[#fafafa]'
        }`}>
          <span className={`text-xs ${mutedColor}`}>
            Open-source desktop app • Codex and Claude Code read-only runs are available
          </span>
          <button
            onClick={onClose}
            className={`min-h-8 shrink-0 rounded-md px-4 py-1.5 text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}
          >
            Close guide
          </button>
        </div>
      </div>
    </div>
  );
};
