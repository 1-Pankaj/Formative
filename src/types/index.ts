import type { AgentConversation, AgentProviderId, AgentRun } from './agentRuns';
import type { ArchitectureMap } from './architectureMap';

export type ProjectType = 'web' | 'mobile' | 'backend' | 'ai-system' | 'general' | 'roblox' | 'ai-tool' | 'realtime' | 'data-pipeline';

export type SkillDepartment =
  | 'frontend'
  | 'backend'
  | 'qa'
  | 'database'
  | 'mobile'
  | 'devops'
  | 'design'
  | 'security'
  | 'ai'
  | 'docs'
  | 'analytics';

export type OfficeDepartment = SkillDepartment | 'general';
export type OfficeHairStyle = 'short' | 'curly' | 'bald' | 'buzz' | 'ponytail' | 'messy' | 'long' | 'bun' | 'cap';

export interface OfficeCharacterAppearance {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  hairStyle: OfficeHairStyle;
  glasses?: boolean;
  headset?: boolean;
  suit?: boolean;
  tie?: string;
  cap?: string;
}

/** A project-owned person shown in the office and used to assign real agent runs. */
export interface OfficeMemberProfile {
  id: string;
  name: string;
  roleTitle: string;
  department: OfficeDepartment;
  enabled: boolean;
  skills: string[];
  preferredProviderId?: AgentProviderId;
  appearance: OfficeCharacterAppearance;
}

export interface ProjectOfficeTeam {
  ceo: OfficeMemberProfile;
  employees: OfficeMemberProfile[];
}

export interface ProjectOfficeConfig {
  /** Legacy toggle format retained for projects created before employee profiles existed. */
  activeSkills?: SkillDepartment[];
  ceoName?: string;
  ceo?: OfficeMemberProfile;
  employees?: OfficeMemberProfile[];
}

export interface IssueItem {
  id: string;
  key: string;
  title: string;
  status: 'in_progress' | 'todo' | 'blocked' | 'done';
  assignee: string;
  assigneeInitials: string;
  assignedEmployeeId?: string;
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

export interface ProjectScanEvidence {
  path: string;
  observation: string;
  meaning: string;
}

export interface ProjectScanSummary {
  inspectedAt: string;
  rootEntryCount: number;
  rootEntryLimit: number;
  rootEntriesTruncated: boolean;
  visibleFolderCount: number;
  mappedFolderCount: number;
  visibleFileCount: number;
  suggestedType: ProjectType;
  suggestionReason: string;
  evidence: ProjectScanEvidence[];
  limitations: string[];
}

export interface Project {
  id: string;
  source?: 'folder-map' | 'starter-example';
  name: string;
  description: string;
  type: ProjectType;
  folderPath?: string;
  folderMapCreatedAt?: string;
  updatedAt: string;
  nodes: any[];
  edges: any[];
  agentSessionId?: string;
  notes?: string;
  officeConfig?: ProjectOfficeConfig;
  issues?: IssueItem[];
  nextTaskNumber?: number;
  scanSummary?: ProjectScanSummary;
  architectureMap?: ArchitectureMap;
  agentConversations?: AgentConversation[];
  agentRuns?: AgentRun[];
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

export type ViewMode = 'welcome' | 'project-home' | 'architecture' | 'agent-chat' | 'agent-flow' | 'operations-floor' | 'issues';
export type FlowLayout = 'tree' | 'timeline';
export type ThemeMode = 'dark' | 'light';

export interface ContextMenuPosition {
  x: number;
  y: number;
  nodeId?: string;
}
