import React from 'react';
import { Timeline } from './ui/timeline';

// Assets
import canvasScreen from '@/assets/formative-canvas-screen.png';
import officeScreen from '@/assets/formative-office-screen.png';
import chatScreen from '@/assets/formative-chat-screen.png';
import officeRex from '@/assets/office-rex.png';
import agentOtto from '@/assets/agent-otto.png';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Open Any Repository',
      description: 'Point Formative to any project folder on your computer. No accounts, no setup scripts, no cloud logins.',
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs text-white/50 font-mono">
            <span>Input: Local File System Directory</span>
            <span>Zero-Execution Parse</span>
          </div>
          <p className="text-sm font-light text-white/70 leading-relaxed">
            Formative immediately analyzes your code using high-speed static syntax parsing. It works out of the box with TypeScript, JavaScript, Vue SFC, Svelte, Astro, Python, Go, and Rust. Because it parses syntax without running your code, your machine is never exposed to untrusted scripts.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center text-xs text-white/80">
              TypeScript / JS
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center text-xs text-white/80">
              Python & FastAPI
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center text-xs text-white/80">
              Go & Rust
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center text-xs text-white/80">
              Vue, Svelte, Astro
            </div>
          </div>
        </div>
      ),
    },
    {
      step: '02',
      title: 'Visual Architecture Map',
      description: 'Formative automatically connects your pages, endpoints, models, and imports into a live visual diagram.',
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs text-white/50 font-mono">
            <span>Canvas: Real-Time Living Graph</span>
            <span>Zoomable & Interactive</span>
          </div>
          <p className="text-sm font-light text-white/70 leading-relaxed">
            Instead of holding a mental model of hundreds of files, you get a clean living map. Click any endpoint to see which frontend button calls it and which database table it modifies. As you save files in your editor, Formative updates the diagram automatically.
          </p>
          <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-lg max-h-56">
            <img src={canvasScreen} alt="Living Architecture Diagram" className="w-full h-full object-cover object-top" />
          </div>
        </div>
      ),
    },
    {
      step: '03',
      title: 'Interactive 3D Office Stage',
      description: 'Your project teammates stand at their desks on a spatial floor rendered with Three.js.',
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs text-white/50 font-mono">
            <span>Environment: 3D Spatial Floor</span>
            <span>Bundled SmolLM2 Model</span>
          </div>
          <p className="text-sm font-light text-white/70 leading-relaxed">
            Formative brings architecture and AI coordination into a tangible spatial environment. Up to 23 customizable specialist characters represent your active project workflows. Walk up to any coworker to ask questions about your code, review tasks, or discuss project architecture.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <img src={officeRex} alt="Rex" className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div className="text-white text-xs font-medium">Rex (Executive)</div>
                <div className="text-white/40 text-[11px]">Task coordination & planning</div>
              </div>
            </div>
            <div className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <img src={agentOtto} alt="Otto" className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div className="text-white text-xs font-medium">Otto (Product Designer)</div>
                <div className="text-white/40 text-[11px]">UI layout & component flows</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: '04',
      title: 'Supervised Agent CLI Execution',
      description: 'Run Claude Code and Codex CLI commands with complete supervision and strict safety gates.',
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs text-white/50 font-mono">
            <span>Execution: Supervised Sandboxing</span>
            <span>User Confirmation First</span>
          </div>
          <p className="text-sm font-light text-white/70 leading-relaxed">
            When an agent runs searches or drafts code refactors, Formative displays the proposed diffs in a clear visual inspector. You approve each change before any file is saved. Your code stays 100% under your control.
          </p>
          <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-lg max-h-56">
            <img src={chatScreen} alt="Supervised Agent Chat & Execution" className="w-full h-full object-cover object-top" />
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-white/70">Read-Only Safe Mode Enabled</span>
            <span className="text-white font-medium">Zero Unattended Edits</span>
          </div>
        </div>
      ),
    },
  ];

  return <Timeline data={steps} />;
};
