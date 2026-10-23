/** Stable IDs used across the renderer, Electron main process, and persisted project records. */
export const AGENT_PROVIDER_IDS = [
  'codex-cli',
  'claude-code',
  'opencode',
  'antigravity',
  'openclaw',
  'ollama',
  'kiro',
  'api',
  'mcp',
] as const;

export type AgentProviderId = typeof AGENT_PROVIDER_IDS[number];

export type AgentRunStatus =
  | 'queued'
  | 'starting'
  | 'running'
  | 'waiting_for_approval'
  | 'stopping'
  | 'completed'
  | 'cancelled'
  | 'failed';

/** These are user-visible progress events. Hidden model reasoning is intentionally excluded. */
export type AgentRunEventType =
  | 'prompt'
  | 'progress'
  | 'assistant_message'
  | 'tool_started'
  | 'tool_finished'
  | 'file_changed'
  | 'approval_required'
  | 'warning'
  | 'error'
  | 'completed'
  | 'cancelled';

export type AgentPermissionMode = 'read-only' | 'workspace-write';

export interface AgentProviderCapabilities {
  canStartRun: boolean;
  canStreamEvents: boolean;
  canStopRun: boolean;
  canResumeConversation: boolean;
  canEditProjectFiles: boolean;
  canUseTools: boolean;
}

export interface AgentProviderStatus {
  providerId: AgentProviderId;
  /** Installation status only. Authentication is deliberately not probed by Formative. */
  state: 'installed' | 'missing' | 'unsupported';
  authentication: 'not_checked';
  displayName: string;
  version?: string;
  explanation?: string;
  capabilities: AgentProviderCapabilities;
}

export interface AgentConversation {
  id: string;
  providerId: AgentProviderId;
  title: string;
  taskId?: string;
  providerSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentRunEvent {
  id: string;
  sequence: number;
  type: AgentRunEventType;
  occurredAt: string;
  summary: string;
  details?: string;
  toolName?: string;
  /** Project-relative paths only. Absolute paths are not accepted in stored events. */
  relativePaths?: string[];
}

export interface AgentRun {
  id: string;
  conversationId: string;
  providerId: AgentProviderId;
  taskId?: string;
  prompt: string;
  permissionMode: AgentPermissionMode;
  status: AgentRunStatus;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
  events: AgentRunEvent[];
}

export interface StartAgentRunRequest {
  runId: string;
  projectId: string;
  projectPath: string;
  conversationId: string;
  providerId: AgentProviderId;
  providerSessionId?: string;
  taskId?: string;
  prompt: string;
  permissionMode: AgentPermissionMode;
}

/** Event sent from Electron to the renderer while a provider CLI is running. */
export interface AgentRunStreamEvent {
  projectId: string;
  conversationId: string;
  runId: string;
  providerId: AgentProviderId;
  providerSessionId?: string;
  event: AgentRunEvent;
  status?: AgentRunStatus;
}

export interface AgentRunHandle {
  runId: string;
  events: AsyncIterable<AgentRunEvent>;
  stop(): Promise<void>;
}

/**
 * Adapter contract for one provider integration. Provider-specific process and protocol
 * behavior belongs behind this boundary; the UI must render only declared capabilities.
 */
export interface AgentProviderAdapter {
  readonly providerId: AgentProviderId;
  getStatus(): Promise<AgentProviderStatus>;
  startRun(request: StartAgentRunRequest): Promise<AgentRunHandle>;
}
