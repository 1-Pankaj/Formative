export type ProjectType = 'web' | 'mobile' | 'backend' | 'ai-system' | 'general' | 'roblox' | 'ai-tool' | 'realtime' | 'data-pipeline';

export type SkillDepartment = 'frontend' | 'backend' | 'qa' | 'database';

export interface ProjectOfficeConfig {
  activeSkills: SkillDepartment[];
  ceoName?: string;
}

export interface IssueItem {
  id: string;
  key: string;
  title: string;
  status: 'in_progress' | 'todo' | 'blocked' | 'done';
  assignee: string;
  assigneeInitials: string;
  projectName: string;
  projectColor: string;
  isLive?: boolean;
  date: string;
  description?: string;
  comments?: Array<{
    author: string;
    date: string;
    content: string;
  }>;
}

export interface Project {
  id: string;
  source?: 'folder-map' | 'starter-example';
  name: string;
  description: string;
  type: ProjectType;
  folderPath?: string;
  updatedAt: string;
  nodes: any[];
  edges: any[];
  agentSessionId?: string;
  notes?: string;
  officeConfig?: ProjectOfficeConfig;
  issues?: IssueItem[];
  nextTaskNumber?: number;
}

export type NodeCategory = 
  | 'frontend' 
  | 'gateway'
  | 'backend' 
  | 'database' 
  | 'cache'
  | 'queue'
  | 'worker'
  | 'ai-agent' 
  | 'auth'
  | 'service'
  | 'note'
  | 'folder';

export type StepStatus = 'idle' | 'running' | 'done' | 'error' | 'skipped';

export interface ArchNodeData {
  [key: string]: any;
  label: string;
  category: NodeCategory;
  subtitle?: string;
  description?: string;
  tags?: string[];
  status?: StepStatus;
  filePaths?: string[];
  toolUsed?: string;
  thought?: string;
  stepIndex?: number;
  argsPreview?: string;
  timestamp?: string;
  isAiLive?: boolean;
  modelAdapter?: string;
  explanation?: string;
}

export interface AgentTranscriptStep {
  step_index: number;
  source: string;
  type: string;
  status: string;
  created_at: string;
  content?: string;
  cleanContent?: string;
  thinking?: string;
  tool_calls?: Array<{
    name: string;
    args?: any;
    parameters?: any;
  }>;
}

export type AgentProvider = 'claude-code' | 'opencode' | 'antigravity' | 'custom';

export interface AgentSession {
  id: string;
  title: string;
  provider: string;
  transcriptPath: string;
  updatedAt: number;
  lineCount: number;
  isCurrent?: boolean;
}

export type ViewMode = 'welcome' | 'architecture' | 'agent-flow' | 'operations-floor' | 'org-chart' | 'issues';
export type FlowLayout = 'tree' | 'timeline';
export type ThemeMode = 'dark' | 'light';

export interface ContextMenuPosition {
  x: number;
  y: number;
  nodeId?: string;
}
