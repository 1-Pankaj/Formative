import React, { useState, useRef } from 'react';
import { 
  Crown, 
  Bot, 
  Globe, 
  Code, 
  Plus, 
  Minus, 
  Maximize2, 
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Terminal,
  Cpu
} from 'lucide-react';
import { ThemeMode } from '../types';

interface OrgChartViewProps {
  theme: ThemeMode;
  onOpenSkills?: () => void;
}

interface OrgMember {
  id: string;
  name: string;
  role: string;
  adapter: string;
  icon: React.ElementType;
  dotColor: string;
  iconBg: string;
  parentId?: string;
  x: number;
  y: number;
}

const ORG_MEMBERS: OrgMember[] = [
  // Level 0: CEO
  {
    id: 'ceo',
    name: 'CEO',
    role: 'CEO',
    adapter: 'Claude',
    icon: Crown,
    dotColor: '#eab308',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    x: 460,
    y: 40,
  },
  // Level 1: Executives & Specialists
  {
    id: 'cto',
    name: 'CTO',
    role: 'Chief Technology Officer',
    adapter: 'Claude',
    icon: Bot,
    dotColor: '#38bdf8',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    parentId: 'ceo',
    x: 180,
    y: 200,
  },
  {
    id: 'cmo',
    name: 'CMO',
    role: 'Chief Marketing Officer',
    adapter: 'Claude',
    icon: Globe,
    dotColor: '#38bdf8',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    parentId: 'ceo',
    x: 460,
    y: 200,
  },
  {
    id: 'lead-qa',
    name: 'QA & DevOps',
    role: 'Systems Reliability Lead',
    adapter: 'Claude',
    icon: Terminal,
    dotColor: '#eab308',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    parentId: 'ceo',
    x: 740,
    y: 200,
  },
  // Level 2: Engineering Agents
  {
    id: 'claude-coder',
    name: 'ClaudeCoder',
    role: 'Software Engineer',
    adapter: 'Claude',
    icon: Code,
    dotColor: '#eab308',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    parentId: 'cto',
    x: 80,
    y: 360,
  },
  {
    id: 'codex-coder',
    name: 'CodexCoder',
    role: 'Software Engineer (Codex)',
    adapter: 'Codex',
    icon: Code,
    dotColor: '#eab308',
    iconBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    parentId: 'cto',
    x: 280,
    y: 360,
  },
];

const CARD_W = 180;
const CARD_H = 76;

export const OrgChartView: React.FC<OrgChartViewProps> = ({ theme, onOpenSkills }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(ORG_MEMBERS[0]);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const isDark = theme !== 'light';

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const fitView = () => {
    setZoom(1);
    setPan({ x: 40, y: 30 });
  };

  return (
    <div className={`flex-1 h-full flex flex-col overflow-hidden relative select-none ${
      isDark ? 'bg-[#09090b] text-[#fafafa]' : 'bg-[#f8fafc] text-zinc-900'
    }`}>
      {/* View Header */}
      <div className={`h-12 border-b px-6 flex items-center justify-between z-10 shrink-0 ${
        isDark ? 'border-[#27272a] bg-[#09090b]' : 'border-zinc-200 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            ORG CHART
          </span>
          <span className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
            • 6 Agents Configured
          </span>
        </div>

        {onOpenSkills && (
          <button
            onClick={onOpenSkills}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              isDark 
                ? 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white' 
                : 'border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 shadow-xs'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage Skills & Roles</span>
          </button>
        )}
      </div>

      {/* Canvas Viewport */}
      <div
        className="flex-1 w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Top-Right Canvas Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
            className={`w-7 h-7 rounded border flex items-center justify-center text-xs transition-colors ${
              isDark ? 'border-[#27272a] bg-[#121215] hover:bg-[#1f1f23] text-white' : 'border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 shadow-xs'
            }`}
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className={`w-7 h-7 rounded border flex items-center justify-center text-xs transition-colors ${
              isDark ? 'border-[#27272a] bg-[#121215] hover:bg-[#1f1f23] text-white' : 'border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 shadow-xs'
            }`}
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={fitView}
            className={`w-7 h-7 rounded border flex items-center justify-center text-xs transition-colors ${
              isDark ? 'border-[#27272a] bg-[#121215] hover:bg-[#1f1f23] text-white' : 'border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 shadow-xs'
            }`}
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scalable Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          className="absolute inset-0 pointer-events-auto"
        >
          {/* SVG Tree Connectors */}
          <svg className="absolute inset-0 pointer-events-none w-[1600px] h-[1000px]">
            {ORG_MEMBERS.filter((m) => m.parentId).map((m) => {
              const parent = ORG_MEMBERS.find((p) => p.id === m.parentId);
              if (!parent) return null;

              const startX = parent.x + CARD_W / 2;
              const startY = parent.y + CARD_H;
              const endX = m.x + CARD_W / 2;
              const endY = m.y;
              const midY = (startY + endY) / 2;

              // Orthogonal step line (Paperclip signature)
              const d = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;

              return (
                <path
                  key={`${parent.id}-${m.id}`}
                  d={d}
                  fill="none"
                  stroke={isDark ? '#27272a' : '#cbd5e1'}
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>

          {/* Org Members Cards */}
          {ORG_MEMBERS.map((member) => {
            const Icon = member.icon;
            const isSelected = selectedMember?.id === member.id;

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                style={{
                  position: 'absolute',
                  left: member.x,
                  top: member.y,
                  width: CARD_W,
                  height: CARD_H,
                }}
                className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer shadow-sm select-none ${
                  isSelected
                    ? isDark
                      ? 'ring-2 ring-white border-white bg-[#18181c]'
                      : 'ring-2 ring-zinc-900 border-zinc-900 bg-zinc-100'
                    : isDark 
                      ? 'border-[#27272a] bg-[#121215] hover:border-zinc-500' 
                      : 'border-zinc-200 bg-white hover:border-zinc-400 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 h-full">
                  {/* Avatar + Status Dot */}
                  <div className="relative shrink-0">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${member.iconBg}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                        isDark ? 'border-[#121215]' : 'border-white'
                      }`}
                      style={{ backgroundColor: member.dotColor }}
                    />
                  </div>

                  {/* Name + Role + Model */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-semibold leading-tight truncate ${
                      isDark ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      {member.name}
                    </h4>
                    <p className={`text-[10px] leading-tight truncate mt-0.5 ${
                      isDark ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      {member.role}
                    </p>
                    <span className="text-[9px] font-mono text-zinc-500 leading-tight block mt-1">
                      {member.adapter}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
