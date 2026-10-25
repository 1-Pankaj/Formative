/**
 * Formative Office Event Interface & Data Contract
 *
 * Designed to accept agent lifecycle, tool execution, and file activity
 * from real provider adapters (Codex, Claude Code, Google Antigravity, OpenCode, etc.).
 *
 * Rules:
 * - Distinguishes directly observed events from inferred activity.
 * - Shows unavailable status when a provider exposes no usable signal.
 * - Never fabricates agent work, file activity, project insights, or CEO responses.
 * - Respects configured permissions and explains what project information is sent to an external provider.
 */

export type ProviderSignalStatus = 
  | 'available'       // Provider actively delivers verified execution events
  | 'unavailable'     // Provider connected but exposes no usable event stream or telemetry
  | 'not_connected'   // No provider configured
  | 'permission_denied'; // User restricted observation or telemetry

export type AgentObservationKind = 
  | 'direct_observed' // Real event payload received directly from provider hook/CLI/SDK
  | 'inferred';        // Heuristic inference (e.g. file modified on disk during run window)

export type AgentLifecycleState = 
  | 'idle'
  | 'starting'
  | 'running'
  | 'waiting_approval'
  | 'paused'
  | 'failed'
  | 'completed'
  | 'stopped';

export type ToolCategory = 
  | 'read'
  | 'write'
  | 'exec'
  | 'search'
  | 'browser'
  | 'network'
  | 'custom';

export interface VerifiedToolActivity {
  toolName: string;
  category: ToolCategory;
  isObserved: boolean;
  targetPath?: string;
  commandSnippet?: string;
  durationMs?: number;
}

export interface VerifiedFileActivity {
  projectRelativePath: string;
  operation: 'read' | 'write' | 'delete' | 'created';
  verifiedOnDisk: boolean;
  byteSize?: number;
}

export interface PrivacyContextDisclosure {
  providerName: string;
  filesExposed: string[];
  contextBudgetTokens?: number;
  dataBoundaryDescription: string;
  externalEndpoint?: string;
}

export interface FormativeOfficeEvent {
  id: string;
  projectId: string;
  timestamp: number;
  sourceKind: AgentObservationKind;
  providerStatus: ProviderSignalStatus;
  lifecycle: AgentLifecycleState;
  
  // Real agent assignment
  assignedEmployeeId?: string;
  assignedRole?: string;
  
  // Real execution payload (only present when provider actually supplies evidence)
  toolActivity?: VerifiedToolActivity;
  fileActivity?: VerifiedFileActivity;
  userFacingSummary?: string;
  
  // Explicit flag when provider exposes no usable telemetry
  hasUsableSignal: boolean;
  unavailableReason?: string;

  // Transparent disclosure of context sent
  privacyDisclosure?: PrivacyContextDisclosure;
}

/**
 * Data contract between Formative project state and the 3D office diorama.
 */
export interface FormativeOfficeState {
  projectId: string;
  projectName: string;
  providerSignal: ProviderSignalStatus;
  providerName?: string;
  
  // Real active employee roster based on project configuration
  activeEmployees: {
    id: string;
    name: string;
    role: string;
    assignedTaskId?: string;
    isCustomized: boolean;
    avatarConfig?: {
      skin?: string;
      hair?: string;
      shirt?: string;
      pants?: string;
    };
  }[];

  // Grounded tasks (from activeProject.issues)
  activeTasks: {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    assignedEmployeeId?: string;
  }[];

  // Verified latest event (strictly null if no verified provider event has occurred)
  latestVerifiedEvent: FormativeOfficeEvent | null;
}
