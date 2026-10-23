import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import { PaperclipNav } from './components/PaperclipNav';
import { Sidebar } from './components/Sidebar';
import { Inspector } from './components/Inspector';
import { LaunchpadModal } from './components/LaunchpadModal';
import { NewProjectModal } from './components/NewProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { ContextMenu } from './components/ContextMenu';
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { TelemetryConnectView } from './components/TelemetryConnectView';
import { OfficeFloorView } from './components/office/OfficeFloorView';
import { OrgChartView } from './components/OrgChartView';
import { IssuesView } from './components/IssuesView';
import { InteractiveGuide } from './components/InteractiveGuide';
import { PaperclipCardNode } from './components/nodes/PaperclipCardNode';
import { AgentStepNode } from './components/nodes/AgentStepNode';
import { NoteNode } from './components/nodes/NoteNode';
import { hierarchicalTreeLayout } from './utils/treeLayout';
import { SAMPLE_TEMPLATES } from './data/defaultProjects';
import { 
  Project, 
  ViewMode, 
  FlowLayout, 
  NodeCategory, 
  ArchNodeData, 
  AgentTranscriptStep, 
  AgentSession, 
  AgentProvider,
  ProjectType,
  ThemeMode,
  ContextMenuPosition,
  SkillDepartment,
  IssueItem
} from './types';
import { 
  Layers, 
  Activity, 
  Network, 
  Maximize2, 
  Save, 
  BookOpen, 
  Crown, 
  Plus, 
  Sparkles,
  Sliders,
  CheckCircle2
} from 'lucide-react';

declare global {
  interface Window {
    formativeApi?: {
      selectDirectory: () => Promise<string | null>;
      selectTranscriptFile: () => Promise<string | null>;
      scanProjectDirectory: (path: string) => Promise<{ success: boolean; project?: Project; error?: string }>;
      getSavedProjects: () => Promise<Project[] | null>;
      saveProjects: (projects: Project[]) => Promise<{ success: boolean; error?: string }>;
      getAgentSessions: (providerId?: string) => Promise<{ success: boolean; sessions: AgentSession[]; error?: string }>;
      readTranscript: (path: string) => Promise<{ success: boolean; steps?: AgentTranscriptStep[]; error?: string }>;
      startWatchingTranscript: (path: string) => Promise<{ success: boolean; error?: string }>;
      stopWatchingTranscript: () => Promise<{ success: boolean }>;
      onLiveTranscriptUpdate: (cb: (steps: AgentTranscriptStep[]) => void) => () => void;
    };
  }
}

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastState {
  text: string;
  action?: ToastAction;
}

const createLocalId = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return localStorage.getItem('formative_theme') === 'light' ? 'light' : 'dark';
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('formative_onboarded');
  });

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const cached = localStorage.getItem('formative_projects');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const projectsRef = useRef<Project[]>(projects);
  const [isProjectStoreReady, setIsProjectStoreReady] = useState(() => !window.formativeApi);
  const [projectSaveState, setProjectSaveState] = useState<'saved' | 'saving' | 'error'>(() =>
    window.formativeApi ? 'saving' : 'saved'
  );
  const [projectSaveError, setProjectSaveError] = useState<string | null>(null);
  const projectSaveTimerRef = useRef<number | null>(null);
  const projectSaveRevisionRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);

  // Start on welcome screen unless an active project was explicitly cached
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      const cached = localStorage.getItem('formative_active_project_id');
      if (cached) return cached;
    } catch (_) {}
    return '';
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const cachedId = localStorage.getItem('formative_active_project_id');
      if (cachedId) return 'architecture';
    } catch (_) {}
    return 'welcome';
  });

  const [flowLayout, setFlowLayout] = useState<FlowLayout>('tree');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // AI Telemetry: NEVER connect automatically on startup!
  const [isTranscriptWatching, setIsTranscriptWatching] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AgentProvider>('claude-code');
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [activeSession, setActiveSession] = useState<AgentSession | null>(null);
  const [rawAgentSteps, setRawAgentSteps] = useState<AgentTranscriptStep[]>([]);

  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);

  const flowInstanceRef = useRef<any>(null);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const activeProject = useMemo(
    () => (activeProjectId ? projects.find((p) => p.id === activeProjectId) || null : null),
    [projects, activeProjectId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(activeProject?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeProject?.edges || []);
  const [canvasProjectId, setCanvasProjectId] = useState<string | null>(null);

  const writeProjectsToDisk = useCallback(async (snapshot: Project[]) => {
    if (!window.formativeApi) return true;
    const revision = ++projectSaveRevisionRef.current;
    setProjectSaveState('saving');
    setProjectSaveError(null);
    try {
      const result = await window.formativeApi.saveProjects(snapshot);
      if (!result.success) throw new Error(result.error || 'Formative could not save project data.');
      if (revision === projectSaveRevisionRef.current) setProjectSaveState('saved');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Formative could not save project data.';
      if (revision === projectSaveRevisionRef.current) {
        setProjectSaveState('error');
        setProjectSaveError(message);
      }
      return false;
    }
  }, []);

  const persistProjects = useCallback((updatedProjects: Project[], immediate = false) => {
    projectsRef.current = updatedProjects;
    setProjects(updatedProjects);
    let localCacheSaved = true;
    try {
      localStorage.setItem('formative_projects', JSON.stringify(updatedProjects));
    } catch (error) {
      localCacheSaved = false;
      console.error('Unable to update the local project cache:', error);
    }

    if (!window.formativeApi) {
      setProjectSaveState(localCacheSaved ? 'saved' : 'error');
      setProjectSaveError(localCacheSaved ? null : 'The preview storage limit was reached.');
      return Promise.resolve(localCacheSaved);
    }

    if (projectSaveTimerRef.current !== null) {
      window.clearTimeout(projectSaveTimerRef.current);
      projectSaveTimerRef.current = null;
    }

    if (immediate) return writeProjectsToDisk(updatedProjects);

    setProjectSaveState('saving');
    projectSaveTimerRef.current = window.setTimeout(() => {
      projectSaveTimerRef.current = null;
      void writeProjectsToDisk(projectsRef.current);
    }, 350);
    return Promise.resolve(true);
  }, [writeProjectsToDisk]);

  const flushPendingProjectSave = useCallback(() => {
    if (projectSaveTimerRef.current !== null) {
      window.clearTimeout(projectSaveTimerRef.current);
      projectSaveTimerRef.current = null;
    }
    if (window.formativeApi) void writeProjectsToDisk(projectsRef.current);
  }, [writeProjectsToDisk]);

  const nodeTypes = useMemo(
    () => ({
      paperclipCard: PaperclipCardNode,
      archNode: PaperclipCardNode,
      agentStepNode: AgentStepNode,
      noteNode: NoteNode,
    }),
    []
  );

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('formative_theme', next);
      return next;
    });
  };

  const showToast = useCallback((msg: string, action?: ToastAction) => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToastMessage({ text: msg, action });
    toastTimerRef.current = window.setTimeout(() => {
      toastTimerRef.current = null;
      setToastMessage(null);
    }, action ? 5000 : 3000);
  }, []);

  const activeSkills: SkillDepartment[] = useMemo(() => {
    return activeProject?.officeConfig?.activeSkills || [];
  }, [activeProject]);

  const handleToggleSkill = useCallback((skill: SkillDepartment) => {
    if (!activeProject) {
      showToast('Choose a project before changing its office settings.');
      return;
    }
    const current = activeProject.officeConfig?.activeSkills || [];
    const updatedSkills = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];

    const updatedProjects = projectsRef.current.map(p => p.id === activeProject.id
      ? { ...p, officeConfig: { ...p.officeConfig, activeSkills: updatedSkills } }
      : p
    );
    void persistProjects(updatedProjects, true);
    showToast(current.includes(skill) ? 'Specialist skill unassigned.' : 'Specialist skill activated.');
  }, [activeProject, persistProjects, showToast]);

  // Sync canvas with active project in Architecture mode
  useEffect(() => {
    if (isProjectStoreReady && activeProject && viewMode === 'architecture') {
      setCanvasProjectId(null);
      const projectNodes = activeProject.nodes || [];
      const projectEdges = activeProject.edges || [];
      setNodes(projectNodes);
      setEdges(projectEdges);
      setSelectedNodeId(null);
      setCanvasProjectId(activeProject.id);
    }
  }, [activeProjectId, isProjectStoreReady, viewMode]);

  // The desktop store is authoritative. localStorage remains a recovery cache for preview/runtime failures.
  useEffect(() => {
    let cancelled = false;
    const initData = async () => {
      if (!window.formativeApi) {
        setIsProjectStoreReady(true);
        return;
      }
      try {
        const saved = await window.formativeApi.getSavedProjects();
        if (cancelled) return;
        if (!Array.isArray(saved)) {
          if (projectsRef.current.length > 0) {
            setProjectSaveState('error');
            setProjectSaveError('Recovered project data is available in the local cache, but the desktop project file could not be read.');
          } else {
            setProjectSaveState('saved');
            setProjectSaveError(null);
          }
          return;
        }
        projectsRef.current = saved;
        setProjects(saved);
        setProjectSaveState('saved');
        setProjectSaveError(null);
        if (activeProjectId && !saved.some((project) => project.id === activeProjectId)) {
          setActiveProjectId('');
          setViewMode('welcome');
          localStorage.removeItem('formative_active_project_id');
        }
      } catch (error) {
        console.error('Unable to load saved projects:', error);
        setProjectSaveState('error');
        setProjectSaveError('Saved projects could not be loaded. Your local recovery copy is still available.');
      } finally {
        if (!cancelled) setIsProjectStoreReady(true);
      }
    };

    void initData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => flushPendingProjectSave();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      flushPendingProjectSave();
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, [flushPendingProjectSave]);

  useEffect(() => {
    if (viewMode !== 'architecture') setCanvasProjectId(null);
  }, [viewMode]);

  // Keep the desktop project record in sync with canvas edits, even when the user never presses Save.
  useEffect(() => {
    if (!isProjectStoreReady || viewMode !== 'architecture' || !activeProject || canvasProjectId !== activeProject.id) return;
    const sameCanvas = JSON.stringify({ nodes, edges }) === JSON.stringify({
      nodes: activeProject.nodes || [],
      edges: activeProject.edges || [],
    });
    if (sameCanvas) return;

    const updatedProjects = projectsRef.current.map((project) => project.id === activeProject.id
      ? { ...project, nodes, edges, updatedAt: new Date().toISOString() }
      : project
    );
    void persistProjects(updatedProjects);
  }, [activeProject, canvasProjectId, edges, isProjectStoreReady, nodes, persistProjects, viewMode]);

  const flushCanvasChanges = useCallback(() => {
    if (activeProjectId && viewMode === 'architecture') {
      const updatedProjects = projectsRef.current.map((project) => project.id === activeProjectId
        ? { ...project, nodes, edges, updatedAt: new Date().toISOString() }
        : project
      );
      return persistProjects(updatedProjects, true);
    }
    flushPendingProjectSave();
    return Promise.resolve(true);
  }, [activeProjectId, edges, flushPendingProjectSave, nodes, persistProjects, viewMode]);

  const clearActiveTranscript = useCallback(() => {
    setActiveSession(null);
    setIsTranscriptWatching(false);
    setRawAgentSteps([]);
    if (window.formativeApi) void window.formativeApi.stopWatchingTranscript();
  }, []);

  const selectProject = useCallback(async (id: string) => {
    if (!projectsRef.current.some((project) => project.id === id)) return;
    const saved = await flushCanvasChanges();
    if (!saved) {
      showToast('Recent project changes could not be saved. Try again before switching.');
      return;
    }
    if (activeProjectId !== id) clearActiveTranscript();
    setActiveProjectId(id);
    localStorage.setItem('formative_active_project_id', id);
    setViewMode('architecture');
  }, [activeProjectId, clearActiveTranscript, flushCanvasChanges, showToast]);

  const requestViewMode = useCallback(async (mode: ViewMode) => {
    if (mode === 'welcome') {
      const saved = await flushCanvasChanges();
      if (!saved) {
        showToast('Recent project changes could not be saved. Try again before leaving.');
        return;
      }
      setViewMode('welcome');
      return;
    }
    if (!activeProject) {
      setViewMode('welcome');
      showToast('Choose a project before opening this area.');
      return;
    }
    const saved = await flushCanvasChanges();
    if (!saved) {
      showToast('Recent project changes could not be saved. Try again before switching.');
      return;
    }
    setViewMode(mode);
  }, [activeProject, flushCanvasChanges, showToast]);

  // Fetch provider sessions on demand
  const fetchProviderSessions = useCallback(async (provider: AgentProvider) => {
    if (provider === 'custom') {
      setSessions([]);
      return;
    }
    if (!activeProject) {
      setSessions([]);
      showToast('Choose a project before looking for agent transcripts.');
      return;
    }
    if (!window.formativeApi) {
      setSessions([]);
      showToast('Agent transcript discovery is available in the desktop app.');
      return;
    }
    try {
      const result = await window.formativeApi.getAgentSessions(provider);
      setSessions(result.sessions || []);
      if (!result.success) showToast(result.error || 'Formative could not find readable transcripts.');
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
      showToast(error instanceof Error ? error.message : 'Formative could not find readable transcripts.');
    }
  }, [activeProject, showToast]);

  const handleChangeProvider = (provider: AgentProvider) => {
    setSelectedProvider(provider);
    fetchProviderSessions(provider);
  };

  useEffect(() => {
    if (viewMode === 'agent-flow' && !activeSession) {
      fetchProviderSessions(selectedProvider);
    }
  }, [viewMode, selectedProvider, activeSession, fetchProviderSessions]);

  const handleConnectSession = async (sess: AgentSession) => {
    if (!activeProject) {
      showToast('Choose a project before opening a transcript.');
      return;
    }
    const saved = await flushCanvasChanges();
    if (!saved) {
      showToast('Recent project changes could not be saved. Try again before switching.');
      return;
    }
    setActiveSession(sess);
    setIsTranscriptWatching(false);
    setRawAgentSteps([]);
    setViewMode('agent-flow');
    showToast(`Opened ${sess.provider} transcript.`);
  };

  const handleDisconnectAi = () => {
    setActiveSession(null);
    setIsTranscriptWatching(false);
    setRawAgentSteps([]);
    if (window.formativeApi) {
      void window.formativeApi.stopWatchingTranscript();
    }
    showToast('Transcript closed.');
  };

  useEffect(() => {
    let cancelled = false;
    let cleanupWatcher: (() => void) | undefined;

    const streamSession = async () => {
      if (!activeSession) return;
      if (!window.formativeApi) {
        setIsTranscriptWatching(false);
        showToast('Transcript monitoring is available in the desktop app.');
        return;
      }

      try {
        const response = await window.formativeApi.readTranscript(activeSession.transcriptPath);
        if (cancelled) return;
        if (!response.success) {
          setIsTranscriptWatching(false);
          showToast(response.error || 'This transcript could not be opened.');
          return;
        }
        const steps = response.steps || [];
        setRawAgentSteps(steps);
        if (steps.length > 0) {
          if (viewMode === 'agent-flow') {
            transformStepsToNodes(steps, flowLayout);
          }
        }

        const watchResult = await window.formativeApi.startWatchingTranscript(activeSession.transcriptPath);
        if (cancelled) return;
        if (!watchResult.success) {
          setIsTranscriptWatching(false);
          showToast(watchResult.error || 'Formative could not monitor this transcript.');
          return;
        }
        setIsTranscriptWatching(true);
        cleanupWatcher = window.formativeApi.onLiveTranscriptUpdate((updatedSteps) => {
          if (!cancelled && updatedSteps && Array.isArray(updatedSteps)) {
            setRawAgentSteps(updatedSteps);
            if (viewMode === 'agent-flow') {
              transformStepsToNodes(updatedSteps, flowLayout);
            }
          }
        });
      } catch (e) {
        if (cancelled) return;
        console.error('Stream error:', e);
        setIsTranscriptWatching(false);
        showToast('Formative could not read this transcript.');
      }
    };

    streamSession();

    return () => {
      cancelled = true;
      if (cleanupWatcher) cleanupWatcher();
      setIsTranscriptWatching(false);
      if (window.formativeApi) void window.formativeApi.stopWatchingTranscript();
    };
  }, [viewMode, activeSession, flowLayout, showToast]);

  const transformStepsToNodes = useCallback(
    (steps: AgentTranscriptStep[], layout: FlowLayout) => {
      if (!steps || steps.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }

      const meaningful = steps.filter(
        (s) => s.type === 'USER_INPUT' || (s.type === 'PLANNER_RESPONSE' && s.tool_calls) || s.content
      );

      const recent = meaningful.slice(-14);
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      let userColIndex = 0;
      let toolColIndex = 0;
      let modelColIndex = 0;

      recent.forEach((step, idx) => {
        const id = `step-${step.step_index || idx}`;

        let toolName = '';
        let argsPreview = '';

        if (step.tool_calls && step.tool_calls.length > 0) {
          const t = step.tool_calls[0];
          toolName = t.name;
          const raw = t.args || t.parameters;
          if (raw) {
            argsPreview = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 1);
          }
        }

        const isUser = step.type === 'USER_INPUT';
        const isTool = !!toolName;
        let posX = 100;
        let posY = 100;

        if (layout === 'tree') {
          if (isUser) {
            posX = 80;
            posY = 100 + userColIndex * 220;
            userColIndex++;
          } else if (isTool) {
            posX = 540;
            posY = 100 + toolColIndex * 220;
            toolColIndex++;
          } else {
            posX = 1000;
            posY = 100 + modelColIndex * 240;
            modelColIndex++;
          }
        } else {
          posX = 260;
          posY = 80 + idx * 190;
        }

        const cleanSummary = typeof step.cleanContent === 'string'
          ? step.cleanContent
          : typeof step.content === 'string' ? step.content : '';

        newNodes.push({
          id,
          type: 'agentStepNode',
          position: { x: posX, y: posY },
          data: {
            label: isUser ? 'User Instruction' : isTool ? `Tool: ${toolName}` : 'Agent Reasoning',
            stepIndex: step.step_index || idx + 1,
            status: step.status === 'ERROR' ? 'error' : step.status === 'RUNNING' ? 'running' : 'done',
            toolUsed: toolName || undefined,
            argsPreview: argsPreview || undefined,
            thought: step.thinking || undefined,
            description: cleanSummary ? cleanSummary.slice(0, 180) : undefined,
          },
        });

        if (idx > 0) {
          const prevId = `step-${recent[idx - 1].step_index || idx - 1}`;
          newEdges.push({
            id: `edge-${prevId}-${id}`,
            source: prevId,
            target: id,
            animated: false,
            style: { stroke: '#52525b', strokeWidth: 1.5 },
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges]
  );

  const handleScanDirectory = async (customPath?: unknown) => {
    if (!window.formativeApi) {
      showToast('Choose a project folder in the desktop app to scan it.');
      return;
    }

    try {
      let targetPath = typeof customPath === 'string' ? customPath : undefined;
      if (!targetPath) targetPath = (await window.formativeApi.selectDirectory()) || undefined;
      if (!targetPath) return;

      showToast('Reading project files…');
      const res = await window.formativeApi.scanProjectDirectory(targetPath);
      if (!res.success || !res.project) {
        showToast(res.error || 'Project scan failed.');
        return;
      }

      const newProject = res.project;
      const saved = await flushCanvasChanges();
      if (!saved) {
        showToast('Recent project changes could not be saved. Try the scan again.');
        return;
      }
      const existingProject = projectsRef.current.find((project) => project.id === newProject.id);
      const projectToOpen = existingProject || newProject;
      let persisted = true;
      if (!existingProject) {
        persisted = await persistProjects([newProject, ...projectsRef.current], true);
      }
      if (activeProjectId !== projectToOpen.id) clearActiveTranscript();
      setActiveProjectId(projectToOpen.id);
      localStorage.setItem('formative_active_project_id', projectToOpen.id);
      setViewMode('architecture');
      setIsLaunchpadOpen(false);
      showToast(existingProject
        ? `Opened ${existingProject.name}; saved canvas and tasks were kept.`
        : persisted
          ? `Created a limited folder map for ${newProject.name}. It is not a dependency analysis.`
          : 'Project opened in recovery storage; desktop saving has a problem.');
    } catch (error) {
      console.error('Project scan failed:', error);
      showToast(error instanceof Error ? error.message : 'Project scan failed.');
    }
  };

  const handleSelectCustomTranscript = async () => {
    if (!window.formativeApi) {
      showToast('Transcript files can be opened in the desktop app.');
      return;
    }
    if (!activeProject) {
      showToast('Choose a project before opening a transcript.');
      return;
    }
    try {
      const file = await window.formativeApi.selectTranscriptFile();
      if (!file) return;
      const customSession: AgentSession = {
        id: file,
        title: `Transcript (${file.split(/[\\/]/).pop()})`,
        provider: 'Custom',
        transcriptPath: file,
        updatedAt: Date.now(),
        lineCount: 0,
      };
      await handleConnectSession(customSession);
      setIsLaunchpadOpen(false);
    } catch (error) {
      console.error('Transcript selection failed:', error);
      showToast(error instanceof Error ? error.message : 'Transcript selection failed.');
    }
  };

  const handleCreateBlankProject = async (name: string, type: ProjectType) => {
    const saved = await flushCanvasChanges();
    if (!saved) {
      showToast('Recent project changes could not be saved. Try again before creating a project.');
      return;
    }
    const newProj: Project = {
      id: createLocalId('proj'),
      name,
      description: 'Blank project',
      type,
      updatedAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      issues: [],
      officeConfig: { activeSkills: [] },
    };

    const persisted = await persistProjects([newProj, ...projectsRef.current], true);
    clearActiveTranscript();
    setActiveProjectId(newProj.id);
    localStorage.setItem('formative_active_project_id', newProj.id);
    setViewMode('architecture');
    showToast(persisted ? `Created project: ${name}` : 'Project created in recovery storage; desktop saving has a problem.');
  };

  const handleCreateProject = async (project: Project) => {
    const saved = await flushCanvasChanges();
    if (!saved) {
      showToast('Recent project changes could not be saved. Try creating the project again.');
      return;
    }
    const persisted = await persistProjects([project, ...projectsRef.current], true);
    clearActiveTranscript();
    setActiveProjectId(project.id);
    localStorage.setItem('formative_active_project_id', project.id);
    setViewMode('architecture');
    showToast(persisted ? `Created project: ${project.name}` : 'Project created in recovery storage; desktop saving has a problem.');
  };

  const handleLoadTemplate = async (template?: Project) => {
    const tmpl = template || SAMPLE_TEMPLATES[0];
    const laidOutNodes = hierarchicalTreeLayout(tmpl.nodes.map((node) => ({
      ...node,
      data: { ...node.data, status: 'idle' },
    })), tmpl.edges.map((edge) => ({ ...edge, animated: false })));
    const newProj: Project = {
      ...tmpl,
      nodes: laidOutNodes,
      id: createLocalId('proj'),
      source: 'starter-example',
      updatedAt: new Date().toISOString(),
      issues: [],
    };

    const saved = await flushCanvasChanges();
    if (!saved) {
      showToast('Recent project changes could not be saved. Try again.');
      return;
    }
    const persisted = await persistProjects([newProj, ...projectsRef.current], true);
    clearActiveTranscript();
    setActiveProjectId(newProj.id);
    localStorage.setItem('formative_active_project_id', newProj.id);
    setViewMode('architecture');
    showToast(persisted ? `Opened the ${newProj.name} starter example.` : 'Example opened in recovery storage; desktop saving has a problem.');
  };

  const handleDeleteProject = useCallback(async (id: string) => {
    const removed = projectsRef.current.find((project) => project.id === id);
    if (!removed) return;
    const confirmed = window.confirm(
      `Remove “${removed.name}” from Formative? Its saved canvas and tasks will be removed from the app. Files in the project folder will not be deleted. You can undo for a few seconds.`
    );
    if (!confirmed) return;

    if (activeProjectId === id && !(await flushCanvasChanges())) {
      showToast('Recent project changes could not be saved. The project was kept.');
      return;
    }
    const updatedProjects = projectsRef.current.filter((project) => project.id !== id);
    const saved = await persistProjects(updatedProjects, true);
    if (!saved) {
      await persistProjects([...projectsRef.current, removed], true);
      showToast('Formative could not save the removal. The project was kept.');
      return;
    }
    const wasActive = activeProjectId === id;
    if (wasActive) {
      setActiveProjectId('');
      localStorage.removeItem('formative_active_project_id');
      setViewMode('welcome');
      setActiveSession(null);
      setIsTranscriptWatching(false);
    }

    showToast('Project removed from Formative.', {
      label: 'Undo',
      onClick: () => {
        void persistProjects([...projectsRef.current, removed], true);
        if (wasActive) {
          setActiveProjectId(removed.id);
          localStorage.setItem('formative_active_project_id', removed.id);
          setViewMode('architecture');
        }
        setToastMessage(null);
      },
    });
  }, [activeProjectId, flushCanvasChanges, persistProjects, showToast]);

  const handleUpdateProjectIssues = useCallback((updatedIssues: IssueItem[], nextTaskNumber?: number) => {
    if (!activeProject) return;
    const updatedProjects = projectsRef.current.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          issues: updatedIssues,
          ...(typeof nextTaskNumber === 'number' ? { nextTaskNumber } : {}),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    void persistProjects(updatedProjects, true);
  }, [activeProject, persistProjects]);

  const handleSave = useCallback(async () => {
    if (!activeProject) return;

    const updated = projectsRef.current.map((p) => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          nodes,
          edges,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    const saved = await persistProjects(updated, true);
    showToast(saved ? 'Project saved.' : 'Formative could not save this project.');
  }, [activeProject, activeProjectId, edges, nodes, persistProjects, showToast]);

  // Hierarchical Auto-Layout using Paperclip's exact recursive algorithm
  const handleAutoLayout = useCallback(() => {
    setNodes((nds) => {
      return hierarchicalTreeLayout(nds, edges);
    });
    showToast('Hierarchical layout organized with zero overlaps.');
  }, [edges, setNodes]);

  const handleFitView = useCallback(() => {
    if (flowInstanceRef.current) {
      flowInstanceRef.current.fitView({ padding: 0.2 });
    }
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: false }, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback(
    (category: NodeCategory, screenX?: number, screenY?: number) => {
      if (!activeProject) {
        showToast('Choose a project before editing the canvas.');
        return;
      }
      const bounds = flowContainerRef.current?.getBoundingClientRect();
      const screenPoint = typeof screenX === 'number' && typeof screenY === 'number'
        ? { x: screenX, y: screenY }
        : bounds
          ? { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
          : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const base = flowInstanceRef.current?.screenToFlowPosition(screenPoint) || { x: 300, y: 200 };
      let position = base;
      for (let attempt = 0; attempt < 250; attempt += 1) {
        const column = attempt % 5;
        const row = Math.floor(attempt / 5);
        const candidate = { x: base.x + column * 300, y: base.y + row * 190 };
        const overlaps = nodes.some((node) =>
          Math.abs(node.position.x - candidate.x) < 280 && Math.abs(node.position.y - candidate.y) < 170
        );
        if (!overlaps) {
          position = candidate;
          break;
        }
      }
      const id = `node-${Date.now()}`;
      const newNode: Node = {
        id,
        type: category === 'note' ? 'noteNode' : 'paperclipCard',
        position,
        data: {
          label: `New ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          category,
          subtitle: './src/module',
          description: 'Interface contracts and component boundary.',
          status: 'idle',
          tags: [category.toUpperCase()],
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(id);
    },
    [activeProject, nodes, setNodes, showToast]
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const target = nodes.find((n) => n.id === nodeId);
      if (!target) return;
      const newId = `node-${Date.now()}`;
      const clone: Node = {
        ...target,
        id: newId,
        position: { x: target.position.x + 40, y: target.position.y + 40 },
        data: { ...target.data, label: `${target.data.label} (Copy)` },
      };
      setNodes((nds) => [...nds, clone]);
      setSelectedNodeId(newId);
      showToast('Component duplicated.');
    },
    [nodes, setNodes]
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      if (selectedNodeId === id) setSelectedNodeId(null);
      showToast('Component removed.');
    },
    [selectedNodeId, setNodes, setEdges]
  );

  const handleDisconnectNode = useCallback(
    (nodeId: string) => {
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      showToast('Wires disconnected.');
    },
    [setEdges]
  );

  const handleUpdateNode = useCallback(
    (id: string, updatedData: Partial<ArchNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                ...updatedData,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  const onPaneContextMenu = useCallback(
    (event: any) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  const onNodeContextMenu = useCallback(
    (event: any, node: Node) => {
      event.preventDefault();
      setSelectedNodeId(node.id);
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const n = nodes.find((node) => node.id === selectedNodeId);
    if (!n) return null;
    return { id: n.id, data: n.data as ArchNodeData };
  }, [nodes, selectedNodeId]);

  const isDark = theme !== 'light';

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans theme-${theme} ${
      isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#ffffff] text-zinc-900'
    }`}>
      {/* 1. DUAL-RAIL LEFT NAVIGATION (Paperclip Shell) */}
      <PaperclipNav
        theme={theme}
        onToggleTheme={toggleTheme}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={selectProject}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={requestViewMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenLaunchpad={() => setIsLaunchpadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isTranscriptWatching={isTranscriptWatching}
        activeSkills={activeSkills}
        onOpenSkills={() => { void requestViewMode('operations-floor'); }}
      />

      {/* 2. MAIN WORKSPACE FRAME */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Paperclip Top Header Bar */}
        <header className={`h-12 border-b px-3 xl:px-5 flex items-center justify-between gap-2 shrink-0 select-none z-20 ${
          isDark ? 'bg-[#09090b] border-[#27272a] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-800'
        }`}>
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => { void requestViewMode('welcome'); }}
              className={`font-medium transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}
            >
              {activeProject ? activeProject.name : 'Formative'}
            </button>
            <span className="text-zinc-600">/</span>
        <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {viewMode === 'architecture'
                ? (activeProject?.source === 'folder-map' ? 'Folder Map' : 'Project Canvas')
                : viewMode === 'org-chart'
                ? 'Agent Team'
                : viewMode === 'issues'
                ? 'Tasks & Issues'
                : viewMode === 'operations-floor'
                ? 'Office Floor'
                : viewMode === 'agent-flow'
                ? 'Session Activity'
                : 'Welcome'}
            </span>
          </div>

          {/* Right: Context Actions */}
          <div className="flex items-center gap-2.5">
            {viewMode === 'architecture' && activeProject && (
              <>
                <button
                  onClick={handleAutoLayout}
                  title="Arrange the canvas into a tree layout"
                  className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Arrange</span>
                </button>

                <button
                  onClick={handleFitView}
                  title="Fit the view to all canvas items"
                  className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                    isDark ? 'bg-[#18181c] border-[#27272a] text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fit</span>
                </button>

                <button
                  onClick={handleSave}
                  title="Save architecture"
                  className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                    isDark ? 'bg-[#18181c] border-[#27272a] text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </>
            )}

            {viewMode === 'org-chart' && (
              <div className={`text-xs px-3 py-1 rounded-full border flex items-center gap-2 ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Project organization</span>
              </div>
            )}

            {viewMode === 'agent-flow' && activeSession && (
              <button
                type="button"
                onClick={handleDisconnectAi}
                className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                  isDark ? 'bg-[#18181c] border-[#27272a] text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Close transcript
              </button>
            )}

            {/* Quick Guide Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              title="Open Architecture Guide 101"
              className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                isDark ? 'bg-[#18181c] border-[#27272a] text-zinc-400 hover:text-white hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Guide 101</span>
            </button>
          </div>
        </header>

        {/* Floating Status Notification */}
        {toastMessage && (
          <div role="status" aria-live="polite" className={`absolute bottom-9 left-1/2 -translate-x-1/2 z-50 px-3.5 py-2 rounded-lg border text-xs font-mono shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            isDark ? 'bg-[#18181c] border-[#27272a] text-white' : 'bg-white border-zinc-300 text-black'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${projectSaveState === 'error' ? 'bg-red-400' : 'bg-zinc-400'}`} />
            <span>{toastMessage.text}</span>
            {toastMessage.action && (
              <button
                type="button"
                onClick={toastMessage.action.onClick}
                className={`font-semibold underline underline-offset-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}
              >
                {toastMessage.action.label}
              </button>
            )}
          </div>
        )}

        {/* Main Viewport Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col min-h-0 min-w-0">
          {viewMode === 'org-chart' ? (
            <OrgChartView theme={theme} onOpenSessionActivity={() => { void requestViewMode('agent-flow'); }} />
          ) : viewMode === 'issues' ? (
            <IssuesView 
              theme={theme} 
              activeProject={activeProject}
              onUpdateProjectIssues={handleUpdateProjectIssues}
            />
          ) : viewMode === 'welcome' || (!activeProject && viewMode !== 'agent-flow') ? (
            <WelcomeScreen
              theme={theme}
              projects={projects}
              hasActiveProject={Boolean(activeProject)}
              onOpenProject={selectProject}
              onScanDirectory={handleScanDirectory}
              onNewProject={() => setIsNewProjectOpen(true)}
              onOpenAiTelemetry={() => { void requestViewMode('agent-flow'); }}
              onLoadTemplate={handleLoadTemplate}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onDeleteProject={handleDeleteProject}
            />
          ) : viewMode === 'operations-floor' && activeProject ? (
            <OfficeFloorView
              theme={theme}
              latestStep={rawAgentSteps.length > 0 ? rawAgentSteps[rawAgentSteps.length - 1] : undefined}
              isAiStreaming={false}
              layoutTheme="studio"
              activeSkills={activeSkills}
              onToggleSkill={handleToggleSkill}
            />
          ) : viewMode === 'agent-flow' && !activeSession ? (
            <TelemetryConnectView
              theme={theme}
              selectedProvider={selectedProvider}
              onChangeProvider={handleChangeProvider}
              sessions={sessions}
              onSelectSession={handleConnectSession}
              onRefreshSessions={() => fetchProviderSessions(selectedProvider)}
              onSelectCustomFile={handleSelectCustomTranscript}
            />
          ) : (
            /* Project canvas, or read-only transcript map */
            <div className="flex flex-1 w-full h-full min-h-0 min-w-0 overflow-hidden relative">
              {viewMode === 'architecture' && (
                <Sidebar
                  theme={theme}
                  onAddNode={(cat) => handleAddNode(cat)}
                  nodeCount={nodes.length}
                  edgeCount={edges.length}
                />
              )}

              <div ref={flowContainerRef} className="flex-1 w-full h-full min-h-0 min-w-0 relative">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={viewMode === 'architecture' ? onConnect : undefined}
                  nodeTypes={nodeTypes}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                  onPaneClick={() => setSelectedNodeId(null)}
                  onPaneContextMenu={viewMode === 'architecture' ? onPaneContextMenu : undefined}
                  onNodeContextMenu={viewMode === 'architecture' ? onNodeContextMenu : undefined}
                  nodesDraggable={viewMode === 'architecture'}
                  nodesConnectable={viewMode === 'architecture'}
                  onInit={(instance) => {
                    flowInstanceRef.current = instance;
                  }}
                  fitView
                  minZoom={0.2}
                  maxZoom={2}
                  defaultEdgeOptions={{
                    animated: false,
                    style: { stroke: isDark ? '#3f3f46' : '#d4d4d8', strokeWidth: 1.5 },
                  }}
                >
                  <Background 
                    color={isDark ? '#27272a' : '#e4e4e7'} 
                    gap={24} 
                    size={1} 
                    variant={BackgroundVariant.Dots} 
                  />
                  <Controls position="bottom-left" showInteractive={false} />
                  <MiniMap position="bottom-right" />

                  {/* Mode Banner Indicator */}
                  <Panel position="top-left" className="m-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono shadow-sm ${
                      isDark ? 'bg-[#121215] border-[#27272a] text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
                    }`}>
                      {viewMode === 'architecture' ? (
                        <>
                          <Layers className="w-3.5 h-3.5 text-blue-400" />
                          <span>{activeProject?.source === 'folder-map' ? 'FOLDER MAP' : 'PROJECT CANVAS'}: {activeProject?.name || 'Untitled'} ({nodes.length} items)</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>TRANSCRIPT: {activeSession?.provider || 'Transcript'} ({nodes.length} events)</span>
                        </>
                      )}
                    </div>
                  </Panel>
                </ReactFlow>
              </div>

              {viewMode === 'architecture' && selectedNode && (
                <Inspector
                  theme={theme}
                  selectedNode={selectedNode}
                  onClose={() => setSelectedNodeId(null)}
                  onUpdateNode={handleUpdateNode}
                  onDeleteNode={handleDeleteNode}
                />
              )}
            </div>
          )}
        </div>

        {/* Right Click Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            nodeId={contextMenu.nodeId}
            onClose={() => setContextMenu(null)}
            onAddNode={(cat, px, py) => handleAddNode(cat, px + 220, py + 24)}
            onDuplicateNode={handleDuplicateNode}
            onDeleteNode={handleDeleteNode}
            onDisconnectNode={handleDisconnectNode}
            onAutoLayout={handleAutoLayout}
            onFitView={handleFitView}
          />
        )}

        {/* Interactive Architecture Beginner Guide & 101 Modal */}
        <InteractiveGuide
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          theme={theme}
          onSpawnComponent={(category) => {
            handleAddNode(category);
            setIsGuideOpen(false);
            void requestViewMode('architecture');
          }}
        />

        {/* Interactive First-Run Onboarding Modal */}
        <OnboardingModal
          theme={theme}
          isOpen={isOnboardingOpen}
          onClose={() => {
            try { localStorage.setItem('formative_onboarded', 'true'); } catch {}
            setIsOnboardingOpen(false);
          }}
          onScanDirectory={handleScanDirectory}
          onCreateBlank={handleCreateBlankProject}
          onLoadTemplate={handleLoadTemplate}
          onSelectProvider={(prov) => {
            setSelectedProvider(prov);
          }}
        />

        {/* New Architecture Project Modal */}
        <NewProjectModal
          theme={theme}
          isOpen={isNewProjectOpen}
          onClose={() => setIsNewProjectOpen(false)}
          onCreateProject={handleCreateProject}
        />

        {/* Studio Preferences & Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Studio Launchpad */}
        <LaunchpadModal
          theme={theme}
          isOpen={isLaunchpadOpen}
          onClose={() => setIsLaunchpadOpen(false)}
          sessions={sessions}
          selectedProvider={selectedProvider}
          onChangeProvider={handleChangeProvider}
          onSelectSession={(sess) => {
            handleConnectSession(sess);
            setIsLaunchpadOpen(false);
          }}
          onScanDirectory={handleScanDirectory}
          onSelectCustomTranscript={handleSelectCustomTranscript}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={selectProject}
          onCreateBlankProject={handleCreateBlankProject}
          onDeleteProject={handleDeleteProject}
          onLoadTemplate={handleLoadTemplate}
        />

        {/* Desktop Application Bottom Status Bar */}
        <footer className={`h-7 border-t px-2.5 xl:px-4 flex items-center justify-between gap-3 text-[10px] xl:text-xs font-mono select-none z-30 shrink-0 min-w-0 ${
          isDark ? 'bg-[#0c0c0e] border-[#27272a] text-zinc-500' : 'bg-[#fafafa] border-zinc-200 text-zinc-600'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeProject ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
            <span className={`truncate max-w-[28vw] ${activeProject ? (isDark ? 'text-zinc-300' : 'text-black') : ''}`}>
              {activeProject ? activeProject.name : 'Choose a project'}
            </span>
            {activeProject && <span className="hidden xl:inline shrink-0">{nodes.length} {activeProject.source === 'folder-map' ? 'items' : 'components'} · {edges.length} connections</span>}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span title={projectSaveError || undefined} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${projectSaveState === 'error' ? 'bg-red-400' : projectSaveState === 'saving' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{!isProjectStoreReady ? 'Loading projects' : projectSaveState === 'error' ? 'Save issue' : projectSaveState === 'saving' ? 'Saving' : window.formativeApi ? 'Saved' : 'Preview storage'}</span>
            </span>
            <span className="hidden sm:inline text-zinc-400">
              {activeSession ? isTranscriptWatching ? 'Watching transcript' : 'Transcript selected' : 'No transcript selected'}
            </span>
            <span className="hidden 2xl:inline border-l border-zinc-700 pl-2 text-zinc-500">Agent runs unavailable</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
