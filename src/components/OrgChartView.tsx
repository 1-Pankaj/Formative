import React from 'react';
import { Bot, FileText } from 'lucide-react';
import { ThemeMode } from '../types';

interface OrgChartViewProps {
  theme: ThemeMode;
  onOpenSessionActivity?: () => void;
}

export const OrgChartView: React.FC<OrgChartViewProps> = ({ theme, onOpenSessionActivity }) => {
  const isDark = theme !== 'light';

  return (
    <div className={`flex-1 h-full overflow-y-auto flex items-center justify-center p-6 ${
      isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f8fafc] text-zinc-900'
    }`}>
      <section className={`w-full max-w-xl rounded-xl border p-7 text-center space-y-4 ${
        isDark ? 'bg-[#121215] border-[#27272a]' : 'bg-white border-zinc-200'
      }`}>
        <div className={`w-12 h-12 mx-auto rounded-xl border flex items-center justify-center ${
          isDark ? 'bg-zinc-800/70 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
        }`}>
          <Bot className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold">Agent teams are not connected yet</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Formative does not start agent runs or coordinate a team of agents yet, so there is no real org chart to show for this project.
          </p>
        </div>
        <div className={`rounded-lg border p-4 text-left ${
          isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <p className="text-xs text-zinc-400 leading-relaxed">
            You can inspect an existing JSON or JSONL transcript in Session Activity. That only reads a saved file; it does not connect to, start, or control its agent.
          </p>
        </div>
        {onOpenSessionActivity && (
          <button
            type="button"
            onClick={onOpenSessionActivity}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Inspect a transcript</span>
          </button>
        )}
      </section>
    </div>
  );
};
