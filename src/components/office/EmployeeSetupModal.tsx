import React from 'react';
import { X, Check, Crown, Layers, Cpu, Terminal, Database, Sliders } from 'lucide-react';
import { SPECIALIST_REGISTRY } from './officeCast';
import { SkillDepartment, ThemeMode } from '../../types';

interface EmployeeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSkills: SkillDepartment[];
  onToggleSkill: (skill: SkillDepartment) => void;
  theme: ThemeMode;
}

const SKILL_DEPARTMENTS: {
  id: SkillDepartment;
  title: string;
  employeeName: string;
  deskName: string;
  icon: any;
  color: string;
  description: string;
  abilities: string[];
}[] = [
  {
    id: 'frontend',
    title: 'Frontend & UI/UX Specialist',
    employeeName: SPECIALIST_REGISTRY.frontend.name,
    deskName: 'Desk 1 (East Wing)',
    icon: Layers,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    description: 'Directs user interface creation, CSS styling, components, design system tokens, and layouts.',
    abilities: ['Tailwind CSS', 'React UI', 'Design Systems', 'Component Polish']
  },
  {
    id: 'backend',
    title: 'Systems & Backend Specialist',
    employeeName: SPECIALIST_REGISTRY.backend.name,
    deskName: 'Desk 2 (East Wing)',
    icon: Cpu,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Implements core services, API routes, file system I/O, server architecture, and async tasks.',
    abilities: ['REST & APIs', 'Node / Python', 'File I/O', 'WebSockets']
  },
  {
    id: 'qa',
    title: 'QA, Test & DevOps Lead',
    employeeName: SPECIALIST_REGISTRY.qa.name,
    deskName: 'Desk 3 (East Wing)',
    icon: Terminal,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'Executes terminal commands, test suites, builds, linting, and diagnostic verification.',
    abilities: ['Test Execution', 'Terminal Shell', 'Build Verification', 'Linting Checks']
  },
  {
    id: 'database',
    title: 'Data & Schema Architect',
    employeeName: SPECIALIST_REGISTRY.database.name,
    deskName: 'Desk 4 (East Wing)',
    icon: Database,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Designs schemas, SQL migrations, state persistence, caching, and database queries.',
    abilities: ['PostgreSQL / SQL', 'ORM & Schemas', 'Redis Caching', 'State Persistence']
  }
];

export const EmployeeSetupModal: React.FC<EmployeeSetupModalProps> = ({
  isOpen,
  onClose,
  activeSkills,
  onToggleSkill,
  theme
}) => {
  if (!isOpen) return null;

  const isDark = theme !== 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className={`w-full max-w-2xl rounded-xl border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${
        isDark ? 'bg-[#09090b] border-[#27272a] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-zinc-200 text-black'
            }`}>
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                Operations Floor: Skill Departments
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                The Chief Executive Agent orchestrates alone by default. Enable modular skills to spawn desks for this project.
              </p>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Chief Executive Section (Static Leader) */}
          <div className={`p-4 rounded-xl border flex items-start justify-between ${
            isDark ? 'bg-[#121215] border-[#27272a]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">Chief Executive Agent</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/30 font-medium">
                    Lead Orchestrator
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Corner Executive Suite. Coordinates user prompts, routes tasks, and runs project operations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <Check className="w-3.5 h-3.5" />
              <span>Always Active</span>
            </div>
          </div>

          {/* Section Divider */}
          <div className="pt-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
              Modular Skills ({activeSkills.length} of 4 Active)
            </span>
          </div>

          {/* Modular Skills List */}
          <div className="space-y-2.5">
            {SKILL_DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              const isActive = activeSkills.includes(dept.id);
              return (
                <div
                  key={dept.id}
                  onClick={() => onToggleSkill(dept.id)}
                  className={`p-4 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-[#18181c] border-white/80 ring-1 ring-white/40'
                        : 'bg-zinc-100 border-black ring-1 ring-black/40'
                      : isDark
                      ? 'bg-[#121215] border-[#27272a] hover:border-zinc-700'
                      : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${dept.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">
                          {dept.title}
                        </h4>
                        <span className="text-xs text-zinc-500">
                          ({dept.employeeName})
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {dept.description}
                      </p>

                      {/* Capabilities Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {dept.abilities.map((ab) => (
                          <span
                            key={ab}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
                            }`}
                          >
                            {ab}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Checkbox */}
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                    isActive
                      ? 'bg-white text-black border-white'
                      : isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-white'
                  }`}>
                    {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <span className="text-xs text-zinc-500">
            Saved automatically to this workspace.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
