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
import { DEFAULT_PROJECTS, SAMPLE_TEMPLATES } from './data/defaultProjects';
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
      getAgentSessions: (providerId?: string) => Promise<AgentSession[]>;
      readTranscript: (path: string) => Promise<any[]>;
      startWatchingTranscript: (path: string) => Promise<{ success: boolean }>;
      stopWatchingTranscript: () => Promise<{ success: boolean }>;
      onLiveTranscriptUpdate: (cb: (steps: any[]) => void) => () => void;
    };
  }
}

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
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AgentProvider>('claude-code');
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [activeSession, setActiveSession] = useState<AgentSession | null>(null);
  const [rawAgentSteps, setRawAgentSteps] = useState<AgentTranscriptStep[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);

  const flowInstanceRef = useRef<any>(null);

  const activeProject = useMemo(
    () => (activeProjectId ? projects.find((p) => p.id === activeProjectId) || null : null),
    [projects, activeProjectId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(activeProject?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeProject?.edges || []);

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

  const [standaloneSkills, setStandaloneSkills] = useState<SkillDepartment[]>(() => {
    try {
      const cached = localStorage.getItem('formative_standalone_skills');
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return [];
  });

  const activeSkills: SkillDepartment[] = useMemo(() => {
    if (activeProject) {
      return activeProject.officeConfig?.activeSkills || [];
    }
    return standaloneSkills;
  }, [activeProject, standaloneSkills]);

  const handleToggleSkill = useCallback((skill: SkillDepartment) => {
    if (activeProject) {
      const current = activeProject.officeConfig?.activeSkills || [];
      const updatedSkills = current.includes(skill)
        ? current.filter(s => s !== skill)
        : [...current, skill];

      const updatedProjects = projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            officeConfig: {
              ...p.officeConfig,
              activeSkills: updatedSkills,
            }
          };
        }
        return p;
      });

      setProjects(updatedProjects);
      localStorage.setItem('formative_projects', JSON.stringify(updatedProjects));
      if (window.formativeApi) {
        window.formativeApi.saveProjects(updatedProjects);
      }
      showToast(current.includes(skill) ? `Specialist skill unassigned.` : `Specialist skill activated!`);
    } else {
      setStandaloneSkills(prev => {
        const next = prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill];
        localStorage.setItem('formative_standalone_skills', JSON.stringify(next));
        showToast(prev.includes(skill) ? `Specialist skill unassigned.` : `Specialist skill activated!`);
        return next;
      });
    }
  }, [activeProject, projects]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync canvas with active project in Architecture mode
  useEffect(() => {
    if (activeProject && viewMode === 'architecture') {
      const projectNodes = activeProject.nodes || [];
      const projectEdges = activeProject.edges || [];
      setNodes(projectNodes);
      setEdges(projectEdges);
      setSelectedNodeId(null);
    }
  }, [activeProjectId, viewMode]);

  // Load saved projects on startup
  useEffect(() => {
    const initData = async () => {
      if (window.formativeApi) {
        try {
          const saved = await window.formativeApi.getSavedProjects();
          if (saved && Array.isArray(saved)) {
            setProjects(saved);
          }
        } catch (e) {
          console.error('Init projects error:', e);
        }
      }
    };

    initData();
  }, []);

  // Fetch provider sessions on demand
  const fetchProviderSessions = useCallback(async (provider: AgentProvider) => {
    if (!window.formativeApi) return;
    try {
      const found = await window.formativeApi.getAgentSessions(provider);
      setSessions(found || []);
    } catch (e) {
      console.error('Error fetching sessions:', e);
    }
  }, []);

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
    setActiveSession(sess);
    setIsAiStreaming(true);
    setViewMode('agent-flow');
    showToast(`Connected to ${sess.provider}.`);
  };

  const handleDisconnectAi = () => {
    setActiveSession(null);
    setIsAiStreaming(false);
    if (window.formativeApi) {
      window.formativeApi.stopWatchingTranscript();
    }
    showToast('AI Agent disconnected.');
  };

  useEffect(() => {
    let cleanupWatcher: (() => void) | undefined;

    const streamSession = async () => {
      if (!window.formativeApi || !activeSession) return;

      try {
        const steps = await window.formativeApi.readTranscript(activeSession.transcriptPath);
        if (steps && Array.isArray(steps)) {
          setRawAgentSteps(steps);
          if (viewMode === 'agent-flow') {
            transformStepsToNodes(steps, flowLayout);
          }
        }

        await window.formativeApi.startWatchingTranscript(activeSession.transcriptPath);
        cleanupWatcher = window.formativeApi.onLiveTranscriptUpdate((updatedSteps) => {
          if (updatedSteps && Array.isArray(updatedSteps)) {
            setRawAgentSteps(updatedSteps);
            if (viewMode === 'agent-flow') {
              transformStepsToNodes(updatedSteps, flowLayout);
            }
          }
        });
      } catch (e) {
        console.error('Stream error:', e);
      }
    };

    streamSession();

    return () => {
      if (cleanupWatcher) cleanupWatcher();
      if (window.formativeApi) window.formativeApi.stopWatchingTranscript();
    };
  }, [viewMode, activeSession, flowLayout]);

  const transformStepsToNodes = useCallback(
    (steps: AgentTranscriptStep[], layout: FlowLayout) => {
      if (!steps || steps.length === 0) return;

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
        const isLatest = idx === recent.length - 1;

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

        const cleanSummary = step.cleanContent || step.content || '';

        newNodes.push({
          id,
          type: 'agentStepNode',
          position: { x: posX, y: posY },
          data: {
            label: isUser ? 'User Instruction' : isTool ? `Tool: ${toolName}` : 'Agent Reasoning',
            stepIndex: step.step_index || idx + 1,
            status: isLatest ? 'running' : step.status === 'ERROR' ? 'error' : 'done',
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
            animated: isLatest,
            style: { stroke: isLatest ? '#ffffff' : '#52525b', strokeWidth: 1.5 },
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges]
  );

  const handleScanDirectory = async (customPath?: unknown) => {
    let targetPath = typeof customPath === 'string' ? customPath : undefined;

    if (!targetPath && window.formativeApi) {
      targetPath = (await window.formativeApi.selectDirectory()) || undefined;
    }

    if (!targetPath) return;

    if (window.formativeApi) {
      showToast(`Scanning: ${targetPath}...`);
      const res = await window.formativeApi.scanProjectDirectory(targetPath);
      if (res.success && res.project) {
        const newProj = res.project;
        setProjects((prev) => {
          const updated = [newProj, ...prev.filter((p) => p.id !== newProj.id)];
          localStorage.setItem('formative_projects', JSON.stringify(updated));
          if (window.formativeApi) {
            window.formativeApi.saveProjects(updated);
          }
          return updated;
        });
        setActiveProjectId(newProj.id);
        localStorage.setItem('formative_active_project_id', newProj.id);
        setViewMode('architecture');
        setIsLaunchpadOpen(false);
        showToast(`Mapped ${newProj.nodes.length} components.`);
      } else {
        showToast(`Scan failed: ${res.error || 'Unknown error'}`);
      }
    }
  };

  const handleSelectCustomTranscript = async () => {
    if (!window.formativeApi) return;
    const file = await window.formativeApi.selectTranscriptFile();
    if (file) {
      const customSession: AgentSession = {
        id: file,
        title: `Custom File (${file.split(/[\\/]/).pop()})`,
        provider: 'Custom',
        transcriptPath: file,
        updatedAt: Date.now(),
        lineCount: 1,
      };
      handleConnectSession(customSession);
      setIsLaunchpadOpen(false);
    }
  };

  const handleCreateBlankProject = (name: string, type: ProjectType) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      description: 'Software architecture canvas',
      type,
      updatedAt: new Date().toISOString(),
      nodes: [
        {
          id: 'root-1',
          type: 'paperclipCard',
          position: { x: 300, y: 160 },
          data: {
            label: `${name} Gateway`,
            category: 'gateway',
            subtitle: './src/gateway',
            description: 'Main ingress and API gateway handling routing and security tokens.',
            status: 'done',
            tags: ['Gateway', 'API'],
          },
        },
      ],
      edges: [],
      issues: [
        {
          id: `iss-${Date.now()}-1`,
          key: 'TASK-1',
          title: `Initial architecture design for ${name}`,
          status: 'in_progress',
          assignee: 'Chief Executive Agent',
          assigneeInitials: 'CEO',
          projectName: name,
          projectColor: '#3b82f6',
          isLive: true,
          date: 'Today',
          description: 'Establish initial system boundaries, ingress gateways, and database connections.'
        }
      ]
    };

    setProjects((prev) => {
      const updated = [newProj, ...prev];
      localStorage.setItem('formative_projects', JSON.stringify(updated));
      if (window.formativeApi) {
        window.formativeApi.saveProjects(updated);
      }
      return updated;
    });
    setActiveProjectId(newProj.id);
    localStorage.setItem('formative_active_project_id', newProj.id);
    setViewMode('architecture');
    showToast(`Created workspace: ${name}`);
  };

  const handleCreateProject = (project: Project) => {
    setProjects((prev) => {
      const updated = [project, ...prev];
      localStorage.setItem('formative_projects', JSON.stringify(updated));
      if (window.formativeApi) {
        window.formativeApi.saveProjects(updated);
      }
      return updated;
    });
    setActiveProjectId(project.id);
    localStorage.setItem('formative_active_project_id', project.id);
    setViewMode('architecture');
    showToast(`Created workspace: ${project.name}`);
  };

  const handleLoadTemplate = (template?: Project) => {
    const tmpl = template || SAMPLE_TEMPLATES[0];
    const laidOutNodes = hierarchicalTreeLayout(tmpl.nodes, tmpl.edges);
    const newProj: Project = {
      ...tmpl,
      nodes: laidOutNodes,
      id: `proj-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => {
      const updated = [newProj, ...prev];
      localStorage.setItem('formative_projects', JSON.stringify(updated));
      if (window.formativeApi) {
        window.formativeApi.saveProjects(updated);
      }
      return updated;
    });
    setActiveProjectId(newProj.id);
    localStorage.setItem('formative_active_project_id', newProj.id);
    setViewMode('architecture');
    showToast(`Loaded ${newProj.name} blueprint.`);
  };

  const handleDeleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('formative_projects', JSON.stringify(updated));
      if (window.formativeApi) {
        window.formativeApi.saveProjects(updated);
      }
      return updated;
    });
    setActiveProjectId((currentActive) => {
      if (currentActive === id) {
        localStorage.removeItem('formative_active_project_id');
        setViewMode('welcome');
        return '';
      }
      return currentActive;
    });
    showToast('Workspace removed.');
  }, []);

  const handleUpdateProjectIssues = useCallback((updatedIssues: IssueItem[]) => {
    if (!activeProject) return;
    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          issues: updatedIssues
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    localStorage.setItem('formative_projects', JSON.stringify(updatedProjects));
    if (window.formativeApi) {
      window.formativeApi.saveProjects(updatedProjects);
    }
  }, [activeProject, projects]);

  const handleSave = useCallback(async () => {
    if (!activeProject) return;

    const updated = projects.map((p) => {
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

    setProjects(updated);
    localStorage.setItem('formative_projects', JSON.stringify(updated));

    if (window.formativeApi) {
      await window.formativeApi.saveProjects(updated);
    }

    showToast('Architecture saved to disk.');
  }, [activeProject, activeProjectId, projects, nodes, edges]);

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
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback(
    (category: NodeCategory, x = 300, y = 200) => {
      const id = `node-${Date.now()}`;
      const newNode: Node = {
        id,
        type: category === 'note' ? 'noteNode' : 'paperclipCard',
        position: { x, y },
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
    [setNodes]
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
    <div className={`flex h-screen w-screen overflow-hidden font-sans select-none theme-${theme} ${
      isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#ffffff] text-zinc-900'
    }`}>
      {/* 1. DUAL-RAIL LEFT NAVIGATION (Paperclip Shell) */}
      <PaperclipNav
        theme={theme}
        onToggleTheme={toggleTheme}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          localStorage.setItem('formative_active_project_id', id);
          setViewMode('architecture');
        }}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenLaunchpad={() => setIsLaunchpadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isAiStreaming={isAiStreaming}
        activeSkills={activeSkills}
        onOpenSkills={() => setIsLaunchpadOpen(true)}
      />

      {/* 2. MAIN WORKSPACE FRAME */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Paperclip Top Header Bar */}
        <header className={`h-12 border-b px-5 flex items-center justify-between shrink-0 select-none z-20 ${
          isDark ? 'bg-[#09090b] border-[#27272a] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-800'
        }`}>
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setViewMode('welcome')}
              className="font-medium hover:text-white transition-colors text-zinc-400"
            >
              {activeProject ? activeProject.name : 'Formative'}
            </button>
            <span className="text-zinc-600">/</span>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {viewMode === 'architecture'
                ? 'Architecture Canvas'
                : viewMode === 'org-chart'
                ? 'Org Chart'
                : viewMode === 'issues'
                ? 'Tasks & Issues'
                : viewMode === 'operations-floor'
                ? 'CEO Office Floor'
                : viewMode === 'agent-flow'
                ? 'AI Agent Console'
                : 'Welcome'}
            </span>
          </div>

          {/* Right: Context Actions */}
          <div className="flex items-center gap-2.5">
            {viewMode === 'architecture' && activeProject && (
              <>
                <button
                  onClick={handleAutoLayout}
                  title="Align architecture into a non-overlapping tree layout"
                  className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Tidy Layout</span>
                </button>

                <button
                  onClick={handleFitView}
                  title="Fit view to all components"
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
                <span>Single-Agent CEO Orchestrator</span>
              </div>
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
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-lg border text-xs font-mono shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            isDark ? 'bg-[#18181c] border-[#27272a] text-white' : 'bg-white border-zinc-300 text-black'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Viewport Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col min-h-0 min-w-0">
          {viewMode === 'org-chart' ? (
            <OrgChartView theme={theme} onOpenSkills={() => setIsLaunchpadOpen(true)} />
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
              onOpenProject={(id) => {
                setActiveProjectId(id);
                localStorage.setItem('formative_active_project_id', id);
                setViewMode('architecture');
              }}
              onScanDirectory={handleScanDirectory}
              onNewProject={() => setIsNewProjectOpen(true)}
              onOpenAiTelemetry={() => {
                setViewMode('agent-flow');
              }}
              onLoadTemplate={handleLoadTemplate}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onDeleteProject={handleDeleteProject}
            />
          ) : viewMode === 'operations-floor' && activeProject ? (
            <OfficeFloorView
              theme={theme}
              latestStep={rawAgentSteps.length > 0 ? rawAgentSteps[rawAgentSteps.length - 1] : undefined}
              isAiStreaming={isAiStreaming}
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
            /* Interactive ReactFlow Architecture Canvas */
            <div className="flex flex-1 w-full h-full min-h-0 min-w-0 overflow-hidden relative">
              <Sidebar
                theme={theme}
                onAddNode={(cat) => handleAddNode(cat)}
                nodeCount={nodes.length}
                edgeCount={edges.length}
              />

              <div className="flex-1 w-full h-full min-h-0 min-w-0 relative">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                  onPaneClick={() => setSelectedNodeId(null)}
                  onPaneContextMenu={onPaneContextMenu}
                  onNodeContextMenu={onNodeContextMenu}
                  onInit={(instance) => {
                    flowInstanceRef.current = instance;
                  }}
                  fitView
                  minZoom={0.2}
                  maxZoom={2}
                  defaultEdgeOptions={{
                    animated: true,
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
                          <span>ARCH: {activeProject?.name || 'Untitled'} ({nodes.length} Components)</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>CONSOLE: {activeSession?.provider || 'Agent'} ({nodes.length} Steps)</span>
                        </>
                      )}
                    </div>
                  </Panel>
                </ReactFlow>
              </div>

              {selectedNode && (
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
            onAddNode={(cat, px, py) => handleAddNode(cat, px - 100, py - 60)}
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
            setViewMode('architecture');
          }}
        />

        {/* Interactive First-Run Onboarding Modal */}
        <OnboardingModal
          theme={theme}
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onScanDirectory={handleScanDirectory}
          onCreateBlank={handleCreateBlankProject}
          onLoadTemplate={handleLoadTemplate}
          onSelectProvider={(prov) => {
            setSelectedProvider(prov);
            fetchProviderSessions(prov);
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
          onSelectProject={(id) => {
            setActiveProjectId(id);
            localStorage.setItem('formative_active_project_id', id);
            setViewMode('architecture');
          }}
          onCreateBlankProject={(name, type) => handleCreateBlankProject(name, type as ProjectType)}
          onDeleteProject={handleDeleteProject}
          onLoadTemplate={handleLoadTemplate}
        />

        {/* Desktop Application Bottom Status Bar */}
        <footer className={`h-6 border-t px-4 flex items-center justify-between text-xs font-mono select-none z-30 shrink-0 ${
          isDark ? 'bg-[#0c0c0e] border-[#27272a] text-zinc-500' : 'bg-[#fafafa] border-zinc-200 text-zinc-600'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activeProject ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
              <span className={activeProject ? (isDark ? 'text-zinc-300' : 'text-black') : ''}>
                {activeProject ? activeProject.name : 'No workspace open'}
              </span>
            </span>
            {activeProject && (
              <>
                <span>•</span>
                <span>{nodes.length} nodes</span>
                <span>•</span>
                <span>{edges.length} wires</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isAiStreaming ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
              <span>Agent Console: {isAiStreaming ? (activeSession?.provider || 'Active') : 'Ready'}</span>
            </span>
            <span>•</span>
            <span>Paperclip Engine</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
