import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Project, ProjectOfficeTeam, ThemeMode } from '../../types';
import type { AgentProviderId, AgentProviderStatus, AgentRun } from '../../types/agentRuns';
import type { StartChatRun } from '../AgentChatView';
import { extractConciseSpeech } from '../../utils/promptUtils';
import { EmployeeSetupModal } from './EmployeeSetupModal';
import {
  Activity,
  Bot,
  ExternalLink,
  Maximize2,
  MessageSquare,
  MessageSquareText,
  Trash2,
  X,
} from '../ui/FormativeGlyphs';
import {
  createThreeOffice,
  OfficeAgentActivity,
  OfficeStats,
  SelectedPerson,
  ThreeOfficeInstance,
} from './three/ThreeOfficeEngine';

interface OfficeFloorViewProps {
  theme: ThemeMode;
  project: Project;
  team: ProjectOfficeTeam;
  providerStatuses: AgentProviderStatus[];
  isCheckingProviders: boolean;
  onRefreshProviders: () => void;
  onSaveTeam: (team: ProjectOfficeTeam) => Promise<boolean>;
  onStartRun: (request: StartChatRun) => Promise<{ success: boolean; error?: string }>;
  onStopRun: (runId: string) => Promise<void>;
  openTeamSetupRequest?: boolean;
  onTeamSetupRequestHandled?: () => void;
  onOpenAgentChat?: (conversationId?: string, taskId?: string) => void;
}

interface OfficeRenderFailure {
  message: string;
  details?: string;
}

function describeRenderError(error: unknown): string | undefined {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`.slice(0, 5000);
  }
  return error == null ? undefined : String(error).slice(0, 5000);
}

const INITIAL_STATS: OfficeStats = {
  floorCount: 0,
  day: 1,
  mode: 'office hours',
  hour: 13.4,
  timeStr: '13:24',
  icon: 'sun',
};

const ACTIVE_RUN_STATUSES = new Set<AgentRun['status']>(['queued', 'starting', 'running', 'waiting_for_approval', 'stopping']);
const DISPLAYABLE_PROGRESS_TYPES = new Set(['progress', 'tool_started', 'tool_finished', 'file_changed', 'approval_required', 'warning', 'error']);
const PROVIDER_LABELS: Record<AgentProviderId, string> = {
  'codex-cli': 'Codex', 'claude-code': 'Claude Code', opencode: 'OpenCode', antigravity: 'Antigravity',
  openclaw: 'OpenClaw', ollama: 'Ollama', kiro: 'Kiro', api: 'API', mcp: 'MCP',
};

export const OfficeFloorView: React.FC<OfficeFloorViewProps> = ({
  theme,
  project,
  team,
  providerStatuses,
  isCheckingProviders,
  onRefreshProviders,
  onSaveTeam,
  onStartRun,
  onStopRun,
  openTeamSetupRequest = false,
  onTeamSetupRequestHandled,
  onOpenAgentChat,
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const portraitCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ThreeOfficeInstance | null>(null);

  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isUiHidden, setIsUiHidden] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<SelectedPerson | null>(null);
  const [stats, setStats] = useState<OfficeStats>(INITIAL_STATS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [renderFailure, setRenderFailure] = useState<OfficeRenderFailure | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeChatTarget, setActiveChatTarget] = useState<{
    id: string;
    name: string;
    roleTitle: string;
    department?: string;
    skills?: string[];
  } | null>(null);
  const [chatPrompt, setChatPrompt] = useState('');
  const [isSubmittingChat, setIsSubmittingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatStorageKey = project?.id ? `structra_office_chat_${project.id}` : null;

  const cleanOfficeChatHistory = (rawHistory: Record<string, any[]>): Record<string, Array<{ id: string; sender: 'user' | 'agent'; text: string; time: string }>> => {
    const result: Record<string, Array<{ id: string; sender: 'user' | 'agent'; text: string; time: string }>> = {};
    for (const [key, msgs] of Object.entries(rawHistory)) {
      if (!Array.isArray(msgs)) continue;
      result[key] = msgs.filter((m) => {
        if (!m || typeof m.text !== 'string') return false;
        // Purge any legacy CLI agent run logs that were previously dumped into personal chat
        if (/claude code run|codex run|agent could not complete this run/i.test(m.text)) return false;
        if (typeof m.id === 'string' && (m.id.includes(':failed') || m.id.includes('event-run-'))) return false;
        return true;
      });
    }
    return result;
  };

  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ id: string; sender: 'user' | 'agent'; text: string; time: string }>>>(() => {
    if (!project?.id) return {};
    try {
      const stored = localStorage.getItem(`structra_office_chat_${project.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return cleanOfficeChatHistory(parsed);
      }
    } catch {}
    return {};
  });

  // Persist office chat messages across application restarts
  useEffect(() => {
    if (!chatStorageKey) return;
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages, chatStorageKey]);

  // Load chat messages when active project changes
  const prevProjectIdRef = useRef<string | undefined>(project?.id);
  useEffect(() => {
    if (prevProjectIdRef.current === project?.id) return;
    prevProjectIdRef.current = project?.id;
    if (!project?.id) {
      setChatMessages({});
      return;
    }
    try {
      const stored = localStorage.getItem(`structra_office_chat_${project.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setChatMessages(cleanOfficeChatHistory(parsed));
          return;
        }
      }
    } catch {}
    setChatMessages({});
  }, [project?.id]);

  const lastSeenEventRef = useRef<Record<string, string>>({});
  const activeConversationIdRef = useRef<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [speed, setSpeed] = useState(60);
  const [isLive, setIsLive] = useState(false);
  const [tilt, setTilt] = useState(0.4);
  const [resolution, setResolution] = useState(1);
  const [displayOptionsOpen, setDisplayOptionsOpen] = useState(false);

  const isLight = theme === 'light';
  const employees = useMemo(() => [team.ceo, ...team.employees.filter((employee) => employee.enabled)], [team]);

  const isEmployeeActiveRunning = useMemo(() => {
    if (!activeChatTarget) return false;
    return (project.agentRuns || []).some(
      (r) => r.employeeId === activeChatTarget.id && ACTIVE_RUN_STATUSES.has(r.status)
    );
  }, [activeChatTarget, project.agentRuns]);

  const isThinking = isSubmittingChat || isEmployeeActiveRunning;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isThinking, activeChatTarget]);

  useEffect(() => {
    if (activeChatTarget) {
      engineRef.current?.focusEmployee(activeChatTarget.id, true);
      engineRef.current?.setCameraTrackTarget(activeChatTarget.id);
    } else {
      engineRef.current?.setCameraTrackTarget(null);
    }
    return () => {
      engineRef.current?.setCameraTrackTarget(null);
    };
  }, [activeChatTarget]);

  const handleClearChat = (partnerId: string) => {
    setChatMessages((prev) => {
      const next = { ...prev, [partnerId]: [] };
      if (chatStorageKey) {
        try {
          localStorage.setItem(chatStorageKey, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
    setChatError(null);
    engineRef.current?.showSpeechBubble(partnerId, `Chat cleared! What's next?`, 4.0);
  };

  const handleStartChatWithCeo = () => {
    const partner = {
      id: team.ceo.id,
      name: team.ceo.name,
      roleTitle: team.ceo.roleTitle || 'Chief Executive Agent',
      department: 'ceo',
      skills: team.ceo.skills || [],
    };
    setActiveChatTarget(partner);
    setSelectedPerson(null);
    setChatError(null);
    engineRef.current?.focusEmployee(partner.id, true);
    engineRef.current?.showSpeechBubble(partner.id, `Hey! I'm ${partner.name}. What can I do?`, 5.0);
  };

  const handleStartChatWithPerson = (person: SelectedPerson) => {
    const partner = {
      id: person.employeeId || `person-${person.name.toLowerCase()}`,
      name: person.name,
      roleTitle: person.roleTitle,
      department: person.role,
      skills: person.skills || [],
    };
    setActiveChatTarget(partner);
    setSelectedPerson(null);
    setChatError(null);
    engineRef.current?.focusEmployee(partner.id, true);

    let greeting = `Hey! I'm ${person.name}. What can I do?`;
    if (person.role === 'reception') {
      greeting = `Welcome to Structra! How can I help today?`;
    } else if (person.role === 'sysadmin') {
      greeting = `Server racks are running cool. What's up?`;
    } else if (person.role === 'presenter') {
      greeting = `Rehearsing the architecture walkthrough! Thoughts?`;
    } else if (person.role === 'visitor') {
      greeting = `Hey there! Nice day in the neighborhood!`;
    }
    engineRef.current?.showSpeechBubble(partner.id, greeting, 5.0);
  };

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatPrompt.trim() || !activeChatTarget || isSubmittingChat) return;

    const promptText = chatPrompt.trim();
    const partner = activeChatTarget;
    const partnerId = partner.id;

    // Smoothly pan & zoom camera directly onto this person in 3D
    engineRef.current?.focusEmployee(partnerId, true);

    // Show immediate 3D speech bubble above head in 3D pixel view
    engineRef.current?.showSpeechBubble(partnerId, '···', 15.0);

    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const userMsg = { id: `user-${Date.now()}`, sender: 'user' as const, text: promptText, time: timeStr };
    const prevList = chatMessages[partnerId] || [];

    setChatMessages((prev) => {
      const next = {
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), userMsg],
      };
      if (chatStorageKey) {
        try {
          localStorage.setItem(chatStorageKey, JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    setChatPrompt('');
    setIsSubmittingChat(true);
    setChatError(null);

    try {
      if (window.formativeApi?.generateOfficeDialogue) {
        // Prior conversation history before the new user prompt (up to last 6 turns)
        const history = prevList.slice(-6).map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

        const architecturalComponents = (project.nodes || [])
          .map((n) => n.data?.label || n.label)
          .filter((label: string) => Boolean(label) && !label.toLowerCase().includes('root'))
          .slice(0, 6);

        const result = await window.formativeApi.generateOfficeDialogue({
          employee: {
            id: partner.id,
            name: partner.name,
            roleTitle: partner.roleTitle,
            department: partner.department || 'general',
            skills: partner.skills,
          },
          project: {
            name: project.name || 'Current Project',
            description: project.description,
            type: project.type,
            components: architecturalComponents,
          },
          history,
          prompt: promptText,
        });

        if (result.success && result.text) {
          const responseText = result.text;
          engineRef.current?.showSpeechBubble(partnerId, responseText, 9.0);
          const replyTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          const agentMsg = { id: `agent-${Date.now()}`, sender: 'agent' as const, text: responseText, time: replyTime };
          setChatMessages((prev) => {
            const next = {
              ...prev,
              [partnerId]: [...(prev[partnerId] || []), agentMsg],
            };
            if (chatStorageKey) {
              try {
                localStorage.setItem(chatStorageKey, JSON.stringify(next));
              } catch {}
            }
            return next;
          });
        } else {
          const errMsg = result.error || 'Could not generate dialogue response.';
          setChatError(errMsg);
          engineRef.current?.showSpeechBubble(partnerId, '...', 3.0);
        }
      } else {
        // Fallback when local LLM bridge is unavailable
        const fallbackText = `Hey! I'm ${partner.name}, ${partner.roleTitle}. Great collaborating with you on ${project.name || 'the project'}!`;
        engineRef.current?.showSpeechBubble(partnerId, fallbackText, 8.0);
        const replyTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const fallbackMsg = { id: `agent-${Date.now()}`, sender: 'agent' as const, text: fallbackText, time: replyTime };
        setChatMessages((prev) => {
          const next = {
            ...prev,
            [partnerId]: [...(prev[partnerId] || []), fallbackMsg],
          };
          if (chatStorageKey) {
            try {
              localStorage.setItem(chatStorageKey, JSON.stringify(next));
            } catch {}
          }
          return next;
        });
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not generate response.');
      engineRef.current?.showSpeechBubble(partnerId, '...', 3.0);
    } finally {
      setIsSubmittingChat(false);
    }
  };

  // Watch for active assistant events during live background runs to display in-scene 3D speech bubble
  useEffect(() => {
    if (!project.agentRuns?.length) return;
    const activeRuns = project.agentRuns.filter((r) => ACTIVE_RUN_STATUSES.has(r.status));
    for (const run of activeRuns) {
      if (!run.employeeId) continue;
      const employeeId = run.employeeId;
      const assistantEvent = [...run.events].reverse().find((e) => e.type === 'assistant_message');
      if (assistantEvent) {
        const compositeKey = `${run.id}:${assistantEvent.id}`;
        if (!lastSeenEventRef.current[compositeKey]) {
          lastSeenEventRef.current[compositeKey] = 'seen';
          const rawText = assistantEvent.details || assistantEvent.summary;
          const concise = extractConciseSpeech(rawText, 120);
          const person = employees.find((e) => e.id === employeeId) || (employeeId === team.ceo.id ? team.ceo : null);
          if (person) {
            engineRef.current?.showSpeechBubble(employeeId, concise, 10.0);
          }
        }
      }
    }
  }, [project.agentRuns, employees, team.ceo]);

  
  const liveActivity = useMemo<OfficeAgentActivity[]>(() => {
    const employeeIds = new Set(employees.map((employee) => employee.id));
    const runs = [...(project.agentRuns || [])]
      .filter((run) => ACTIVE_RUN_STATUSES.has(run.status))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const assigned = new Map<string, OfficeAgentActivity>();
    for (const run of runs) {
      if (run.employeeId && !employeeIds.has(run.employeeId)) continue;
      const employeeId = run.employeeId || team.ceo.id;
      if (assigned.has(employeeId)) continue;
      const event = [...run.events].reverse().find((item) => DISPLAYABLE_PROGRESS_TYPES.has(item.type));
      const task = (project.issues || []).find((issue) => issue.id === run.taskId);
      const summary = event
        ? [event.summary, event.relativePaths?.length ? event.relativePaths.join(', ') : ''].filter(Boolean).join(' · ')
        : task ? `Working on ${task.key}: ${task.title}` : `Starting ${PROVIDER_LABELS[run.providerId]} in this project`;
      assigned.set(employeeId, { employeeId, status: run.status, summary: summary.slice(0, 240) });
    }
    return [...assigned.values()];
  }, [employees, project.agentRuns, project.issues, team.ceo.id]);
  const primaryActivity = liveActivity[0];
  const primaryActiveEmployee = primaryActivity ? employees.find((employee) => employee.id === primaryActivity.employeeId) : undefined;
  const activeRunCount = (project.agentRuns || []).filter((run) => ACTIVE_RUN_STATUSES.has(run.status)).length;
  const primaryRun = useMemo(() => {
    return [...(project.agentRuns || [])]
      .filter((run) => ACTIVE_RUN_STATUSES.has(run.status))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] || null;
  }, [project.agentRuns]);
  const awayAssignedRunCount = (project.agentRuns || []).filter((run) =>
    ACTIVE_RUN_STATUSES.has(run.status) && Boolean(run.employeeId) && !employees.some((employee) => employee.id === run.employeeId)
  ).length;

  useEffect(() => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;

    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    let instance: ThreeOfficeInstance;
    setRenderFailure(null);

    try {
      instance = createThreeOffice(canvas, {
        onSelectPerson: setSelectedPerson,
        onStatsUpdate: setStats,
        onToast: (message) => {
          setToastMessage(message);
          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => setToastMessage(null), 4200);
        },
        onRenderError: (message, error) => {
          if (message.startsWith('The graphics driver') || message.startsWith('The office scene')) {
            setRenderFailure({ message, details: describeRenderError(error) });
          } else {
            setToastMessage(message);
          }
        },
      }, team);
    } catch (error) {
      console.error('Formative office could not start.', error);
      setRenderFailure({
        message: 'Formative could not start the 3D office on this device. Check that hardware acceleration is available, then try again.',
        details: describeRenderError(error),
      });
      return () => {
        if (toastTimer) clearTimeout(toastTimer);
      };
    }

    engineRef.current = instance;
    setTilt(instance.getTilt());
    setResolution(instance.getResolution());
    setSpeed(instance.getSpeed());
    setIsLive(instance.getLive());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveChatTarget(null);
        setSelectedPerson(null);
        instance.deselect();
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button, [contenteditable="true"]')) return;
      if (event.key === 'h' || event.key === 'H') setIsUiHidden((hidden) => !hidden);
    };
    window.addEventListener('keydown', handleKeyDown);

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) instance.resize(width, height);
    });
    resizeObserver.observe(viewport);

    return () => {
      if (toastTimer) clearTimeout(toastTimer);
      window.removeEventListener('keydown', handleKeyDown);
      resizeObserver.disconnect();
      instance.destroy();
      if (engineRef.current === instance) engineRef.current = null;
    };
  }, [retryCount]);

  const teamSignature = useMemo(() => {
    return `${team.ceo.id}:${team.ceo.name}:${team.employees.map((e) => `${e.id}:${e.name}:${e.enabled}:${e.department}`).join(';')}`;
  }, [team]);

  useEffect(() => {
    engineRef.current?.setEmployees(team);
  }, [teamSignature]);

  useEffect(() => {
    engineRef.current?.setAgentActivity(liveActivity);
  }, [liveActivity]);

  useEffect(() => {
    if (!openTeamSetupRequest) return;
    setIsSetupOpen(true);
    onTeamSetupRequestHandled?.();
  }, [openTeamSetupRequest, onTeamSetupRequestHandled]);

  useEffect(() => {
    if (selectedPerson && portraitCanvasRef.current) {
      selectedPerson.drawPortrait(portraitCanvasRef.current);
    }
  }, [selectedPerson]);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hour = Number(event.target.value);
    setIsLive(false);
    engineRef.current?.setLive(false);
    engineRef.current?.setHour(hour);
  };

  const handleToggleLive = () => {
    const next = !isLive;
    setIsLive(next);
    if (next) setSpeed(1);
    engineRef.current?.setLive(next);
  };

  const handleCycleSpeed = () => {
    const speeds = [1, 60, 300];
    const nextSpeed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (isLive || nextSpeed === 1) {
      setIsLive(false);
      engineRef.current?.setLive(false);
    }
    engineRef.current?.setSpeed(nextSpeed);
  };

  const handleCycleResolution = () => {
    const resolutions = [1, 0.75, 0.5];
    const nextResolution = resolutions[(resolutions.indexOf(resolution) + 1) % resolutions.length];
    setResolution(nextResolution);
    engineRef.current?.setResolution(nextResolution);
  };

  const surface = isLight
    ? 'bg-white text-zinc-950 border-zinc-200'
    : 'bg-[#121215] text-zinc-100 border-[#27272a]';
  const secondaryText = isLight ? 'text-zinc-600' : 'text-zinc-400';
  const control = isLight
    ? 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100'
    : 'border-[#27272a] bg-[#121215] text-zinc-200 hover:bg-[#18181b]';
  const primaryAction = isLight
    ? 'bg-zinc-900 text-white hover:bg-zinc-700 focus-visible:ring-sky-500'
    : 'bg-white text-zinc-950 hover:bg-zinc-200 focus-visible:ring-sky-500';
  const rangeAccent = isLight ? 'accent-zinc-900' : 'accent-zinc-100';

  return (
    <div className={`relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden select-none ${isLight ? 'bg-white' : 'bg-[#09090b]'}`}>
      {!isUiHidden && (
        <div className={`z-20 flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b px-4 py-3 xl:px-6 ${surface}`}>
          <div className="flex min-w-[250px] flex-1 items-center gap-5">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-5">Project office</h2>
              <p className={`mt-0.5 text-xs leading-4 ${secondaryText}`}>
                {employees.length - 1} {employees.length === 2 ? 'teammate' : 'teammates'} · {team.ceo.name} coordinates this project
              </p>
            </div>

            <div className={`hidden h-9 border-l sm:block ${isLight ? 'border-zinc-200' : 'border-[#29292d]'}`} />

            <div className="min-w-0 flex-1 flex items-center justify-between gap-3" role="status" aria-live="polite">
              <div className="min-w-0">
                <p className={`text-[11px] font-medium uppercase tracking-wide flex items-center gap-1.5 ${activeRunCount > 0 ? 'text-emerald-400 font-bold' : secondaryText}`}>
                  {activeRunCount > 0 && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                  <span>Agent activity</span>
                </p>
                <p className="mt-0.5 truncate text-xs font-medium">
                  {primaryActivity && primaryActiveEmployee
                    ? `${activeRunCount} active ${activeRunCount === 1 ? 'run' : 'runs'} · ${primaryActiveEmployee.name} · ${primaryActivity.summary}${awayAssignedRunCount ? ` · ${awayAssignedRunCount} assigned teammate${awayAssignedRunCount === 1 ? ' is' : 's are'} away` : ''}`
                    : activeRunCount
                      ? `${activeRunCount} active ${activeRunCount === 1 ? 'run' : 'runs'} · assigned teammate is not enabled in the current team`
                      : 'No active agent run'}
                </p>
              </div>
              {activeRunCount > 0 && primaryRun && onOpenAgentChat && (
                <button
                  type="button"
                  onClick={() => onOpenAgentChat(primaryRun.conversationId, primaryRun.taskId)}
                  className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Inspect Run</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2.5">
            <label className={`flex h-9 items-center gap-2 rounded-md border px-2.5 ${control}`}>
              <span className="text-xs font-medium">Scene time</span>
              <input
                type="range"
                min="0"
                max="24"
                step="0.05"
                value={stats.hour}
                onChange={handleTimeChange}
                aria-label="Scene time"
                className={`h-1 w-20 ${rangeAccent} xl:w-28`}
              />
              <span className="min-w-10 text-center font-mono text-xs tabular-nums">{stats.timeStr}</span>
            </label>

            <button
              type="button"
              onClick={handleToggleLive}
              aria-pressed={isLive}
              className={`h-9 rounded-md border px-2.5 text-xs font-medium transition-colors ${isLive
                ? 'border-emerald-700 bg-emerald-950 text-emerald-200'
                : control}`}
            >
              {isLive ? 'Local time on' : 'Use local time'}
            </button>

            <details className="relative" open={displayOptionsOpen} onToggle={(event) => setDisplayOptionsOpen(event.currentTarget.open)}>
              <summary className={`flex h-9 cursor-pointer list-none items-center rounded-md border px-2.5 text-xs font-medium [&::-webkit-details-marker]:hidden ${control}`}>
                Scene options
              </summary>
              <div className={`absolute right-0 top-11 z-40 w-72 rounded-lg border p-4 shadow-xl ${surface} ${isLight ? 'shadow-zinc-900/10' : 'shadow-black/40'}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium">Clock speed</p>
                      <p className={`mt-0.5 text-[11px] ${secondaryText}`}>Change how quickly the scene advances.</p>
                    </div>
                    <button type="button" onClick={handleCycleSpeed} className={`h-8 shrink-0 rounded-md border px-2.5 text-xs font-medium ${control}`}>
                      {speed}×
                    </button>
                  </div>
                  <label className="block">
                    <span className="flex items-center justify-between text-xs font-medium">
                      <span>Depth effect</span><span className={`font-mono ${secondaryText}`}>{Math.round(tilt * 100)}%</span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={tilt}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setTilt(value);
                        engineRef.current?.setTilt(value);
                      }}
                      aria-label="Depth effect"
                      className={`mt-2 h-1 w-full ${rangeAccent}`}
                    />
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium">Render detail</p>
                      <p className={`mt-0.5 text-[11px] ${secondaryText}`}>Lower detail can improve performance.</p>
                    </div>
                    <button type="button" onClick={handleCycleResolution} className={`h-8 shrink-0 rounded-md border px-2.5 text-xs font-medium ${control}`}>
                      {Math.round(resolution * 100)}%
                    </button>
                  </div>
                  <button type="button" onClick={() => engineRef.current?.centerCamera()} className={`h-9 w-full rounded-md border px-3 text-left text-xs font-medium ${control}`}>
                    Reset camera view
                  </button>
                </div>
              </div>
            </details>

            <button
              type="button"
              onClick={() => setIsSetupOpen(true)}
              className={`h-9 rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${primaryAction}`}
            >
              Team setup
            </button>
            <button type="button" onClick={handleStartChatWithCeo} className={`h-9 rounded-md border px-3 text-xs font-medium flex items-center gap-1.5 transition-colors ${control}`}>
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ask {team.ceo.name}</span>
            </button>
            <button type="button" onClick={() => setIsUiHidden(true)} className={`h-9 rounded-md border px-3 text-xs font-medium ${control}`}>
              Hide controls <span className={`ml-1 font-mono ${secondaryText}`}>H</span>
            </button>
          </div>
        </div>
      )}

      {isUiHidden && (
        <button
          type="button"
          onClick={() => setIsUiHidden(false)}
          className={`absolute right-4 top-4 z-30 h-9 rounded-md border px-3 text-xs font-medium shadow-lg ${surface}`}
        >
          Show controls <span className={`ml-1 font-mono ${secondaryText}`}>H</span>
        </button>
      )}

      <div ref={viewportRef} className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-label="Interactive isometric office scene"
          className="absolute inset-0 block h-full w-full touch-none cursor-grab outline-none active:cursor-grabbing"
        />

        {!isUiHidden && !renderFailure && (
          <p className={`pointer-events-none absolute bottom-3 left-4 z-20 max-w-[calc(100%-2rem)] rounded border px-2 py-1 text-xs shadow-sm ${isLight ? 'border-zinc-200 bg-white/90 text-zinc-700' : 'border-[#27272a] bg-[#121215]/90 text-zinc-300'}`}>
            Drag to look around · scroll to zoom · select a character to inspect
          </p>
        )}

        {renderFailure && (
          <div className={`absolute inset-0 z-30 grid place-items-center p-6 ${isLight ? 'bg-white' : 'bg-[#09090b]'}`}>
            <div className={`w-full max-w-md border-l-2 p-5 ${isLight ? 'border-red-600' : 'border-red-500'}`}>
              <h3 className="text-base font-semibold">The office scene is unavailable</h3>
              <p className={`mt-2 text-sm leading-6 ${secondaryText}`}>{renderFailure.message}</p>
              {renderFailure.details && (
                <details className={`mt-3 text-xs ${secondaryText}`}>
                  <summary className="cursor-pointer font-medium">Technical details</summary>
                  <pre className={`mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border p-2 font-mono text-[11px] leading-4 ${isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-700' : 'border-[#27272a] bg-[#121215] text-zinc-300'}`}>
                    {renderFailure.details}
                  </pre>
                </details>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedPerson(null);
                  setRetryCount((count) => count + 1);
                }}
                className={`mt-4 h-9 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${primaryAction}`}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {selectedPerson && !activeChatTarget && !isUiHidden && !renderFailure && (
          <section className={`absolute bottom-4 ${activeRunCount > 0 ? 'left-4' : 'right-4'} z-30 w-[min(340px,calc(100%-2rem))] rounded-lg border p-4 shadow-xl ${surface} ${isLight ? 'shadow-zinc-900/10' : 'shadow-black/40'}`} aria-label="Office character details">
            <div className="flex items-start gap-3">
              <canvas
                ref={portraitCanvasRef}
                width="64"
                height="96"
                aria-label={`${selectedPerson.name} portrait`}
                className={`h-24 w-16 shrink-0 border object-contain [image-rendering:pixelated] ${isLight ? 'border-zinc-200 bg-zinc-100' : 'border-[#303035] bg-[#17171a]'}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-zinc-900 dark:text-zinc-50">{selectedPerson.name}</h3>
                    <p className={`mt-0.5 text-xs font-medium ${secondaryText}`}>{selectedPerson.roleTitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPerson(null);
                      engineRef.current?.deselect();
                    }}
                    className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${control}`}
                    aria-label="Close character details"
                  >
                    Close
                  </button>
                </div>
                <p className={`mt-4 border-t pt-3 text-xs leading-5 ${isLight ? 'border-zinc-200 text-zinc-600' : 'border-[#29292d] text-zinc-400'}`}>
                  {selectedPerson.agentStatus
                    ? `${selectedPerson.agentStatus.replaceAll('_', ' ')} · ${selectedPerson.agentSummary || 'Local agent is working.'}`
                    : (selectedPerson.act || 'Working on site.')}
                </p>
                {selectedPerson.skills.length > 0 && <p className={`mt-3 text-xs leading-5 ${secondaryText}`}>Skills: {selectedPerson.skills.join(' · ')}</p>}
                <button
                  type="button"
                  onClick={() => handleStartChatWithPerson(selectedPerson)}
                  className={`mt-3 h-8 w-full rounded-md px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${primaryAction}`}
                >
                  <span>💬 Talk to {selectedPerson.name}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {toastMessage && !isUiHidden && (
          <div role="status" aria-live="polite" className={`absolute bottom-4 left-1/2 z-40 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-md border px-3 py-2 text-xs shadow-lg ${surface}`}>
            {toastMessage}
          </div>
        )}
      </div>

      <div className={`flex min-h-8 shrink-0 items-center justify-between gap-4 border-t px-4 text-[11px] ${surface}`}>
        <span className="truncate">{stats.floorCount} team members on the floor · Day {stats.day} · {stats.mode}</span>
        <span className={secondaryText}>{isLive ? 'Using local time' : 'Scene clock'}</span>
      </div>

      <EmployeeSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        team={team}
        theme={theme}
        onSave={onSaveTeam}
      />
      {/* In-Scene 3D Office Chat Box */}
      {activeChatTarget && !isUiHidden && (
        <section
          className={`absolute bottom-5 right-5 sm:right-6 z-30 w-[min(420px,calc(100vw-2.5rem))] rounded-2xl border shadow-2xl backdrop-blur-md flex flex-col overflow-hidden transition-all ${surface} ${
            isLight ? 'shadow-zinc-900/15 border-zinc-300 bg-white/95' : 'shadow-black/70 border-zinc-700 bg-[#141417]/95'
          }`}
          aria-label={`Chat with ${activeChatTarget.name}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isLight ? 'border-zinc-200 bg-zinc-50/90' : 'border-[#27272a] bg-[#121215]/90'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 border shadow-sm ${
                isLight ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-orange-950/40 border-orange-800/50 text-orange-400'
              }`}>
                {activeChatTarget.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-bold leading-tight text-zinc-900 dark:text-zinc-50">{activeChatTarget.name}</h4>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-zinc-800/80 border-zinc-700 text-zinc-300">
                    In-Office
                  </span>
                </div>
                <p className={`truncate text-xs font-medium leading-tight mt-0.5 ${secondaryText}`}>{activeChatTarget.roleTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => engineRef.current?.focusEmployee(activeChatTarget.id, true)}
                title="Pan camera to teammate"
                className={`rounded-lg p-1.5 text-xs hover:bg-zinc-700/20 transition-colors ${secondaryText}`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleClearChat(activeChatTarget.id)}
                title="Clear conversation"
                className={`rounded-lg p-1.5 text-xs hover:bg-red-500/10 hover:text-red-500 transition-colors ${secondaryText}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveChatTarget(null)}
                aria-label="Close chat"
                className={`rounded-lg p-1.5 text-xs font-bold hover:bg-zinc-700/20 transition-colors ${secondaryText}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Background Agent Run Banner (Only shown when an agent is actually executing) */}
          {(() => {
            const activeRun = (project.agentRuns || []).find(
              (r) => r.employeeId === activeChatTarget.id && ACTIVE_RUN_STATUSES.has(r.status)
            );
            if (!activeRun) return null;
            const providerLabel = PROVIDER_LABELS[activeRun.providerId] || activeRun.providerId;
            return (
              <div className="px-3.5 py-1.5 bg-emerald-950/40 border-b border-emerald-800/40 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-300 font-semibold truncate">
                    {providerLabel} agent active in background
                  </span>
                </div>
                {onOpenAgentChat && (
                  <button
                    type="button"
                    onClick={() => onOpenAgentChat(activeRun.conversationId, activeRun.taskId)}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Inspect</span>
                  </button>
                )}
              </div>
            );
          })()}

          {/* Conversation History */}
          <div ref={chatScrollContainerRef} className="h-64 overflow-y-auto p-3.5 space-y-2.5 text-xs scroll-smooth">
            {(!chatMessages[activeChatTarget.id] || chatMessages[activeChatTarget.id].length === 0) ? (
              <div className={`text-center py-6 px-3 text-xs ${secondaryText} flex flex-col items-center gap-2`}>
                <MessageSquareText className="w-5 h-5 text-zinc-500" />
                <p className="leading-relaxed">
                  Ask <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{activeChatTarget.name}</strong> anything. Responses appear directly in speech bubbles in the 3D office!
                </p>
              </div>
            ) : (
              chatMessages[activeChatTarget.id].map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed shadow-sm break-words ${
                      msg.sender === 'user'
                        ? isLight
                          ? 'bg-zinc-900 text-white font-normal'
                          : 'bg-zinc-100 text-zinc-950 font-medium'
                        : isLight
                        ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                        : 'bg-[#18181c] text-zinc-100 border border-[#303036]'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[10px] mt-1 px-1 font-mono ${secondaryText}`}>{msg.time}</span>
                </div>
              ))
            )}
            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-orange-500 dark:text-orange-400 py-1.5 px-1 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>{activeChatTarget.name} is thinking...</span>
              </div>
            )}
            {chatError && (
              <p className="text-xs text-red-400 py-1.5 bg-red-950/20 px-2.5 rounded-lg border border-red-900/40">{chatError}</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChatMessage} className={`p-2.5 border-t flex items-center gap-2 ${
            isLight ? 'border-zinc-200 bg-white' : 'border-[#27272a] bg-[#121215]'
          }`}>
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setActiveChatTarget(null);
                }
              }}
              placeholder={`Message ${activeChatTarget.name}...`}
              maxLength={300}
              disabled={isThinking}
              className={`flex-1 h-9 rounded-xl border px-3 text-xs sm:text-[13px] outline-none transition-all focus:ring-2 focus:ring-orange-500/30 ${
                isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400' : 'border-[#303036] bg-[#09090b] text-zinc-100 placeholder:text-zinc-500'
              }`}
            />
            <button
              type="submit"
              disabled={isThinking || !chatPrompt.trim()}
              className={`h-9 px-4 rounded-xl text-xs font-semibold shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${primaryAction}`}
            >
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  );
};
