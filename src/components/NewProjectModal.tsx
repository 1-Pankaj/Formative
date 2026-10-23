import React, { useState, useEffect } from 'react';
import { X, Globe, Bot, FileCode, Plus, Layers, Database, Server, Smartphone, Share2, Cpu, Workflow } from 'lucide-react';
import { Project, ProjectType, ThemeMode } from '../types';
import formativeLogo from '../assets/FormativeLogo.png';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
  theme: ThemeMode;
}

const templates: Array<{
  type: ProjectType;
  title: string;
  desc: string;
  icon: React.ElementType;
  nodes: any[];
  edges: any[];
}> = [
  {
    type: 'web',
    title: 'Full-Stack Web Platform',
    desc: 'React / Next.js client, API Gateway, PostgreSQL relational database, and Redis cache.',
    icon: Globe,
    nodes: [
      {
        id: 'web-1',
        type: 'paperclipCard',
        position: { x: 80, y: 140 },
        data: { label: 'Web Client App', category: 'frontend', subtitle: 'src/app (Next.js)', status: 'done', tags: ['React', 'TS'] },
      },
      {
        id: 'web-2',
        type: 'paperclipCard',
        position: { x: 400, y: 140 },
        data: { label: 'API Gateway & Auth', category: 'gateway', subtitle: 'src/api (Fastify)', status: 'running', tags: ['REST', 'JWT'] },
      },
      {
        id: 'web-3',
        type: 'paperclipCard',
        position: { x: 720, y: 80 },
        data: { label: 'PostgreSQL Database', category: 'database', subtitle: 'Prisma ORM', status: 'done', tags: ['Postgres', 'ACID'] },
      },
      {
        id: 'web-4',
        type: 'paperclipCard',
        position: { x: 720, y: 220 },
        data: { label: 'Redis Session Cache', category: 'database', subtitle: 'In-Memory Store', status: 'done', tags: ['Redis', 'KV'] },
      },
    ],
    edges: [
      { id: 'ew1', source: 'web-1', target: 'web-2', animated: true },
      { id: 'ew2', source: 'web-2', target: 'web-3', animated: true },
      { id: 'ew3', source: 'web-2', target: 'web-4', animated: true },
    ],
  },
  {
    type: 'ai-system',
    title: 'AI Agent Autonomous Workflow',
    desc: 'User prompt intake pipeline, Graphify AST analysis, local tool execution, and verification.',
    icon: Bot,
    nodes: [
      {
        id: 'ai-1',
        type: 'paperclipCard',
        position: { x: 80, y: 140 },
        data: { label: 'User Goal Intake', category: 'ai-agent', subtitle: 'Prompt Context', status: 'done', tags: ['Context'] },
      },
      {
        id: 'ai-2',
        type: 'paperclipCard',
        position: { x: 380, y: 140 },
        data: { label: 'Knowledge Graph Map', category: 'backend', subtitle: 'Graphify Index', status: 'done', tags: ['Graphify'] },
      },
      {
        id: 'ai-3',
        type: 'paperclipCard',
        position: { x: 680, y: 80 },
        data: { label: 'Agent Tool Execution', category: 'worker', subtitle: 'Local Process', status: 'running', tags: ['Tools'] },
      },
      {
        id: 'ai-4',
        type: 'paperclipCard',
        position: { x: 680, y: 220 },
        data: { label: 'Verification Critic', category: 'ai-agent', subtitle: 'Self-Review Loop', status: 'done', tags: ['Validation'] },
      },
    ],
    edges: [
      { id: 'ea1', source: 'ai-1', target: 'ai-2', animated: true },
      { id: 'ea2', source: 'ai-2', target: 'ai-3', animated: true },
      { id: 'ea3', source: 'ai-3', target: 'ai-4', animated: true },
    ],
  },
  {
    type: 'backend',
    title: 'Microservices & Event-Driven Cloud',
    desc: 'Edge CDN gateway, decoupled Auth & Order microservices, Kafka event bus, and persistent storage.',
    icon: Server,
    nodes: [
      {
        id: 'ms-1',
        type: 'paperclipCard',
        position: { x: 80, y: 140 },
        data: { label: 'Cloudflare Edge CDN', category: 'gateway', subtitle: 'Global Edge Router', status: 'done', tags: ['Edge', 'WAF'] },
      },
      {
        id: 'ms-2',
        type: 'paperclipCard',
        position: { x: 380, y: 80 },
        data: { label: 'Auth & Identity Service', category: 'backend', subtitle: 'Go Microservice', status: 'done', tags: ['Auth', 'OAuth2'] },
      },
      {
        id: 'ms-3',
        type: 'paperclipCard',
        position: { x: 380, y: 220 },
        data: { label: 'Order Processing Service', category: 'backend', subtitle: 'Rust Worker', status: 'running', tags: ['Orders', 'gRPC'] },
      },
      {
        id: 'ms-4',
        type: 'paperclipCard',
        position: { x: 680, y: 140 },
        data: { label: 'Apache Kafka Event Bus', category: 'queue', subtitle: 'Distributed Queue', status: 'done', tags: ['Kafka', 'Events'] },
      },
    ],
    edges: [
      { id: 'ems1', source: 'ms-1', target: 'ms-2', animated: true },
      { id: 'ems2', source: 'ms-1', target: 'ms-3', animated: true },
      { id: 'ems3', source: 'ms-3', target: 'ms-4', animated: true },
    ],
  },
  {
    type: 'mobile',
    title: 'Mobile & Cross-Platform Engine',
    desc: 'iOS and Android client app, GraphQL Gateway, Serverless Lambda workers, and cloud database.',
    icon: Smartphone,
    nodes: [
      {
        id: 'mob-1',
        type: 'paperclipCard',
        position: { x: 80, y: 140 },
        data: { label: 'Mobile Native App', category: 'frontend', subtitle: 'React Native / Expo', status: 'done', tags: ['iOS', 'Android'] },
      },
      {
        id: 'mob-2',
        type: 'paperclipCard',
        position: { x: 400, y: 140 },
        data: { label: 'GraphQL Federation Gateway', category: 'gateway', subtitle: 'Apollo Router', status: 'running', tags: ['GraphQL', 'Schema'] },
      },
      {
        id: 'mob-3',
        type: 'paperclipCard',
        position: { x: 700, y: 140 },
        data: { label: 'Serverless Worker Fleet', category: 'worker', subtitle: 'AWS Lambda Functions', status: 'done', tags: ['Serverless', 'Lambda'] },
      },
    ],
    edges: [
      { id: 'emob1', source: 'mob-1', target: 'mob-2', animated: true },
      { id: 'emob2', source: 'mob-2', target: 'mob-3', animated: true },
    ],
  },
  {
    type: 'realtime',
    title: 'Real-Time Collaborative System',
    desc: 'Interactive collaborative canvas, WebSocket signaling gateway, CRDT state sync, and Redis Pub/Sub.',
    icon: Share2,
    nodes: [
      {
        id: 'rt-1',
        type: 'paperclipCard',
        position: { x: 80, y: 140 },
        data: { label: 'Interactive Canvas Client', category: 'frontend', subtitle: 'Web & Desktop App', status: 'done', tags: ['Canvas', 'PixiJS'] },
      },
      {
        id: 'rt-2',
        type: 'paperclipCard',
        position: { x: 400, y: 140 },
        data: { label: 'WebSocket Signaling Gateway', category: 'gateway', subtitle: 'ws-server (Node.js)', status: 'running', tags: ['WSS', 'Realtime'] },
      },
      {
        id: 'rt-3',
        type: 'paperclipCard',
        position: { x: 720, y: 140 },
        data: { label: 'CRDT Sync Engine', category: 'backend', subtitle: 'Yjs / Automerge State', status: 'done', tags: ['CRDT', 'State'] },
      },
    ],
    edges: [
      { id: 'ert1', source: 'rt-1', target: 'rt-2', animated: true },
      { id: 'ert2', source: 'rt-2', target: 'rt-3', animated: true },
    ],
  },
  {
    type: 'data-pipeline',
    title: 'Data Pipeline & Vector Lakehouse',
    desc: 'Telemetry ingestion stream, embedding workers, Qdrant / Pinecone vector store, and data warehouse.',
    icon: Cpu,
    nodes: [
      {
        id: 'dp-1',
        type: 'paperclipCard',
        position: { x: 80, y: 140 },
        data: { label: 'Telemetry Ingestion API', category: 'gateway', subtitle: 'High-Throughput Sink', status: 'done', tags: ['Ingest', 'HTTP'] },
      },
      {
        id: 'dp-2',
        type: 'paperclipCard',
        position: { x: 400, y: 140 },
        data: { label: 'Vector Embedding Worker', category: 'worker', subtitle: 'Text-Embedding Engine', status: 'running', tags: ['Embeddings', 'GPU'] },
      },
      {
        id: 'dp-3',
        type: 'paperclipCard',
        position: { x: 720, y: 140 },
        data: { label: 'Vector Database Store', category: 'database', subtitle: 'Qdrant / Milvus Cluster', status: 'done', tags: ['VectorDB', 'HNSW'] },
      },
    ],
    edges: [
      { id: 'edp1', source: 'dp-1', target: 'dp-2', animated: true },
      { id: 'edp2', source: 'dp-2', target: 'dp-3', animated: true },
    ],
  },
  {
    type: 'general',
    title: 'Blank Architecture Canvas',
    desc: 'Clean slate with zero components. Add nodes manually from the component library.',
    icon: FileCode,
    nodes: [],
    edges: [],
  },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  theme,
}) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(templates.length - 1);

  // Hook must always run unconditionally to respect React Rules of Hooks
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = theme !== 'light';

  const handleCreate = () => {
    const tmpl = templates[selectedTemplateIndex];
    const newProj: Project = {
      id: `proj-${globalThis.crypto.randomUUID()}`,
      source: selectedTemplateIndex === templates.length - 1 ? undefined : 'starter-example',
      name: name.trim() || tmpl.title,
      description: desc.trim() || tmpl.desc,
      type: tmpl.type,
      updatedAt: new Date().toISOString(),
      nodes: JSON.parse(JSON.stringify(tmpl.nodes)).map((node: any) => ({
        ...node,
        data: { ...node.data, status: 'idle' },
      })),
      edges: JSON.parse(JSON.stringify(tmpl.edges)).map((edge: any) => ({ ...edge, animated: false })),
      officeConfig: {
        activeSkills: []
      },
      issues: [],
    };
    onCreateProject(newProj);
    setName('');
    setDesc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="new-project-title" tabIndex={-1} className={`w-full max-w-xl border rounded-xl shadow-2xl overflow-hidden flex flex-col ${
        isDark ? 'bg-[#09090b] border-[#27272a] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'bg-[#121215] border-[#27272a]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center p-1 border ${
              isDark ? 'bg-[#18181c] border-zinc-700/60' : 'bg-zinc-100 border-zinc-300'
            }`}>
              <img src={formativeLogo} alt="Formative" className="w-full h-full object-contain rounded" />
            </div>
            <div>
              <h2 id="new-project-title" className="text-sm font-semibold tracking-tight">
                New Project
              </h2>
              <p className="text-xs text-zinc-400">
                Start with a blank canvas or an editable example
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close new project dialog"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label htmlFor="new-project-name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Project Name
            </label>
            <input
              id="new-project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Payments Microservice, AI Customer Service Engine..."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium focus:outline-none transition-colors ${
                isDark 
                  ? 'bg-[#121215] border-[#27272a] text-white focus:border-zinc-400 placeholder-zinc-600' 
                  : 'bg-zinc-50 border-zinc-200 text-black focus:border-zinc-400 placeholder-zinc-400'
              }`}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="new-project-description" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Description (Optional)
            </label>
            <input
              id="new-project-description"
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief summary of what this system does..."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-colors ${
                isDark 
                  ? 'bg-[#121215] border-[#27272a] text-zinc-200 focus:border-zinc-400 placeholder-zinc-600' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-zinc-400 placeholder-zinc-400'
              }`}
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Optional Starter Diagram
            </span>
            <p className="text-xs text-zinc-400">Examples are static diagrams and are not generated from your project files.</p>
            <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
              {templates.map((t, idx) => {
                const Icon = t.icon;
                const isSelected = selectedTemplateIndex === idx;
                return (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => setSelectedTemplateIndex(idx)}
                    className={`flex items-start gap-3.5 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-[#18181c] border-white text-white ring-1 ring-white/50'
                          : 'bg-zinc-100 border-zinc-900 text-black ring-1 ring-zinc-900'
                        : isDark
                        ? 'bg-[#121215] border-[#27272a] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isSelected 
                        ? isDark ? 'bg-white text-black' : 'bg-black text-white' 
                        : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <span>{t.title}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
          isDark ? 'bg-[#121215] border-[#27272a]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="px-5 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      </section>
    </div>
  );
};
