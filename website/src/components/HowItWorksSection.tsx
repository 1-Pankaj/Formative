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
      title: 'Choose a project',
      description: 'Create a blank workspace, open a local folder, or use a clearly labeled starter example.',
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs text-white/50 font-mono">
            <span>Folder access: selected by you</span>
            <span>Local, bounded scan</span>
          </div>
          <p className="text-sm font-light text-white/70 leading-relaxed">
            The Project structure view samples folder names and selected configuration files. The separate Architecture map reads a bounded set of source files. Neither scan executes project code or installs dependencies.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center text-xs text-white/80">
              Project structure
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center text-xs text-white/80">
              Editable canvas
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center text-xs text-white/80">
              Read-only map
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center text-xs text-white/80">
              User-authored links
            </div>
          </div>
        </div>
      ),
    },
    {
      step: '02',
      title: 'Keep two kinds of map separate',
      description: 'The editable canvas is yours to maintain. The Architecture map is a read-only view of source evidence and clearly marked inferences.',
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs text-white/50 font-mono">
            <span>Architecture map: static scan</span>
            <span>Evidence and inferences</span>
          </div>
          <p className="text-sm font-light text-white/70 leading-relaxed">
            Import links can be observed in source. Some API and schema links are inferred, and unsupported conventions may be missing. Refresh the map to scan again; it does not update on every file save.
          </p>
          <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-lg max-h-56">
            <img src={canvasScreen} alt="Formative project canvas example" className="w-full h-full object-cover object-top" />
          </div>
        </div>
      ),
    },
    {
      step: '03',
      title: 'Follow supported work in the office',
      description: 'The optional 3D office reflects project records and supported live CLI activity.',
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs text-white/50 font-mono">
            <span>Office: project-scoped view</span>
            <span>Optional local chat model</span>
          </div>
          <p className="text-sm font-light text-white/70 leading-relaxed">
            The project coordinator is present by default; specialist employees appear when enabled. Their role and task assignments do not mean an agent is running. The office chat uses a user-selected local GGUF model and may give inaccurate answers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <img src={officeRex} alt="Rex" className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div className="text-white text-xs font-medium">Rex (Executive)</div>
                <div className="text-white/40 text-[11px]">Project coordinator</div>
              </div>
            </div>
            <div className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <img src={agentOtto} alt="Otto" className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div className="text-white text-xs font-medium">Otto (Product Designer)</div>
                <div className="text-white/40 text-[11px]">Example employee</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: '04',
      title: 'Start a read-only CLI run',
      description: 'Formative starts supported Codex CLI and Claude Code CLI sessions with read-only settings.',
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs text-white/50 font-mono">
            <span>Mode: read-only</span>
            <span>Provider service used</span>
          </div>
          <p className="text-sm font-light text-white/70 leading-relaxed">
            Formative displays the provider events it receives. These runs do not let the agent save project edits through this workflow. Your prompt and selected context may be sent to the provider and may incur provider charges.
          </p>
          <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-lg max-h-56">
            <img src={chatScreen} alt="Formative Agent Chat example" className="w-full h-full object-cover object-top" />
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-white/70">Read-only provider run</span>
            <span className="text-white font-medium">Codex CLI · Claude Code CLI</span>
          </div>
        </div>
      ),
    },
  ];

  return <Timeline data={steps} />;
};
