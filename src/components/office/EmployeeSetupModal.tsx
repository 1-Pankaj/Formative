import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AgentProviderId } from '../../types/agentRuns';
import { OfficeDepartment, OfficeHairStyle, OfficeMemberProfile, ProjectOfficeTeam, ThemeMode } from '../../types';
import {
  CHARACTER_ARCHETYPES,
  createOfficeMemberProfile,
  DEFAULT_CEO_PROFILE,
  MAX_OFFICE_EMPLOYEES,
  OFFICE_DEPARTMENTS,
  PALETTES,
  safeUUID,
  getProjectOfficeTeam,
} from './officeCast';
import { useOfficeModalAccessibility } from './useOfficeModalAccessibility';
import {
  Activity,
  Brain,
  Building2,
  Check,
  Code,
  Database,
  FileText,
  LayoutGrid,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Sliders,
  Smartphone,
  Trash2,
  User,
  X,
  Layers,
} from '../ui/FormativeGlyphs';

interface EmployeeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: ProjectOfficeTeam;
  theme: ThemeMode;
  onSave: (team: ProjectOfficeTeam) => Promise<boolean>;
  drawProfilePortrait: (profile: OfficeMemberProfile, targetCanvas: HTMLCanvasElement) => void;
}

const DEPARTMENT_META: Record<OfficeDepartment, { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }> = {
  frontend: { label: 'Frontend', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: LayoutGrid },
  backend: { label: 'Backend', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: Code },
  mobile: { label: 'Mobile', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: Smartphone },
  qa: { label: 'QA & Test', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: ShieldCheck },
  database: { label: 'Data & DB', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: Database },
  devops: { label: 'DevOps & Cloud', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: Server },
  design: { label: 'Design & UI', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: LayoutGrid },
  security: { label: 'Security', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: Shield },
  ai: { label: 'AI & ML', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: Brain },
  docs: { label: 'Docs', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: FileText },
  analytics: { label: 'Performance', badgeClass: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]', icon: Activity },
  general: { label: 'General', badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: Layers },
};

const DEPARTMENT_SKILL_SUGGESTIONS: Record<OfficeDepartment, string[]> = {
  frontend: ['Tailwind CSS', 'React Components', 'UI/UX Polish', 'Motion & Animation', 'Accessibility', 'Next.js', 'Figma'],
  backend: ['Node.js', 'Python', 'REST APIs', 'WebSockets', 'Microservices', 'GraphQL', 'System Architecture'],
  mobile: ['React Native', 'Expo SDK', 'Android Gradle', 'iOS Swift', 'Gesture Animations', 'Mobile State'],
  qa: ['E2E Testing', 'Unit Tests', 'CI/CD Builds', 'Static Analysis', 'Regression Checks', 'Playwright'],
  database: ['PostgreSQL', 'SQL Schemas', 'Redis Caching', 'Vector Embeddings', 'Prisma ORM', 'Migrations'],
  devops: ['Docker & K8s', 'AWS Cloud', 'Cloudflare', 'Terraform', 'Secrets Vault', 'CI/CD Pipelines'],
  design: ['Design Systems', 'Figma Tokens', 'Micro-interactions', 'Typography', 'Iconography', 'User Research'],
  security: ['Auth & RBAC', 'OWASP Hardening', 'Audit Logging', 'Pen-Testing', 'Data Sanitization'],
  ai: ['Prompt Engineering', 'LangChain', 'RAG Pipelines', 'Vector Indexing', 'DSPy Optimization', 'LLM Evaluations'],
  docs: ['API Documentation', 'Architectural Specs', 'User Guides', 'Markdown / MDX', 'Release Notes'],
  analytics: ['V8 Performance', 'Memory Optimization', 'Core Web Vitals', 'Network Telemetry', 'Latency Profiling'],
  general: ['Task Execution', 'Code Review', 'Full-Stack Integration', 'Troubleshooting']
};

const HAIR_STYLE_OPTIONS: Array<{ value: OfficeHairStyle; label: string }> = [
  { value: 'short', label: 'Short' },
  { value: 'curly', label: 'Curly' },
  { value: 'bald', label: 'Bald' },
  { value: 'buzz', label: 'Buzzcut' },
  { value: 'ponytail', label: 'Ponytail' },
  { value: 'messy', label: 'Messy' },
  { value: 'long', label: 'Long' },
  { value: 'bun', label: 'Top Bun' },
  { value: 'cap', label: 'Cap' },
];

const PROVIDER_OPTIONS: Array<{ id: AgentProviderId | ''; label: string }> = [
  { id: '', label: 'Default / Project Local' },
  { id: 'codex-cli', label: 'Codex' },
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'opencode', label: 'OpenCode' },
  { id: 'antigravity', label: 'Antigravity' },
  { id: 'openclaw', label: 'OpenClaw' },
  { id: 'ollama', label: 'Ollama' },
  { id: 'kiro', label: 'Kiro' },
  { id: 'api', label: 'Direct API' },
  { id: 'mcp', label: 'MCP Service' },
];

/** The preview uses the office engine's own sprite renderer for a true match. */
const PixelAvatarPreview: React.FC<{
  profile: OfficeMemberProfile;
  drawProfilePortrait: (profile: OfficeMemberProfile, targetCanvas: HTMLCanvasElement) => void;
}> = ({ profile, drawProfilePortrait }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawProfilePortrait(profile, canvas);
  }, [profile, drawProfilePortrait]);

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={96}
      role="img"
      aria-label={`${profile.name} character appearance`}
      className="h-full w-full select-none object-contain [image-rendering:pixelated]"
    />
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onClose: () => void;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class OfficeModalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('OfficeModalErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-5 max-w-md">
            <h3 className="text-sm font-bold text-rose-400 mb-1">Team Setup Encountered an Issue</h3>
            <p className="text-xs text-zinc-400 mb-4">
              {this.state.error?.message || 'A team profile format error prevented the modal from rendering.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onReset();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                Reset to Default Roster
              </button>
              <button
                type="button"
                onClick={this.props.onClose}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function sanitizeTeam(team?: Partial<ProjectOfficeTeam> | null): ProjectOfficeTeam {
  const safe = getProjectOfficeTeam(team as any);
  return {
    ceo: {
      ...safe.ceo,
      skills: Array.isArray(safe.ceo.skills) ? [...safe.ceo.skills] : [...DEFAULT_CEO_PROFILE.skills],
      appearance: { ...DEFAULT_CEO_PROFILE.appearance, ...(safe.ceo.appearance || {}) },
    },
    employees: Array.isArray(safe.employees)
      ? safe.employees.map((emp, i) => {
          const dept = (emp.department && OFFICE_DEPARTMENTS.includes(emp.department)) ? emp.department : 'general';
          const fallback = createOfficeMemberProfile(dept, emp.id || `emp-${i + 1}`);
          return {
            ...fallback,
            ...emp,
            id: emp.id || fallback.id,
            name: emp.name || fallback.name,
            roleTitle: emp.roleTitle || fallback.roleTitle,
            department: dept,
            enabled: emp.enabled !== false,
            skills: Array.isArray(emp.skills) ? [...emp.skills] : [...fallback.skills],
            appearance: { ...fallback.appearance, ...(emp.appearance || {}) },
          };
        })
      : [],
  };
}

export const EmployeeSetupModal: React.FC<EmployeeSetupModalProps> = ({ isOpen, onClose, team, theme, onSave, drawProfilePortrait }) => {
  const isDark = theme !== 'light';
  const initialCleanTeam = useMemo(() => sanitizeTeam(team), [team]);
  const [draft, setDraft] = useState<ProjectOfficeTeam>(() => initialCleanTeam);
  const [selectedId, setSelectedId] = useState<string>(() => initialCleanTeam.ceo.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'identity' | 'appearance' | 'presence'>('identity');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useOfficeModalAccessibility(isOpen, dialogRef, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const clean = sanitizeTeam(team);
    setDraft(clean);
    setSelectedId(clean.ceo.id);
    setError(null);
    setSaving(false);
    setIsAddMenuOpen(false);
  }, [isOpen, team]);

  const hasChanges = useMemo(() => JSON.stringify(team) !== JSON.stringify(draft), [team, draft]);

  // Selected Profile (guaranteed non-null)
  const selectedProfile: OfficeMemberProfile = useMemo(() => {
    if (!draft || !draft.ceo) return initialCleanTeam.ceo;
    if (selectedId === draft.ceo.id) return draft.ceo;
    const found = draft.employees?.find((e) => e.id === selectedId);
    return found || draft.ceo;
  }, [selectedId, draft, initialCleanTeam.ceo]);

  const isSelectedCeo = selectedProfile.id === draft.ceo?.id;

  const currentSkills = Array.isArray(selectedProfile.skills) ? selectedProfile.skills : [];
  const currentAppearance = selectedProfile.appearance || DEFAULT_CEO_PROFILE.appearance;
  const currentDept = selectedProfile.department || 'general';
  const currentDeptMeta = DEPARTMENT_META[currentDept] || DEPARTMENT_META.general;

  // Mutators
  const updateCurrentProfile = (patch: Partial<OfficeMemberProfile>) => {
    if (isSelectedCeo) {
      setDraft((curr) => ({ ...curr, ceo: { ...curr.ceo, ...patch } }));
    } else {
      setDraft((curr) => ({
        ...curr,
        employees: curr.employees.map((emp) => (emp.id === selectedProfile.id ? { ...emp, ...patch } : emp)),
      }));
    }
  };

  const updateCurrentAppearance = (patch: Partial<OfficeMemberProfile['appearance']>) => {
    updateCurrentProfile({
      appearance: { ...currentAppearance, ...patch },
    });
  };

  const addSkill = (newSkill: string) => {
    const trimmed = newSkill.trim().replace(/\s+/g, ' ').slice(0, 80);
    if (!trimmed) return;
    if (currentSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    updateCurrentProfile({ skills: [...currentSkills, trimmed] });
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    updateCurrentProfile({
      skills: currentSkills.filter((s) => s !== skillToRemove),
    });
  };

  const handleAddArchetype = (archetypeId: string) => {
    if (draft.employees.length >= MAX_OFFICE_EMPLOYEES) {
      setError(`Office capacity reached (maximum ${MAX_OFFICE_EMPLOYEES} teammates).`);
      return;
    }
    const template = CHARACTER_ARCHETYPES.find((a) => a.id === archetypeId)?.profile || createOfficeMemberProfile('general');
    const newMember: OfficeMemberProfile = {
      ...template,
      id: `office-member-${safeUUID()}`,
      enabled: true,
      skills: [...template.skills],
      appearance: { ...template.appearance },
    };
    setDraft((curr) => ({
      ...curr,
      employees: [...curr.employees, newMember],
    }));
    setSelectedId(newMember.id);
    setIsAddMenuOpen(false);
    setError(null);
  };

  const handleRemoveEmployee = (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from this project's office team?`)) return;
    setDraft((curr) => ({
      ...curr,
      employees: curr.employees.filter((emp) => emp.id !== id),
    }));
    if (selectedId === id) {
      setSelectedId(draft.ceo.id);
    }
  };

  const handleRandomize = () => {
    const randomLook = {
      skin: PALETTES.skin[Math.floor(Math.random() * PALETTES.skin.length)].hex,
      hair: PALETTES.hair[Math.floor(Math.random() * PALETTES.hair.length)].hex,
      shirt: PALETTES.shirt[Math.floor(Math.random() * PALETTES.shirt.length)].hex,
      pants: PALETTES.pants[Math.floor(Math.random() * PALETTES.pants.length)].hex,
      hairStyle: HAIR_STYLE_OPTIONS[Math.floor(Math.random() * HAIR_STYLE_OPTIONS.length)].value,
      glasses: Math.random() < 0.35,
      headset: Math.random() < 0.3,
      suit: Math.random() < 0.25,
      tie: PALETTES.tie[Math.floor(Math.random() * PALETTES.tie.length)].hex,
      cap: PALETTES.shirt[Math.floor(Math.random() * PALETTES.shirt.length)].hex,
    };
    updateCurrentAppearance(randomLook);
  };

  const handleResetToDefault = () => {
    if (isSelectedCeo) {
      updateCurrentProfile({
        name: DEFAULT_CEO_PROFILE.name,
        roleTitle: DEFAULT_CEO_PROFILE.roleTitle,
        skills: [...DEFAULT_CEO_PROFILE.skills],
        appearance: { ...DEFAULT_CEO_PROFILE.appearance },
      });
    } else {
      const defaultArchetype = CHARACTER_ARCHETYPES.find((a) => a.id === selectedProfile.department)?.profile;
      if (defaultArchetype) {
        updateCurrentProfile({
          name: defaultArchetype.name,
          roleTitle: defaultArchetype.roleTitle,
          skills: [...defaultArchetype.skills],
          appearance: { ...defaultArchetype.appearance },
        });
      }
    }
  };

  const handleHardResetAll = () => {
    const defaultTeam = getProjectOfficeTeam(null);
    setDraft(defaultTeam);
    setSelectedId(defaultTeam.ceo.id);
    setError(null);
  };

  const save = async () => {
    if (saving || !hasChanges) return;
    if ([draft.ceo, ...draft.employees].some((profile) => !profile.name.trim() || !profile.roleTitle.trim())) {
      setError('Every teammate requires a valid Name and Role title.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await onSave(draft);
      if (saved) onClose();
      else setError('Formative could not save the team. Please try again.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save office team.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered roster list
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return draft.employees;
    const q = searchQuery.toLowerCase();
    return draft.employees.filter(
      (e) => (e.name || '').toLowerCase().includes(q) || (e.roleTitle || '').toLowerCase().includes(q) || (e.department || '').toLowerCase().includes(q)
    );
  }, [draft.employees, searchQuery]);

  const activeInOfficeCount = draft.employees.filter((e) => e.enabled).length + 1; // +1 for CEO

  if (!isOpen) return null;

  // Styling helpers
  const bgMain = isDark ? 'bg-[#0c0d11] text-zinc-100' : 'bg-white text-zinc-900';
  const bgSidebar = isDark ? 'bg-[#121318] border-[#22232a]' : 'bg-zinc-50 border-zinc-200';
  const borderCol = isDark ? 'border-[#22232a]' : 'border-zinc-200';
  const cardBg = isDark ? 'bg-[#16171e]' : 'bg-white';
  const inputBg = isDark ? 'bg-[#191a22] border-[#2d2e38] text-zinc-100 focus:border-zinc-400' : 'bg-white border-zinc-300 text-zinc-900 focus:border-zinc-700';
  const subtleText = isDark ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="office-team-modal-title"
        className={`flex h-[88vh] max-h-[820px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-2xl outline-none ${bgMain} ${borderCol}`}
      >
        <OfficeModalErrorBoundary onClose={onClose} onReset={handleHardResetAll}>
          {/* Modal Top Header */}
          <header className={`flex shrink-0 items-center justify-between border-b px-6 py-4 ${bgSidebar}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 id="office-team-modal-title" className="text-base font-bold tracking-tight">Team Setup & Office Roster</h2>
                  <span className={`text-[11px] font-medium ${subtleText}`}>{activeInOfficeCount} in office</span>
                </div>
                <p className={`text-xs mt-0.5 ${subtleText}`}>
                  Choose who appears in this project’s office and adjust each teammate’s details.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close team setup"
              className={`rounded-lg p-1.5 transition-colors ${isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-zinc-500 hover:bg-zinc-200 hover:text-black'}`}
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Modal Body - 2 Columns */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* LEFT COLUMN: Roster Deck (320px) */}
            <aside className={`flex w-72 sm:w-80 shrink-0 flex-col border-r overflow-hidden ${bgSidebar}`}>
              {/* Search and Add Action Bar */}
              <div className={`p-3 border-b space-y-2.5 ${borderCol}`}>
                <div className="relative">
                  <Search className={`absolute left-2.5 top-2.5 h-3.5 w-3.5 ${subtleText}`} />
                  <input
                    type="text"
                    placeholder="Search teammates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`h-8 w-full rounded-lg border pl-8 pr-3 text-xs outline-none ${inputBg}`}
                  />
                </div>

                {/* Add Teammate Menu Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                    disabled={draft.employees.length >= MAX_OFFICE_EMPLOYEES}
                    className={`flex h-8 w-full items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Teammate</span>
                  </button>

                  {/* Archetype Quick Selection Popover */}
                  {isAddMenuOpen && (
                    <div className={`absolute left-0 top-10 z-30 w-72 rounded-xl border p-2 shadow-2xl ${isDark ? 'bg-[#181922] border-zinc-700 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-900'}`}>
                      <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Choose Specialist Role
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {CHARACTER_ARCHETYPES.map((arch) => (
                          <button
                            key={arch.id}
                            type="button"
                            onClick={() => handleAddArchetype(arch.id)}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                              isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-bold block truncate">{arch.profile.name}</span>
                              <span className="text-[10px] text-zinc-400 block truncate">{arch.profile.roleTitle}</span>
                            </div>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${DEPARTMENT_META[arch.profile.department]?.badgeClass || ''}`}>
                              {DEPARTMENT_META[arch.profile.department]?.label || arch.profile.department}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Teammates List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {/* Pinned Coordinator Card */}
                <div
                  onClick={() => setSelectedId(draft.ceo.id)}
                  className={`group cursor-pointer rounded-xl border p-3 transition-all relative ${
                      selectedId === draft.ceo.id
                      ? isDark
                        ? 'border-white/30 bg-white/[0.05]'
                        : 'border-zinc-500 bg-zinc-100'
                      : isDark
                      ? 'border-zinc-800 hover:border-zinc-700 bg-[#16171f]'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className={`h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center border ${isDark ? 'bg-black/20 border-white/10' : 'bg-zinc-100 border-zinc-200'}`}>
                        <PixelAvatarPreview profile={draft.ceo} drawProfilePortrait={drawProfilePortrait} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-bold">{draft.ceo.name}</span>
                        <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Coordinator
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${subtleText}`}>{draft.ceo.roleTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Employees List */}
                <div className="pt-2">
                  <div className={`px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider ${subtleText}`}>
                    Specialist Teammates ({draft.employees.length})
                  </div>

                  {draft.employees.length === 0 ? (
                    <div className={`rounded-xl border border-dashed p-4 text-center text-xs ${borderCol} ${subtleText}`}>
                      No employees added. Use <span className="font-medium text-zinc-200">Add Teammate</span> to build your office roster.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredEmployees.map((emp) => {
                        const isSelected = selectedId === emp.id;
                        const dept = (emp.department && OFFICE_DEPARTMENTS.includes(emp.department)) ? emp.department : 'general';
                        const deptMeta = DEPARTMENT_META[dept] || DEPARTMENT_META.general;

                        return (
                          <div
                            key={emp.id}
                            onClick={() => setSelectedId(emp.id)}
                            className={`group cursor-pointer rounded-xl border p-2.5 transition-all relative ${
                              isSelected
                                ? isDark
                                  ? 'border-white/30 bg-white/[0.05]'
                                  : 'border-zinc-500 bg-zinc-100'
                                : isDark
                                ? 'border-[#22232a] hover:border-zinc-700 bg-[#16171f]'
                                : 'border-zinc-200 hover:border-zinc-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Avatar swatch */}
                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                                <PixelAvatarPreview profile={emp} drawProfilePortrait={drawProfilePortrait} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="truncate text-xs font-bold">{emp.name || 'Unnamed'}</span>
                                  <span className={`shrink-0 text-[10px] ${subtleText}`}>{emp.enabled ? 'In office' : 'Away'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`text-[8px] font-extrabold uppercase px-1 py-0.2 rounded border ${deptMeta.badgeClass}`}>
                                    {deptMeta.label}
                                  </span>
                                  <span className={`text-[10px] truncate ${subtleText}`}>{emp.roleTitle}</span>
                                </div>
                              </div>

                              {/* Quick Delete */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveEmployee(emp.id, emp.name);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                                title="Remove teammate"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* RIGHT COLUMN: Teammate Studio & Live Customizer */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              {/* Live Teammate Preview Strip */}
              <div className={`p-5 border-b flex flex-wrap items-center justify-between gap-4 ${isDark ? 'bg-[#14151c]' : 'bg-zinc-50/60'} ${borderCol}`}>
                <div className="flex items-center gap-4 min-w-0">
                  {/* 2D Pixel Avatar Preview */}
                  <div className={`h-20 w-20 rounded-2xl border flex items-center justify-center p-2 shadow-inner shrink-0 ${isDark ? 'bg-[#0a0a0d] border-zinc-800' : 'bg-white border-zinc-200'}`}>
                    <PixelAvatarPreview profile={selectedProfile} drawProfilePortrait={drawProfilePortrait} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold truncate">{selectedProfile.name}</h3>
                      {isSelectedCeo ? (
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Project Coordinator
                        </span>
                      ) : (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${currentDeptMeta.badgeClass}`}>
                          {currentDeptMeta.label}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${subtleText}`}>{selectedProfile.roleTitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[11px] font-medium ${subtleText}`}>
                        {selectedProfile.enabled ? 'In office' : 'Away'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Randomize & Reset */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      isDark ? 'border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200' : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700'
                    }`}
                    title="Randomize style palette"
                  >
                    <span>Randomize Look</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Studio Navigation Tabs */}
              <div className={`flex border-b px-6 gap-6 ${borderCol}`}>
                <button
                  type="button"
                  onClick={() => setActiveTab('identity')}
                  className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'identity'
                      ? 'border-white text-white'
                      : `border-transparent ${subtleText} hover:text-zinc-200`
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Identity & Skills</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('appearance')}
                  className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'appearance'
                      ? 'border-white text-white'
                      : `border-transparent ${subtleText} hover:text-zinc-200`
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Visual Style & Wardrobe</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('presence')}
                  className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'presence'
                      ? 'border-white text-white'
                      : `border-transparent ${subtleText} hover:text-zinc-200`
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Office Floor Presence</span>
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="p-6 space-y-6">
                {/* TAB 1: IDENTITY & SKILLS */}
                {activeTab === 'identity' && (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${subtleText}`}>Full Name</label>
                        <input
                          type="text"
                          value={selectedProfile.name}
                          maxLength={80}
                          onChange={(e) => updateCurrentProfile({ name: e.target.value })}
                          className={`h-9 w-full rounded-lg border px-3 text-sm outline-none ${inputBg}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${subtleText}`}>Role Title</label>
                        <input
                          type="text"
                          value={selectedProfile.roleTitle}
                          maxLength={100}
                          onChange={(e) => updateCurrentProfile({ roleTitle: e.target.value })}
                          className={`h-9 w-full rounded-lg border px-3 text-sm outline-none ${inputBg}`}
                        />
                      </div>
                    </div>

                    {!isSelectedCeo && (
                      <div>
                        <label className={`block text-xs font-bold mb-2 ${subtleText}`}>Department / Discipline</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {OFFICE_DEPARTMENTS.filter((d) => d !== 'general').map((dept) => {
                            const meta = DEPARTMENT_META[dept] || DEPARTMENT_META.general;
                            const IconComp = meta?.icon || Layers;
                            const isSelectedDept = currentDept === dept;

                            return (
                              <button
                                key={dept}
                                type="button"
                                onClick={() => updateCurrentProfile({ department: dept })}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold text-left transition-all ${
                                  isSelectedDept
                                    ? isDark ? 'bg-white/[0.06] border-white/40 text-white' : 'bg-zinc-100 border-zinc-500 text-zinc-900'
                                    : isDark
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                                }`}
                              >
                                <IconComp className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{meta?.label || dept}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${subtleText}`}>Preferred Agent Engine</label>
                      <select
                        value={selectedProfile.preferredProviderId || ''}
                        onChange={(e) => updateCurrentProfile({ preferredProviderId: (e.target.value || undefined) as any })}
                        className={`h-9 w-full rounded-lg border px-3 text-sm outline-none ${inputBg}`}
                      >
                        {PROVIDER_OPTIONS.map(({ id, label }) => (
                          <option key={id || 'default'} value={id}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Skills Tag Cloud */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`text-xs font-bold ${subtleText}`}>Skills & Capabilities</label>
                        <span className={`text-[10px] ${subtleText}`}>{currentSkills.length} skills assigned</span>
                      </div>

                      {/* Active skill chips */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5 p-3 rounded-xl border min-h-[46px]" style={{ backgroundColor: isDark ? '#14151c' : '#f9fafb', borderColor: isDark ? '#22232a' : '#e4e4e7' }}>
                        {currentSkills.length === 0 ? (
                          <span className={`text-xs italic ${subtleText}`}>No skills assigned yet. Add some below.</span>
                        ) : (
                          currentSkills.map((skill) => (
                            <span
                              key={skill}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${isDark ? 'bg-white/[0.05] text-zinc-200 border-white/10' : 'bg-zinc-100 text-zinc-800 border-zinc-200'}`}
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="text-zinc-500 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Add custom skill input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type a skill and press Add (e.g., GraphQL, Docker, Tailwind)..."
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill(skillInput);
                            }
                          }}
                          className={`h-8 flex-1 rounded-lg border px-3 text-xs outline-none ${inputBg}`}
                        />
                        <button
                          type="button"
                          onClick={() => addSkill(skillInput)}
                          className="px-3 h-8 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>

                      {/* Department Skill Suggestions */}
                      <div className="mt-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${subtleText} block mb-1.5`}>
                          Suggested for {currentDeptMeta.label}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(DEPARTMENT_SKILL_SUGGESTIONS[currentDept] || []).map((sugg) => {
                            const isAlreadyAdded = currentSkills.some((s) => s.toLowerCase() === sugg.toLowerCase());
                            if (isAlreadyAdded) return null;
                            return (
                              <button
                                key={sugg}
                                type="button"
                                onClick={() => addSkill(sugg)}
                                className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                                  isDark
                                    ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-100'
                                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'
                                }`}
                              >
                                + {sugg}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: VISUAL STYLE & WARDROBE */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    {/* Hair Style Grid */}
                    <div>
                      <label className={`block text-xs font-bold mb-2 ${subtleText}`}>Hair Style</label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {HAIR_STYLE_OPTIONS.map(({ value: val, label }) => {
                          const isSelectedStyle = currentAppearance.hairStyle === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => updateCurrentAppearance({ hairStyle: val })}
                              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                isSelectedStyle
                                  ? isDark ? 'bg-white/[0.06] border-white/40 text-white' : 'bg-zinc-100 border-zinc-500 text-zinc-900'
                                  : isDark
                                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                              }`}
                            >
                              <span>{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 1-Click Curated Color Swatches */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Skin Tone */}
                      <div className={`p-3.5 rounded-xl border ${borderCol} ${cardBg}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">Skin Tone</span>
                          <input
                            type="color"
                            value={currentAppearance.skin || '#f6d2b8'}
                            onChange={(e) => updateCurrentAppearance({ skin: e.target.value })}
                            className="h-6 w-7 rounded cursor-pointer border-0 bg-transparent"
                            title="Custom Hex Picker"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PALETTES.skin.map((pal) => (
                            <button
                              key={pal.hex}
                              type="button"
                              onClick={() => updateCurrentAppearance({ skin: pal.hex })}
                              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                              style={{
                                backgroundColor: pal.hex,
                                borderColor: currentAppearance.skin === pal.hex ? (isDark ? '#e4e4e7' : '#18181b') : 'transparent',
                              }}
                              title={pal.label}
                            >
                              {currentAppearance.skin === pal.hex && <Check className="h-3 w-3 text-zinc-900 drop-shadow" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hair Color */}
                      <div className={`p-3.5 rounded-xl border ${borderCol} ${cardBg}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">Hair Color</span>
                          <input
                            type="color"
                            value={currentAppearance.hair || '#18181b'}
                            onChange={(e) => updateCurrentAppearance({ hair: e.target.value })}
                            className="h-6 w-7 rounded cursor-pointer border-0 bg-transparent"
                            title="Custom Hex Picker"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PALETTES.hair.map((pal) => (
                            <button
                              key={pal.hex}
                              type="button"
                              onClick={() => updateCurrentAppearance({ hair: pal.hex })}
                              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                              style={{
                                backgroundColor: pal.hex,
                                borderColor: currentAppearance.hair === pal.hex ? (isDark ? '#e4e4e7' : '#18181b') : 'transparent',
                              }}
                              title={pal.label}
                            >
                              {currentAppearance.hair === pal.hex && <Check className="h-3 w-3 text-white drop-shadow" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Outfit / Shirt */}
                      <div className={`p-3.5 rounded-xl border ${borderCol} ${cardBg}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">Clothing / Shirt</span>
                          <input
                            type="color"
                            value={currentAppearance.shirt || '#2a3550'}
                            onChange={(e) => updateCurrentAppearance({ shirt: e.target.value })}
                            className="h-6 w-7 rounded cursor-pointer border-0 bg-transparent"
                            title="Custom Hex Picker"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PALETTES.shirt.map((pal) => (
                            <button
                              key={pal.hex}
                              type="button"
                              onClick={() => updateCurrentAppearance({ shirt: pal.hex })}
                              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                              style={{
                                backgroundColor: pal.hex,
                                borderColor: currentAppearance.shirt === pal.hex ? (isDark ? '#e4e4e7' : '#18181b') : 'transparent',
                              }}
                              title={pal.label}
                            >
                              {currentAppearance.shirt === pal.hex && <Check className="h-3 w-3 text-white drop-shadow" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Trousers / Pants */}
                      <div className={`p-3.5 rounded-xl border ${borderCol} ${cardBg}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">Trousers / Pants</span>
                          <input
                            type="color"
                            value={currentAppearance.pants || '#23262e'}
                            onChange={(e) => updateCurrentAppearance({ pants: e.target.value })}
                            className="h-6 w-7 rounded cursor-pointer border-0 bg-transparent"
                            title="Custom Hex Picker"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PALETTES.pants.map((pal) => (
                            <button
                              key={pal.hex}
                              type="button"
                              onClick={() => updateCurrentAppearance({ pants: pal.hex })}
                              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                              style={{
                                backgroundColor: pal.hex,
                                borderColor: currentAppearance.pants === pal.hex ? (isDark ? '#e4e4e7' : '#18181b') : 'transparent',
                              }}
                              title={pal.label}
                            >
                              {currentAppearance.pants === pal.hex && <Check className="h-3 w-3 text-white drop-shadow" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tie Color (if suit jacket active) */}
                      {currentAppearance.suit && (
                        <div className={`p-3.5 rounded-xl border sm:col-span-2 ${borderCol} ${cardBg}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold">Tie Color</span>
                            <input
                              type="color"
                              value={currentAppearance.tie || '#c8483e'}
                              onChange={(e) => updateCurrentAppearance({ tie: e.target.value })}
                              className="h-6 w-7 rounded cursor-pointer border-0 bg-transparent"
                              title="Custom Hex Picker"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {PALETTES.tie.map((pal) => (
                              <button
                                key={pal.hex}
                                type="button"
                                onClick={() => updateCurrentAppearance({ tie: pal.hex })}
                                className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                                style={{
                                  backgroundColor: pal.hex,
                                  borderColor: currentAppearance.tie === pal.hex ? (isDark ? '#e4e4e7' : '#18181b') : 'transparent',
                                }}
                                title={pal.label}
                              >
                                {currentAppearance.tie === pal.hex && <Check className="h-3 w-3 text-white drop-shadow" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accessories Toggles */}
                    <div>
                      <label className={`block text-xs font-bold mb-2.5 ${subtleText}`}>Accessories & Apparel</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Glasses */}
                        <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          currentAppearance.glasses ? (isDark ? 'bg-white/[0.06] border-white/30' : 'bg-zinc-100 border-zinc-400') : `${cardBg} ${borderCol}`
                        }`}>
                          <span className="text-xs font-bold">Glasses</span>
                          <input
                            type="checkbox"
                            checked={Boolean(currentAppearance.glasses)}
                            onChange={(e) => updateCurrentAppearance({ glasses: e.target.checked })}
                            className="h-4 w-4 accent-white rounded"
                          />
                        </label>

                        {/* Headset */}
                        <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          currentAppearance.headset ? (isDark ? 'bg-white/[0.06] border-white/30' : 'bg-zinc-100 border-zinc-400') : `${cardBg} ${borderCol}`
                        }`}>
                          <span className="text-xs font-bold">Headset</span>
                          <input
                            type="checkbox"
                            checked={Boolean(currentAppearance.headset)}
                            onChange={(e) => updateCurrentAppearance({ headset: e.target.checked })}
                            className="h-4 w-4 accent-white rounded"
                          />
                        </label>

                        {/* Suit Jacket */}
                        <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          currentAppearance.suit ? (isDark ? 'bg-white/[0.06] border-white/30' : 'bg-zinc-100 border-zinc-400') : `${cardBg} ${borderCol}`
                        }`}>
                          <span className="text-xs font-bold">Suit Jacket</span>
                          <input
                            type="checkbox"
                            checked={Boolean(currentAppearance.suit)}
                            onChange={(e) => updateCurrentAppearance({ suit: e.target.checked })}
                            className="h-4 w-4 accent-white rounded"
                          />
                        </label>

                        {/* Cap */}
                        <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          currentAppearance.hairStyle === 'cap' ? (isDark ? 'bg-white/[0.06] border-white/30' : 'bg-zinc-100 border-zinc-400') : `${cardBg} ${borderCol}`
                        }`}>
                          <span className="text-xs font-bold">Baseball Cap</span>
                          <input
                            type="checkbox"
                            checked={currentAppearance.hairStyle === 'cap'}
                            onChange={(e) => updateCurrentAppearance({ hairStyle: e.target.checked ? 'cap' : 'short' })}
                            className="h-4 w-4 accent-white rounded"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: OFFICE FLOOR PRESENCE */}
                {activeTab === 'presence' && (
                  <div className="space-y-5">
                    <div className={`p-4 rounded-xl border ${borderCol} ${cardBg}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold">Display Teammate on Office Floor</h4>
                          <p className={`text-xs mt-0.5 ${subtleText}`}>
                            This controls whether the character appears at a desk. It does not mean an agent is running or a task is in progress.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedProfile.enabled}
                          disabled={isSelectedCeo}
                          onChange={(e) => updateCurrentProfile({ enabled: e.target.checked })}
                          className="h-5 w-5 accent-white rounded cursor-pointer disabled:opacity-40"
                        />
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${borderCol} ${cardBg} space-y-2`}>
                      <h4 className="text-sm font-bold">Work Dispatch & Teammate Availability</h4>
                      <p className={`text-xs leading-5 ${subtleText}`}>
                        Teammates who are marked as <strong>In Office</strong> appear at their workstations in the 3D office and can converse with you directly.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-bold text-rose-400">
                    {error}
                  </div>
                )}
              </div>
            </main>
          </div>

          {/* Modal Bottom Footer */}
          <footer className={`flex shrink-0 items-center justify-between border-t px-6 py-3.5 ${bgSidebar} ${borderCol}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${subtleText}`}>
                {hasChanges ? 'Unsaved changes' : 'All changes saved'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className={`h-9 rounded-xl border px-4 text-xs font-bold transition-colors ${
                  isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={!hasChanges || saving}
                className={`flex items-center gap-2 h-9 rounded-lg px-5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}
              >
                <Check className="h-4 w-4" />
                <span>{saving ? 'Saving Team...' : 'Save Team'}</span>
              </button>
            </div>
          </footer>
        </OfficeModalErrorBoundary>
      </section>
    </div>
  );
};
