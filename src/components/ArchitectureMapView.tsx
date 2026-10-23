import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import { AlertCircle, Boxes, Code2, FileCode2, FolderTree, Info, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import type { Project, ThemeMode } from '../types';
import type {
  ArchitectureMap,
  ArchitectureMapModule,
  ArchitectureSourceFile,
  ArchitectureSourceSummary,
} from '../types/architectureMap';

interface SourceReadResponse {
  success: boolean;
  sources?: ArchitectureSourceFile[];
  summary?: ArchitectureSourceSummary;
  error?: string;
}

interface ArchitectureMapViewProps {
  project: Project;
  theme: ThemeMode;
  isDesktopApp: boolean;
  onReadSources: (folderPath: string) => Promise<SourceReadResponse>;
  onSaveMap: (map: ArchitectureMap) => void;
}

interface ArchitectureNodeData extends Record<string, unknown> {
  module: ArchitectureMapModule;
  theme: ThemeMode;
}

interface WorkerResponse {
  success: boolean;
  map?: ArchitectureMap;
  error?: string;
}

const isDarkTheme = (theme: ThemeMode) => theme !== 'light';

function layoutMapModules(map: ArchitectureMap, theme: ThemeMode): Node<ArchitectureNodeData>[] {
  const modules = map.modules;
  const indegree = new Map(modules.map((module) => [module.id, 0]));
  const outgoing = new Map(modules.map((module) => [module.id, [] as string[]]));
  for (const connection of map.connections) {
    if (!indegree.has(connection.source) || !indegree.has(connection.target)) continue;
    indegree.set(connection.target, (indegree.get(connection.target) || 0) + 1);
    outgoing.get(connection.source)?.push(connection.target);
  }

  const layers = new Map(modules.map((module) => [module.id, 0]));
  const queue = modules.filter((module) => indegree.get(module.id) === 0).map((module) => module.id);
  const queued = new Set(queue);
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const target of outgoing.get(current) || []) {
      layers.set(target, Math.max(layers.get(target) || 0, (layers.get(current) || 0) + 1));
      const nextDegree = (indegree.get(target) || 0) - 1;
      indegree.set(target, nextDegree);
      if (nextDegree === 0 && !queued.has(target)) {
        queue.push(target);
        queued.add(target);
      }
    }
  }

  const grouped = new Map<number, ArchitectureMapModule[]>();
  for (const module of modules) {
    const layer = queued.has(module.id) ? layers.get(module.id) || 0 : 0;
    const group = grouped.get(layer) || [];
    group.push(module);
    grouped.set(layer, group);
  }

  const positions = new Map<string, { x: number; y: number }>();
  for (const [layer, group] of grouped) {
    group.sort((left, right) => left.label.localeCompare(right.label));
    group.forEach((module, index) => positions.set(module.id, {
      x: 100 + layer * 360,
      y: 100 + index * 190,
    }));
  }

  return modules.map((module) => ({
    id: module.id,
    type: 'architectureModule',
    position: positions.get(module.id) || { x: 100, y: 100 },
    data: { module, theme },
    draggable: false,
    selectable: true,
  }));
}

function relationLabel(relation: string): string {
  if (relation === 'calls-api') return 'matches API path';
  if (relation === 'uses-schema') return 'references schema';
  return 'imports';
}

const ArchitectureModuleNode: React.FC<NodeProps<Node<ArchitectureNodeData>>> = ({ data, selected }) => {
  const dark = isDarkTheme(data.theme);
  const module = data.module;
  const category = module.kind === 'api' ? 'API ROUTE'
    : module.kind === 'route' ? 'PAGE ROUTE'
      : module.kind === 'schema' ? 'SCHEMA'
        : module.kind === 'test' ? 'TESTS'
          : module.kind === 'package' ? (module.path.startsWith('package:') ? 'LIBRARY' : 'PACKAGE')
            : 'MODULE';
  const accent = module.kind === 'api' ? 'bg-amber-500'
    : module.kind === 'route' ? 'bg-blue-500'
      : module.kind === 'schema' ? 'bg-violet-500'
        : module.kind === 'test' ? 'bg-emerald-500'
          : module.kind === 'package' ? 'bg-orange-500'
            : 'bg-zinc-500';
  const Icon = module.kind === 'schema' ? FileCode2 : module.kind === 'package' ? Boxes : Code2;

  return (
    <div className={`relative w-[250px] overflow-hidden rounded-xl border shadow-sm transition-shadow ${
      selected
        ? dark ? 'border-orange-400 ring-1 ring-orange-400/60 shadow-lg shadow-black/20' : 'border-orange-600 ring-1 ring-orange-500/40 shadow-md'
        : dark ? 'border-zinc-700 bg-[#18181b] hover:border-zinc-500' : 'border-zinc-300 bg-white hover:border-zinc-400'
    }`}>
      <Handle type="target" position={Position.Left} className={`!h-2 !w-2 !border-2 !bg-zinc-500 ${dark ? '!border-zinc-900' : '!border-white'}`} />
      <div className={`flex items-center justify-between border-b px-3 py-2 ${dark ? 'border-zinc-700 bg-[#202024]' : 'border-zinc-200 bg-zinc-50'}`}>
        <div className={`flex min-w-0 items-center gap-2 text-[10px] font-semibold tracking-[0.08em] ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          <span className={`h-2 w-2 shrink-0 rounded-full ${accent}`} />
          <span className="truncate">{category}</span>
        </div>
        <Icon className={`h-3.5 w-3.5 shrink-0 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`} aria-hidden="true" />
      </div>
      <div className="space-y-2 p-3">
        <div className="min-w-0">
          <div className={`truncate text-sm font-semibold ${dark ? 'text-zinc-100' : 'text-zinc-900'}`} title={module.label}>{module.label}</div>
          <div className={`mt-0.5 truncate font-mono text-[10px] ${dark ? 'text-zinc-400' : 'text-zinc-600'}`} title={module.path}>{module.path}</div>
        </div>
        <div className={`flex items-center justify-between text-[10px] ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <span>{module.fileCount ? `${module.fileCount} ${module.fileCount === 1 ? 'file' : 'files'}` : 'External dependency'}</span>
          <span>{Object.keys(module.languageCounts).slice(0, 2).join(' · ') || 'Package'}</span>
        </div>
        {module.roleHint && (
          <p className={`line-clamp-2 text-[10px] leading-relaxed ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {module.roleHint}{module.evidenceLevel === 'inferred' ? ' · inferred from convention' : ''}
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Right} className={`!h-2 !w-2 !border-2 !bg-zinc-500 ${dark ? '!border-zinc-900' : '!border-white'}`} />
    </div>
  );
};

const nodeTypes = { architectureModule: ArchitectureModuleNode };

function ArchitectureDetails({
  module,
  map,
  theme,
  onClose,
}: {
  module: ArchitectureMapModule;
  map: ArchitectureMap;
  theme: ThemeMode;
  onClose: () => void;
}) {
  const dark = isDarkTheme(theme);
  const inbound = map.connections.filter((connection) => connection.target === module.id);
  const outbound = map.connections.filter((connection) => connection.source === module.id);
  const panel = dark ? 'border-zinc-800 bg-[#111114] text-zinc-200' : 'border-zinc-200 bg-white text-zinc-900';
  const muted = dark ? 'text-zinc-400' : 'text-zinc-600';

  return (
    <aside className={`absolute bottom-3 right-3 top-3 z-10 flex w-[min(320px,calc(100%-24px))] flex-col overflow-hidden rounded-xl border shadow-xl ${panel}`} aria-label="Architecture details">
      <div className={`flex items-start justify-between gap-3 border-b px-4 py-3 ${dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="min-w-0">
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${muted}`}>{module.kind === 'api' ? 'API route' : module.kind === 'route' ? 'Page route' : module.kind === 'schema' ? 'Schema' : module.kind === 'package' ? 'Package' : 'Code module'}</p>
          <h2 className="mt-1 truncate text-sm font-semibold" title={module.label}>{module.label}</h2>
        </div>
        <button type="button" onClick={onClose} className={`rounded-md px-2 py-1 text-xs ${dark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'}`} aria-label="Close architecture details">Close</button>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <div>
          <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${muted}`}>Location</p>
          <p className="break-all font-mono text-[11px] leading-relaxed">{module.path}</p>
        </div>
        {module.roleHint && (
          <div className={`rounded-lg border p-3 text-xs leading-relaxed ${dark ? 'border-zinc-800 bg-zinc-900/70' : 'border-zinc-200 bg-zinc-50'}`}>
            <div className="mb-1 flex items-center gap-1.5 font-medium">
              {module.evidenceLevel === 'observed' ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Info className="h-3.5 w-3.5 text-amber-500" />}
              {module.evidenceLevel === 'observed' ? 'Observed evidence' : 'Convention-based clue'}
            </div>
            <p className={muted}>{module.roleHint}</p>
          </div>
        )}
        <div>
          <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${muted}`}>Files in this module · {module.fileCount}</p>
          {module.filePaths.length > 0 ? (
            <ul className="space-y-1.5">
              {module.filePaths.map((filePath) => <li key={filePath} className={`break-all font-mono text-[10px] leading-relaxed ${muted}`}>{filePath}</li>)}
              {module.fileCount > module.filePaths.length && <li className={`text-[10px] ${muted}`}>And {module.fileCount - module.filePaths.length} more files…</li>}
            </ul>
          ) : <p className={`text-xs ${muted}`}>This package is named by an import in the project source.</p>}
        </div>
        {Object.keys(module.languageCounts).length > 0 && (
          <div>
            <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${muted}`}>Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(module.languageCounts).map(([language, count]) => (
                <span key={language} className={`rounded-md border px-2 py-1 text-[10px] ${dark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>{language} · {count}</span>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${muted}`}>Connections</p>
          <div className="space-y-2">
            {[...outbound.map((connection) => ({ connection, direction: 'To' })), ...inbound.map((connection) => ({ connection, direction: 'From' }))].map(({ connection, direction }) => {
              const relatedId = direction === 'To' ? connection.target : connection.source;
              const related = map.modules.find((item) => item.id === relatedId);
              return (
                <div key={connection.id} className={`rounded-md border px-2.5 py-2 text-[10px] ${dark ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50'}`}>
                  <div className="flex items-center justify-between gap-2"><span className={muted}>{direction} · {relationLabel(connection.relation)}</span><span className={muted}>{connection.count}×</span></div>
                  <p className="mt-1 truncate font-medium" title={related?.label}>{related?.label || 'Unknown module'}</p>
                  {connection.evidencePaths.map((evidencePath) => <p key={evidencePath} className={`mt-1 truncate font-mono ${muted}`} title={evidencePath}>{evidencePath}</p>)}
                </div>
              );
            })}
            {inbound.length + outbound.length === 0 && <p className={`text-xs ${muted}`}>No connections were found for this module.</p>}
          </div>
        </div>
      </div>
    </aside>
  );
}

export const ArchitectureMapView: React.FC<ArchitectureMapViewProps> = ({ project, theme, isDesktopApp, onReadSources, onSaveMap }) => {
  const dark = isDarkTheme(theme);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const cancelWorkerRef = useRef<(() => void) | null>(null);
  const flowRef = useRef<ReactFlowInstance<Node<ArchitectureNodeData>, Edge> | null>(null);
  const requestNumberRef = useRef(0);
  const map = project.architectureMap;

  useEffect(() => () => {
    requestNumberRef.current += 1;
    cancelWorkerRef.current?.();
    cancelWorkerRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  const nodes = useMemo(() => map ? layoutMapModules(map, theme) : [], [map, theme]);
  const edges = useMemo<Edge[]>(() => (map?.connections || []).map((connection) => ({
    id: connection.id,
    source: connection.source,
    target: connection.target,
    label: `${relationLabel(connection.relation)}${connection.count > 1 ? ` · ${connection.count}` : ''}`,
    type: 'smoothstep',
    animated: false,
    selectable: true,
    style: {
      stroke: connection.relation === 'calls-api' ? (dark ? '#f59e0b' : '#b45309')
        : connection.relation === 'uses-schema' ? (dark ? '#a78bfa' : '#6d28d9')
          : dark ? '#71717a' : '#a1a1aa',
      strokeWidth: Math.min(2.5, 1.25 + Math.log2(Math.max(1, connection.count)) * 0.25),
    },
    labelStyle: { fill: dark ? '#d4d4d8' : '#52525b', fontSize: 10 },
    labelBgStyle: { fill: dark ? '#18181b' : '#ffffff', fillOpacity: 0.92 },
    labelBgPadding: [5, 3] as [number, number],
    labelBgBorderRadius: 4,
  })), [dark, map]);

  const selectedModule = useMemo(() => map?.modules.find((module) => module.id === selectedModuleId) || null, [map, selectedModuleId]);

  useEffect(() => {
    if (!nodes.length || !flowRef.current) return;
    const timer = window.setTimeout(() => flowRef.current?.fitView({ padding: 0.2, duration: 150 }), 120);
    return () => window.clearTimeout(timer);
  }, [nodes.length, project.id]);

  const runAnalysis = useCallback(async () => {
    if (!project.folderPath) {
      setErrorMessage('Open a local project folder before creating an architecture map.');
      return;
    }
    if (!isDesktopApp) {
      setErrorMessage('Architecture analysis is available in the Formative desktop app, where project files stay on your device.');
      return;
    }

    const requestNumber = ++requestNumberRef.current;
    cancelWorkerRef.current?.();
    cancelWorkerRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setStatusMessage('Reading project source files…');
    setSelectedModuleId(null);

    try {
      const collected = await onReadSources(project.folderPath);
      if (requestNumber !== requestNumberRef.current) return;
      if (!collected.success || !collected.summary) throw new Error(collected.error || 'Formative could not read project source files.');
      setStatusMessage('Mapping imports and recognized conventions…');

      const worker = new Worker(new URL('../workers/architectureMap.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;
      const result = await new Promise<WorkerResponse>((resolve, reject) => {
        const clearCancellation = () => {
          if (cancelWorkerRef.current === cancel) cancelWorkerRef.current = null;
        };
        const cancel = () => {
          clearCancellation();
          resolve({ success: false, error: 'Architecture analysis was cancelled.' });
        };
        cancelWorkerRef.current = cancel;
        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          clearCancellation();
          resolve(event.data);
        };
        worker.onerror = () => {
          clearCancellation();
          reject(new Error('The architecture analysis could not be completed.'));
        };
        worker.postMessage({
          sources: collected.sources || [],
          sourceSummary: collected.summary,
          caseSensitivePaths: collected.summary?.caseSensitivePaths ?? false,
        });
      });

      if (requestNumber !== requestNumberRef.current) return;
      if (!result.success || !result.map) throw new Error(result.error || 'Formative could not build an architecture map.');
      onSaveMap(result.map);
      setStatusMessage(result.map.modules.length
        ? `Mapped ${result.map.modules.length} modules and ${result.map.connections.length} connections.`
        : 'The scan finished, but it found no supported source modules.');
    } catch (error) {
      if (requestNumber !== requestNumberRef.current) return;
      setErrorMessage(error instanceof Error ? error.message : 'Formative could not analyze this project.');
      setStatusMessage('');
    } finally {
      if (requestNumber === requestNumberRef.current) {
        workerRef.current?.terminate();
        workerRef.current = null;
        setIsAnalyzing(false);
      }
    }
  }, [isDesktopApp, onReadSources, onSaveMap, project.folderPath]);

  const surface = dark ? 'border-zinc-800 bg-[#111114]' : 'border-zinc-200 bg-white';
  const muted = dark ? 'text-zinc-400' : 'text-zinc-600';

  return (
    <section className={`flex min-h-0 min-w-0 flex-1 flex-col ${dark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'}`} aria-label="Architecture map">
      <div className={`flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 ${dark ? 'border-zinc-800 bg-[#0e0e11]' : 'border-zinc-200 bg-white'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${dark ? 'border-zinc-700 bg-zinc-900 text-orange-300' : 'border-zinc-200 bg-zinc-50 text-orange-700'}`}>
            <Code2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">Architecture map</h1>
            <p className={`truncate text-[10px] ${muted}`}>Code relationships found in this project</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {map && !isAnalyzing && (
            <span className={`hidden text-[10px] md:inline ${muted}`} title={new Date(map.summary.scannedAt).toLocaleString()}>
              Updated {new Date(map.summary.scannedAt).toLocaleDateString()}
            </span>
          )}
          <button
            type="button"
            onClick={() => void runAnalysis()}
            disabled={isAnalyzing || !isDesktopApp || !project.folderPath}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${dark ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-[#e04418] text-white hover:bg-[#c93812]'}`}
            title={!isDesktopApp ? 'Open Formative desktop to read local project files' : !project.folderPath ? 'This project has no local folder' : map ? 'Re-scan the selected project folder' : 'Build the architecture map from local project code'}
          >
            {isAnalyzing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : map ? <RefreshCw className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
            {isAnalyzing ? 'Analyzing…' : map ? 'Refresh map' : 'Analyze project'}
          </button>
        </div>
      </div>

      <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${!map ? 'items-center justify-center p-6' : ''}`}>
        {!map ? (
          <div className={`w-full max-w-xl rounded-2xl border p-6 shadow-sm ${surface}`}>
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${dark ? 'bg-orange-500/10 text-orange-300' : 'bg-orange-50 text-orange-700'}`}><FolderTree className="h-5 w-5" /></div>
            <h2 className="text-base font-semibold">See how the code connects</h2>
            <p className={`mt-2 text-sm leading-relaxed ${muted}`}>
              Formative reads a bounded set of source files on this device and maps imports, recognized routes, and schema files. It does not run code or upload project contents.
            </p>
            {statusMessage && <p role="status" aria-live="polite" className={`mt-4 rounded-lg border px-3 py-2 text-xs ${dark ? 'border-zinc-800 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>{statusMessage}</p>}
            {errorMessage && <p role="alert" className={`mt-4 rounded-lg border px-3 py-2 text-xs ${dark ? 'border-rose-900/70 bg-rose-950/40 text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{errorMessage}</p>}
            {!isDesktopApp && <p className={`mt-4 rounded-lg border p-3 text-xs ${dark ? 'border-zinc-800 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>Open the desktop app to analyze a local project folder.</p>}
            {!project.folderPath && <p className={`mt-4 rounded-lg border p-3 text-xs ${dark ? 'border-zinc-800 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>This project has no local folder. Open or scan a folder first.</p>}
            <div className={`mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] ${muted}`}>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Local and read-only</span>
              <span className="inline-flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-blue-500" /> Inferences are labeled</span>
            </div>
          </div>
        ) : (
          <>
            <div className={`flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border-b px-4 py-2 text-[10px] ${dark ? 'border-zinc-800 bg-[#0e0e11]' : 'border-zinc-200 bg-white'}`}>
              <span className="font-medium">{map.summary.moduleCount} modules</span>
              <span className={muted}>{map.summary.connectionCount} connections</span>
              <span className={muted}>{map.summary.parsedFileCount} source files parsed</span>
              {map.summary.languages.length > 0 && <span className={muted}>Languages: {map.summary.languages.join(', ')}</span>}
              {map.summary.frameworks.length > 0 && <span className={muted}>Detected: {map.summary.frameworks.join(', ')}</span>}
              {map.summary.truncated && <span className={`inline-flex items-center gap-1 ${dark ? 'text-amber-400' : 'text-amber-700'}`}><AlertCircle className="h-3 w-3" /> Safety limit reached</span>}
              {statusMessage && <span role="status" aria-live="polite" className={`ml-auto ${muted}`}>{statusMessage}</span>}
            </div>
            {errorMessage && <div role="alert" className={`mx-4 mt-3 rounded-lg border px-3 py-2 text-xs ${dark ? 'border-rose-900/70 bg-rose-950/40 text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{errorMessage}</div>}
            <div className="relative min-h-0 min-w-0 flex-1">
              {map.modules.length > 0 ? (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable
                  onNodeClick={(_, node) => setSelectedModuleId(node.id)}
                  onPaneClick={() => setSelectedModuleId(null)}
                  onInit={(instance) => { flowRef.current = instance; }}
                  fitView
                  minZoom={0.12}
                  maxZoom={1.8}
                  defaultEdgeOptions={{ type: 'smoothstep', style: { strokeWidth: 1.5 } }}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color={dark ? '#27272a' : '#e4e4e7'} gap={26} size={1} variant={BackgroundVariant.Dots} />
                  <Controls position="bottom-left" showInteractive={false} />
                  <MiniMap position="top-right" className="formative-canvas-minimap" pannable zoomable nodeColor={(node) => {
                    const kind = (node.data as ArchitectureNodeData).module.kind;
                    return kind === 'api' ? '#f59e0b' : kind === 'route' ? '#3b82f6' : kind === 'schema' ? '#8b5cf6' : '#a1a1aa';
                  }} />
                  {map.modules.length > 0 && map.summary.connectionCount === 0 && (
                    <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2">
                      <div className={`rounded-lg border px-3 py-2 text-[10px] shadow-sm ${dark ? 'border-zinc-700 bg-[#18181b] text-zinc-300' : 'border-zinc-200 bg-white text-zinc-700'}`}>
                        Modules were found; no supported cross-module connections were detected.
                      </div>
                    </div>
                  )}
                </ReactFlow>
              ) : (
                <div className="flex h-full items-center justify-center p-6">
                  <div className={`max-w-lg rounded-xl border p-5 text-center ${surface}`}>
                    <AlertCircle className={`mx-auto h-5 w-5 ${dark ? 'text-amber-400' : 'text-amber-700'}`} />
                    <h2 className="mt-3 text-sm font-semibold">No supported source files were found</h2>
                    <p className={`mt-2 text-xs leading-relaxed ${muted}`}>Formative did not find source files it can analyze in this folder. The map was saved as an empty result; your editable canvas is unchanged.</p>
                  </div>
                </div>
              )}
              {selectedModule && map && <ArchitectureDetails module={selectedModule} map={map} theme={theme} onClose={() => setSelectedModuleId(null)} />}
            </div>
            {map.summary.limitations.length > 0 && (
              <details className={`shrink-0 border-t px-4 py-2 ${dark ? 'border-zinc-800 bg-[#0e0e11]' : 'border-zinc-200 bg-white'}`}>
                <summary className={`flex cursor-pointer list-none items-center gap-1.5 text-[10px] font-medium ${muted}`}><Info className="h-3 w-3" /> How to read this map</summary>
                <ul className={`mt-2 grid gap-x-6 gap-y-1 text-[10px] sm:grid-cols-2 ${muted}`}>
                  {map.summary.limitations.map((limitation) => <li key={limitation} className="leading-relaxed">{limitation}</li>)}
                </ul>
              </details>
            )}
          </>
        )}
      </div>
    </section>
  );
};
