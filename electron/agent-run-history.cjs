const path = require('path');

const PROVIDER_IDS = new Set([
  'codex-cli', 'claude-code', 'opencode', 'antigravity', 'openclaw', 'ollama', 'kiro', 'api', 'mcp',
]);
const RUN_STATUSES = new Set([
  'queued', 'starting', 'running', 'waiting_for_approval', 'stopping', 'completed', 'cancelled', 'failed',
]);
const EVENT_TYPES = new Set([
  'prompt', 'progress', 'assistant_message', 'tool_started', 'tool_finished', 'file_changed',
  'approval_required', 'warning', 'error', 'completed', 'cancelled',
]);
const PERMISSION_MODES = new Set(['read-only', 'workspace-write']);
const MAX_CONVERSATIONS = 100;
const MAX_RUNS = 50;
const MAX_EVENTS_PER_RUN = 80;

function requiredString(value, name, maxLength) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength) {
    throw new Error(`${name} must be a non-empty string no longer than ${maxLength} characters.`);
  }
  return value;
}

function optionalString(value, name, maxLength) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new Error(`${name} must be a string no longer than ${maxLength} characters.`);
  }
  return value;
}

function timestamp(value, name, optional = false) {
  if (optional && (value === undefined || value === null || value === '')) return undefined;
  if (typeof value !== 'string' || value.length > 64 || Number.isNaN(Date.parse(value))) {
    throw new Error(`${name} must be a valid date and time.`);
  }
  return value;
}

function normalizeProviderId(value, name) {
  if (typeof value !== 'string' || !PROVIDER_IDS.has(value)) {
    throw new Error(`${name} is not a supported provider identifier.`);
  }
  return value;
}

function normalizeAgentHistory(conversationInput, runInput) {
  const rawConversations = conversationInput === undefined ? [] : conversationInput;
  const rawRuns = runInput === undefined ? [] : runInput;
  if (!Array.isArray(rawConversations) || rawConversations.length > MAX_CONVERSATIONS) {
    throw new Error(`A project can contain at most ${MAX_CONVERSATIONS} agent conversations.`);
  }
  if (!Array.isArray(rawRuns) || rawRuns.length > MAX_RUNS) {
    throw new Error(`A project can contain at most ${MAX_RUNS} agent runs.`);
  }

  const conversationIds = new Map();
  const conversations = rawConversations.map((conversation) => {
    if (!conversation || typeof conversation !== 'object' || Array.isArray(conversation)) {
      throw new Error('An agent conversation record is invalid.');
    }
    const id = requiredString(conversation.id, 'An agent conversation ID', 128);
    if (conversationIds.has(id)) throw new Error('Agent conversation IDs must be unique within a project.');
    const providerId = normalizeProviderId(conversation.providerId, 'An agent conversation provider');
    const createdAt = timestamp(conversation.createdAt, 'An agent conversation creation date');
    const updatedAt = timestamp(conversation.updatedAt, 'An agent conversation update date');
    const normalized = {
      id,
      providerId,
      title: requiredString(conversation.title, 'An agent conversation title', 200),
      createdAt,
      updatedAt,
    };
    const taskId = optionalString(conversation.taskId, 'An agent conversation task ID', 128);
    const employeeId = optionalString(conversation.employeeId, 'An assigned office employee ID', 128);
    const providerSessionId = optionalString(conversation.providerSessionId, 'A provider session ID', 512);
    if (taskId !== undefined) normalized.taskId = taskId;
    if (employeeId !== undefined) normalized.employeeId = employeeId;
    if (providerSessionId !== undefined) normalized.providerSessionId = providerSessionId;
    conversationIds.set(id, providerId);
    return normalized;
  });

  const runIds = new Set();
  const runs = rawRuns.map((run) => {
    if (!run || typeof run !== 'object' || Array.isArray(run)) throw new Error('An agent run record is invalid.');
    const id = requiredString(run.id, 'An agent run ID', 128);
    if (runIds.has(id)) throw new Error('Agent run IDs must be unique within a project.');
    runIds.add(id);
    const conversationId = requiredString(run.conversationId, 'An agent run conversation ID', 128);
    const conversationProvider = conversationIds.get(conversationId);
    if (!conversationProvider) throw new Error('Every agent run must belong to a saved conversation in this project.');
    const providerId = normalizeProviderId(run.providerId, 'An agent run provider');
    if (providerId !== conversationProvider) throw new Error('An agent run provider must match its conversation provider.');
    if (!RUN_STATUSES.has(run.status)) throw new Error('An agent run has an unsupported status.');
    if (!PERMISSION_MODES.has(run.permissionMode)) throw new Error('An agent run has an unsupported permission mode.');
    const createdAt = timestamp(run.createdAt, 'An agent run creation date');
    const updatedAt = timestamp(run.updatedAt, 'An agent run update date');
    const finishedAt = timestamp(run.finishedAt, 'An agent run completion date', true);
    const rawEvents = run.events === undefined ? [] : run.events;
    if (!Array.isArray(rawEvents) || rawEvents.length > MAX_EVENTS_PER_RUN) {
      throw new Error(`An agent run can contain at most ${MAX_EVENTS_PER_RUN} progress events.`);
    }

    const eventIds = new Set();
    let previousSequence = 0;
    const events = rawEvents.map((event) => {
      if (!event || typeof event !== 'object' || Array.isArray(event)) throw new Error('An agent progress event is invalid.');
      const eventId = requiredString(event.id, 'An agent progress event ID', 128);
      if (eventIds.has(eventId)) throw new Error('Agent progress event IDs must be unique within a run.');
      eventIds.add(eventId);
      if (!Number.isSafeInteger(event.sequence) || event.sequence <= previousSequence) {
        throw new Error('Agent progress events must have strictly increasing sequence numbers.');
      }
      previousSequence = event.sequence;
      if (!EVENT_TYPES.has(event.type)) throw new Error('An agent progress event has an unsupported type.');
      const normalizedEvent = {
        id: eventId,
        sequence: event.sequence,
        type: event.type,
        occurredAt: timestamp(event.occurredAt, 'An agent progress event date'),
        summary: requiredString(event.summary, 'An agent progress summary', 500),
      };
      const details = optionalString(event.details, 'Agent progress details', 4000);
      const toolName = optionalString(event.toolName, 'An agent tool name', 200);
      if (details !== undefined) normalizedEvent.details = details;
      if (toolName !== undefined) normalizedEvent.toolName = toolName;
      if (event.relativePaths !== undefined) {
        if (!Array.isArray(event.relativePaths) || event.relativePaths.length > 20) {
          throw new Error('An agent event can refer to at most 20 project-relative paths.');
        }
        normalizedEvent.relativePaths = event.relativePaths.map((relativePath) => {
          if (typeof relativePath !== 'string' || relativePath.length === 0 || relativePath.length > 1024 ||
              /^[a-zA-Z]:/.test(relativePath) || /^[\\/]{2}/.test(relativePath) ||
              path.isAbsolute(relativePath) || path.win32.isAbsolute(relativePath) || path.posix.isAbsolute(relativePath)) {
            throw new Error('Agent event paths must be project-relative paths.');
          }
          const normalizedPath = path.normalize(relativePath);
          if (normalizedPath === '..' || normalizedPath.startsWith(`..${path.sep}`) ||
              normalizedPath.startsWith('../') || normalizedPath.startsWith('..\\')) {
            throw new Error('Agent event paths cannot escape the selected project.');
          }
          return normalizedPath;
        });
      }
      return normalizedEvent;
    });

    const normalizedRun = {
      id,
      conversationId,
      providerId,
      prompt: requiredString(run.prompt, 'An agent run prompt', 20000),
      permissionMode: run.permissionMode,
      status: run.status,
      createdAt,
      updatedAt,
      events,
    };
    const taskId = optionalString(run.taskId, 'An agent run task ID', 128);
    const employeeId = optionalString(run.employeeId, 'An assigned office employee ID', 128);
    if (taskId !== undefined) normalizedRun.taskId = taskId;
    if (employeeId !== undefined) normalizedRun.employeeId = employeeId;
    if (finishedAt !== undefined) normalizedRun.finishedAt = finishedAt;
    return normalizedRun;
  });

  return { conversations, runs };
}

module.exports = { normalizeAgentHistory };
