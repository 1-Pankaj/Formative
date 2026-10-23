import React, { useState } from 'react';
import { 
  X, 
  FolderOpen, 
  Plus, 
  Bot, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Layers, 
  Cpu, 
  Server, 
  Network, 
  Database,
  MousePointer,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { ProjectType, AgentProvider, ThemeMode } from '../types';

interface OnboardingModalProps {
  theme: ThemeMode;
  isOpen: boolean;
  onClose: () => void;
  onScanDirectory: () => void;
  onCreateBlank: (name: string, type: ProjectType) => void;
  onLoadTemplate: () => void;
  onSelectProvider: (prov: AgentProvider) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  theme,
  isOpen,
  onClose,
  onScanDirectory,
  onCreateBlank,
  onLoadTemplate,
  onSelectProvider,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<ProjectType>('web');
  const [chosenProvider, setChosenProvider] = useState<AgentProvider | 'none'>('none');

  if (!isOpen) return null;

  const isDark = theme !== 'light';

  const handleFinish = () => {
    localStorage.setItem('formative_onboarded', 'true');
    if (chosenProvider !== 'none') {
      onSelectProvider(chosenProvider);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className={`w-full max-w-2xl border rounded-xl shadow-2xl overflow-hidden flex flex-col ${
        isDark ? 'bg-[#09090b] border-[#27272a] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              isDark ? 'bg-white text-black' : 'bg-zinc-900 text-white'
            }`}>
              F
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Formative Studio Setup & Quickstart
              </h2>
              <span className="text-xs font-mono text-zinc-400">
                Step {step} of 4
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Content */}
        <div className="p-6 space-y-5 min-h-[360px]">
          {/* STEP 1: WELCOME & DOMAIN */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">
                  Welcome to Formative
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Formative is an architectural workspace for visualizing software system components, wiring dependencies, and observing single-agent CEO orchestration.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Select Primary Engineering Architecture:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'web', title: 'Full-Stack Web Application', desc: 'React / Next.js client, REST/GraphQL APIs, databases, and caches.' },
                    { id: 'backend', title: 'Microservices & Distributed Backend', desc: 'API gateways, service meshes, message queues, and cloud workers.' },
                    { id: 'ai-system', title: 'AI Agent & Pipeline Architecture', desc: 'LLM agents, vector stores, prompt orchestrators, and tool bridges.' },
                    { id: 'general', title: 'General Software System', desc: 'Custom layered systems, mobile backends, and multi-tier architectures.' },
                  ].map((dom) => (
                    <div
                      key={dom.id}
                      onClick={() => setSelectedDomain(dom.id as ProjectType)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedDomain === dom.id
                          ? isDark
                            ? 'border-white bg-[#18181c] text-white ring-1 ring-white/50'
                            : 'border-black bg-zinc-100 text-black ring-1 ring-black/50'
                          : isDark
                          ? 'border-[#27272a] bg-[#121215] hover:border-zinc-700'
                          : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                      }`}
                    >
                      <h4 className="text-xs font-semibold">
                        {dom.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {dom.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROJECT CREATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">
                  How would you like to begin?
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Choose an intake mode for your architecture canvas.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={() => {
                    onScanDirectory();
                    handleFinish();
                  }}
                  className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
                    isDark ? 'bg-[#121215] border-[#27272a] hover:border-zinc-500' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'}`}>
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Open Existing Local Folder</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Select any repo folder on your computer. Formative scans packages and directory structures to generate an initial architecture map.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onLoadTemplate();
                    handleFinish();
                  }}
                  className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
                    isDark ? 'bg-[#121215] border-[#27272a] hover:border-zinc-500' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'}`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Load Recommended Blueprint</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Start with a pre-configured architecture template containing frontend, gateway, database, and cache nodes with clear relationships.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onCreateBlank('New System', selectedDomain);
                    handleFinish();
                  }}
                  className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
                    isDark ? 'bg-[#121215] border-[#27272a] hover:border-zinc-500' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'}`}>
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Create Blank Canvas</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Start completely fresh with an empty canvas and draft your components by hand.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AI AGENT SYSTEM */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">
                  Select AI Agent Provider
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Formative can stream tool calls, file edits, and execution transcripts live directly from disk.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {[
                  { id: 'claude-code', title: 'Claude Code', desc: 'Anthropic Claude Code CLI assistant transcripts' },
                  { id: 'antigravity', title: 'Antigravity / Gemini', desc: 'Google DeepMind Advanced Agentic Coding' },
                  { id: 'opencode', title: 'OpenCode / Codex', desc: 'Open-source local coding agent runs' },
                  { id: 'none', title: 'Configure Later', desc: 'Use Formative as a visual architecture tool only' },
                ].map((prov) => (
                  <div
                    key={prov.id}
                    onClick={() => setChosenProvider(prov.id as any)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      chosenProvider === prov.id
                        ? isDark
                          ? 'border-white bg-[#18181c] text-white ring-1 ring-white/50'
                          : 'border-black bg-zinc-100 text-black ring-1 ring-black/50'
                        : isDark
                        ? 'border-[#27272a] bg-[#121215] hover:border-zinc-700'
                        : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                    }`}
                  >
                    <h4 className="text-xs font-semibold">
                      {prov.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {prov.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: CONTROLS & TIPS */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">
                  Ready to Build
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Master the desktop workspace with these key shortcuts.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className={`p-3 rounded-lg border space-y-1.5 ${isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'}`}>
                  <span className="font-semibold text-zinc-400 uppercase text-xs tracking-wider block">
                    Navigation
                  </span>
                  <p className="text-xs text-zinc-300">
                    • <strong>Pan:</strong> Space + Drag, or click-and-drag empty canvas.
                  </p>
                  <p className="text-xs text-zinc-300">
                    • <strong>Zoom:</strong> Ctrl + Mouse Wheel, or trackpad pinch.
                  </p>
                </div>

                <div className={`p-3 rounded-lg border space-y-1.5 ${isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'}`}>
                  <span className="font-semibold text-zinc-400 uppercase text-xs tracking-wider block">
                    Organization & Layout
                  </span>
                  <p className="text-xs text-zinc-300">
                    • <strong>Tidy Layout:</strong> Automatically organizes overlapping nodes into a clean hierarchical tree.
                  </p>
                  <p className="text-xs text-zinc-300">
                    • <strong>Fit View:</strong> Centers canvas view to all components.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <div>
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  isDark ? 'border-[#27272a] bg-[#18181c] hover:bg-zinc-800 text-zinc-300' : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-xs text-zinc-500 font-mono">Welcome Guide</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Launch Formative Studio</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
