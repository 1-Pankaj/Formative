import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Project, ProjectOfficeTeam, ThemeMode } from '../../types';
import type { AgentProviderId, AgentProviderStatus, AgentRun } from '../../types/agentRuns';
import type { StartChatRun } from '../AgentChatView';
import { EmployeeSetupModal } from './EmployeeSetupModal';
import { OfficeCoordinatorChat } from './OfficeCoordinatorChat';
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
  const [isCoordinatorChatOpen, setIsCoordinatorChatOpen] = useState(false);
  const [speed, setSpeed] = useState(60);
  const [isLive, setIsLive] = useState(false);
  const [tilt, setTilt] = useState(0.4);
  const [resolution, setResolution] = useState(1);
  const [displayOptionsOpen, setDisplayOptionsOpen] = useState(false);

  const isLight = theme === 'light';
  const employees = useMemo(() => [team.ceo, ...team.employees.filter((employee) => employee.enabled)], [team]);
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
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button, [contenteditable="true"]')) return;
      if (event.key === 'h' || event.key === 'H') setIsUiHidden((hidden) => !hidden);
      if (event.key === 'Escape') {
        setSelectedPerson(null);
        instance.deselect();
      }
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

  useEffect(() => {
    engineRef.current?.setEmployees(team);
  }, [team]);

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

            <div className="min-w-0 flex-1" role="status" aria-live="polite">
              <p className={`text-[11px] font-medium uppercase tracking-wide ${secondaryText}`}>Agent activity</p>
              <p className="mt-0.5 truncate text-xs font-medium">
                {primaryActivity && primaryActiveEmployee
                  ? `${activeRunCount} active ${activeRunCount === 1 ? 'run' : 'runs'} · ${primaryActiveEmployee.name} · ${primaryActivity.summary}${awayAssignedRunCount ? ` · ${awayAssignedRunCount} assigned teammate${awayAssignedRunCount === 1 ? ' is' : 's are'} away` : ''}`
                  : activeRunCount
                    ? `${activeRunCount} active ${activeRunCount === 1 ? 'run' : 'runs'} · assigned teammate is not enabled in the current team`
                    : 'No active agent run'}
              </p>
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
            <button type="button" onClick={() => setIsCoordinatorChatOpen(true)} className={`h-9 rounded-md border px-3 text-xs font-medium ${control}`}>
              Ask {team.ceo.name}
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

        {selectedPerson && !isUiHidden && !renderFailure && (
          <section className={`absolute bottom-4 right-4 z-30 w-[min(340px,calc(100%-2rem))] rounded-lg border p-4 shadow-xl ${surface} ${isLight ? 'shadow-zinc-900/10' : 'shadow-black/40'}`} aria-label="Office character details">
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
                    <h3 className="truncate text-sm font-semibold">{selectedPerson.name}</h3>
                    <p className={`mt-1 text-xs ${secondaryText}`}>{selectedPerson.roleTitle}</p>
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
                    : 'No active agent run is assigned to this teammate.'}
                </p>
                {selectedPerson.skills.length > 0 && <p className={`mt-3 text-xs leading-5 ${secondaryText}`}>Skills: {selectedPerson.skills.join(' · ')}</p>}
                {selectedPerson.employeeId === team.ceo.id && (
                  <button type="button" onClick={() => setIsCoordinatorChatOpen(true)} className={`mt-3 h-8 rounded-md px-3 text-xs font-semibold ${primaryAction}`}>
                    Talk to {team.ceo.name}
                  </button>
                )}
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
      {isCoordinatorChatOpen && (
        <OfficeCoordinatorChat
          project={project}
          team={team}
          theme={theme}
          providerStatuses={providerStatuses}
          isCheckingProviders={isCheckingProviders}
          onRefreshProviders={onRefreshProviders}
          onStartRun={onStartRun}
          onStopRun={onStopRun}
          onClose={() => setIsCoordinatorChatOpen(false)}
        />
      )}
    </div>
  );
};
