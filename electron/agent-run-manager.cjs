const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, execFile } = require('child_process');

const MAX_ACTIVE_RUNS = 3;
const MAX_STREAM_LINE_BYTES = 2 * 1024 * 1024;
const MAX_EVENTS_PER_RUN = 80;
const MAX_TEXT_PER_EVENT = 32000;
const PROVIDERS = {
  'codex-cli': { displayName: 'Codex', executable: 'codex', canRun: true },
  'claude-code': { displayName: 'Claude Code', executable: 'claude', canRun: true },
  antigravity: { displayName: 'Antigravity', executable: 'agy', canRun: false },
};

function isWindowsBatch(filePath) {
  return process.platform === 'win32' && typeof filePath === 'string' && /\.(cmd|bat)$/i.test(filePath);
}

function isSafeProviderSessionId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,255}$/.test(value);
}

function findExecutable(name) {
  const pathEntries = String(process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const candidates = process.platform === 'win32'
    ? (path.extname(name) ? [name] : [`${name}.exe`, `${name}.cmd`, `${name}.bat`])
    : [name];
  for (const entry of pathEntries) {
    for (const candidate of candidates) {
      const absolutePath = path.resolve(entry, candidate);
      try {
        const stat = fs.statSync(absolutePath);
        if (stat.isFile()) return absolutePath;
      } catch {}
    }
  }
  return null;
}

function clampText(value, maxLength = MAX_TEXT_PER_EVENT) {
  if (typeof value !== 'string') return '';
  const normalized = value.replace(/\u0000/g, '').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

function getMessageText(item) {
  if (typeof item?.text === 'string') return item.text;
  if (!Array.isArray(item?.content)) return '';
  return item.content
    .filter((block) => block && (block.type === 'output_text' || block.type === 'text') && typeof block.text === 'string')
    .map((block) => block.text)
    .join('');
}

function relativeProjectPaths(projectPath, candidates) {
  const items = Array.isArray(candidates) ? candidates : [candidates];
  const relativePaths = [];
  for (const candidate of items) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue;
    const absoluteCandidate = path.isAbsolute(candidate) ? path.resolve(candidate) : path.resolve(projectPath, candidate);
    const relative = path.relative(projectPath, absoluteCandidate);
    if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) continue;
    if (!relativePaths.includes(relative)) relativePaths.push(relative);
    if (relativePaths.length === 20) break;
  }
  return relativePaths;
}

function buildProviderEnvironment(providerId) {
  const common = [
    'PATH', 'PATHEXT', 'SYSTEMROOT', 'WINDIR', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH',
    'APPDATA', 'LOCALAPPDATA', 'TEMP', 'TMP', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL',
  ];
  const providerKeys = providerId === 'codex-cli'
    ? ['CODEX_HOME', 'OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_ORG_ID', 'OPENAI_PROJECT_ID']
    : providerId === 'claude-code'
      ? [
          'ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL', 'CLAUDE_CONFIG_DIR',
          'CLAUDE_CODE_USE_BEDROCK', 'CLAUDE_CODE_USE_VERTEX', 'AWS_PROFILE', 'AWS_REGION',
          'AWS_DEFAULT_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
          'GOOGLE_CLOUD_PROJECT', 'CLOUD_ML_REGION',
        ]
      : [];
  const allow = new Set([...common, ...providerKeys].map((key) => key.toUpperCase()));
  const safeEnvironment = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (allow.has(key.toUpperCase()) && value !== undefined) safeEnvironment[key] = value;
  }
  return safeEnvironment;
}

function runVersionCheck(executable, providerId) {
  return new Promise((resolve) => {
    execFile(executable, ['--version'], {
      env: buildProviderEnvironment(providerId),
      windowsHide: true,
      timeout: 3000,
      maxBuffer: 64 * 1024,
      shell: isWindowsBatch(executable),
    }, (error, stdout) => {
      if (error) return resolve(undefined);
      resolve(clampText(String(stdout || '').split(/\r?\n/)[0], 120) || undefined);
    });
  });
}

function makeStatus(providerId, executablePath) {
  const provider = PROVIDERS[providerId];
  return runVersionCheck(executablePath, providerId).then((version) => {
    const isExecutionVerified = Boolean(version);
    const canRun = Boolean(provider.canRun && isExecutionVerified);
    return {
      providerId,
      state: isExecutionVerified ? 'installed' : 'unsupported',
      authentication: 'not_checked',
      displayName: provider.displayName,
      ...(version ? { version } : {}),
      explanation: !provider.canRun
        ? 'Installed on this computer, but Formative run support is not ready yet. This is a high-priority next integration.'
        : isExecutionVerified
          ? 'Installed on this computer. Formative has not checked your account; authentication happens when a run starts.'
          : 'Detected on this computer, but the command failed to execute. Check its local installation.',
      capabilities: {
        canStartRun: canRun,
        canStreamEvents: canRun,
        canStopRun: canRun,
        canResumeConversation: canRun,
        canEditProjectFiles: false,
        canUseTools: canRun,
      },
    };
  });
}

function createAgentRunManager({ emitEvent }) {
  const activeRuns = new Map();
  const submittedRunIds = new Set();

  function pushEvent(run, type, summary, options = {}) {
    const eventId = options.eventId || `event-${crypto.randomUUID()}`;
    let sequence = run.eventSequences.get(eventId);
    const terminal = type === 'completed' || type === 'cancelled' || type === 'error';
    if (sequence === undefined && run.eventCount >= MAX_EVENTS_PER_RUN - 1 && !terminal) return;
    if (sequence === undefined) {
      sequence = run.nextSequence++;
      run.eventSequences.set(eventId, sequence);
      run.eventCount += 1;
    }
    const event = {
      id: eventId,
      sequence,
      type,
      occurredAt: new Date().toISOString(),
      summary: clampText(summary, 500) || 'Agent update',
    };
    const details = clampText(options.details);
    if (details) event.details = details;
    if (options.toolName) event.toolName = clampText(options.toolName, 200);
    const relativePaths = relativeProjectPaths(run.projectPath, options.paths);
    if (relativePaths.length) event.relativePaths = relativePaths;
    emitEvent({
      projectId: run.projectId,
      conversationId: run.conversationId,
      runId: run.runId,
      providerId: run.providerId,
      ...(run.providerSessionId ? { providerSessionId: run.providerSessionId } : {}),
      event,
      ...(options.status ? { status: options.status } : {}),
    });
  }

  function publishSessionId(run, value) {
    if (typeof value !== 'string' || !value.trim() || value.length > 512 || run.providerSessionId === value) return;
    run.providerSessionId = value;
    pushEvent(run, 'progress', `Connected to ${PROVIDERS[run.providerId].displayName}.`, { status: 'running' });
  }

  function finalize(run, status, message) {
    if (run.finalized) return;
    run.finalized = true;
    if (run.flushMessageTimer) clearTimeout(run.flushMessageTimer);
    if (run.pendingMessage) {
      pushEvent(run, 'assistant_message', run.pendingMessage, {
        eventId: run.pendingMessageEventId,
        details: run.pendingMessage,
      });
      run.pendingMessage = '';
    }
    activeRuns.delete(run.runId);
    const now = new Date().toISOString();
    const type = status === 'completed' ? 'completed' : status === 'cancelled' ? 'cancelled' : 'error';
    pushEvent(run, type, message, {
      status,
      ...(status === 'failed' ? { details: 'Check that the selected provider is signed in and that its local command can start.' } : {}),
    });
    run.onFinish?.({ status, updatedAt: now, providerSessionId: run.providerSessionId });
  }

  function scheduleAssistantMessage(run, text, eventId) {
    if (run.finalized) return;
    run.pendingMessage = clampText(text, MAX_TEXT_PER_EVENT);
    run.pendingMessageEventId = eventId || run.pendingMessageEventId || `assistant-${crypto.randomUUID()}`;
    if (run.flushMessageTimer) return;
    run.flushMessageTimer = setTimeout(() => {
      run.flushMessageTimer = null;
      if (!run.pendingMessage || run.finalized) return;
      pushEvent(run, 'assistant_message', run.pendingMessage, {
        eventId: run.pendingMessageEventId,
        details: run.pendingMessage,
      });
    }, 120);
  }

  function parseCodexLine(run, rawLine) {
    let message;
    try { message = JSON.parse(rawLine); } catch { return; }
    const eventType = message.type || message.method;
    const item = message.item || message.params?.item || {};
    const itemId = item.id || message.params?.itemId;

    if (eventType === 'thread.started' || eventType === 'thread/started') {
      publishSessionId(run, message.thread_id || message.thread?.id || message.params?.thread?.id);
      return;
    }
    if (eventType === 'turn.started' || eventType === 'turn/started') {
      run.turnId = message.turn?.id || message.params?.turn?.id;
      pushEvent(run, 'progress', 'The agent started reviewing your project.', { status: 'running' });
      return;
    }
    if (eventType === 'item.started' || eventType === 'item/started') {
      if (item.type === 'commandExecution' || item.type === 'command_execution') {
        const cmd = item.command || item.params?.command;
        const summary = cmd ? `Running ${clampText(cmd, 60)}` : 'Checking project information.';
        pushEvent(run, 'tool_started', summary, {
          toolName: 'Command',
          details: cmd || undefined,
        });
      } else if (item.type === 'fileChange' || item.type === 'file_change') {
        pushEvent(run, 'warning', 'This read-only run cannot change project files.');
      } else if (item.type === 'mcpToolCall' || item.type === 'mcp_tool_call') {
        pushEvent(run, 'warning', 'An external tool request was not enabled in this read-only run.');
      }
      return;
    }
    if (eventType === 'item/agentMessage/delta' || eventType === 'item.agentMessage.delta' ||
        eventType === 'item/agent_message/delta' || eventType === 'item.agent_message.delta') {
      const delta = message.params?.delta ?? message.delta;
      if (typeof delta === 'string') scheduleAssistantMessage(run, `${run.pendingMessage}${delta}`, `assistant-${itemId || 'active'}`);
      return;
    }
    if (eventType === 'item.completed' || eventType === 'item/completed') {
      if (item.type === 'agentMessage' || item.type === 'agent_message') {
        const text = getMessageText(item);
        if (text && text !== run.pendingMessage) scheduleAssistantMessage(run, text, `assistant-${item.id || 'active'}`);
      } else if (item.type === 'commandExecution' || item.type === 'command_execution') {
        pushEvent(run, 'tool_finished', 'Finished checking project information.', { toolName: 'Command' });
      }
      return;
    }
    if (eventType === 'turn.completed' || eventType === 'turn/completed') {
      const status = message.turn?.status || message.params?.turn?.status;
      if (status === 'interrupted' || run.stopRequested) finalize(run, 'cancelled', 'Run stopped.');
      else if (status === 'failed') finalize(run, 'failed', 'The agent could not complete this run.');
      else finalize(run, 'completed', 'Run complete.');
      return;
    }
    if (eventType === 'turn.failed' || eventType === 'error') {
      finalize(run, 'failed', 'The agent could not complete this run. Check its local setup and try again.');
    }
  }

  function parseClaudeLine(run, rawLine) {
    let message;
    try { message = JSON.parse(rawLine); } catch { return; }
    if (message.type === 'system' && message.subtype === 'init') {
      publishSessionId(run, message.session_id);
      pushEvent(run, 'progress', 'The agent started reviewing your project.', { status: 'running' });
      return;
    }
    if (message.type === 'stream_event') {
      const event = message.event || {};
      const delta = event.delta;
      if (event.type === 'content_block_delta' && delta?.type === 'text_delta' && typeof delta.text === 'string') {
        scheduleAssistantMessage(run, `${run.pendingMessage}${delta.text}`, `assistant-${message.message_id || 'active'}`);
      }
      return;
    }
    if (message.type === 'assistant' && Array.isArray(message.message?.content)) {
      for (const block of message.message.content) {
        if (block?.type === 'tool_use' && typeof block.name === 'string') {
          const safeName = ['Read', 'Glob', 'Grep'].includes(block.name) ? block.name : 'Project tool';
          const targetPath = typeof block.input?.file_path === 'string' ? block.input.file_path : undefined;
          const query = typeof block.input?.pattern === 'string' ? block.input.pattern : undefined;
          let label = 'Using a project tool.';
          if (safeName === 'Read') {
            label = targetPath ? `Reading ${path.basename(targetPath)}` : 'Reading project information.';
          } else if (safeName === 'Grep' || safeName === 'Glob') {
            label = query ? `Searching for "${query}"` : 'Searching project files.';
          }
          pushEvent(run, 'tool_started', label, {
            toolName: safeName,
            paths: targetPath ? [targetPath] : undefined,
            details: query || targetPath || undefined,
          });
        }
      }
      return;
    }
    if (message.type === 'user' && Array.isArray(message.message?.content)) {
      for (const block of message.message.content) {
        if (block?.type === 'tool_result') pushEvent(run, 'tool_finished', 'Finished checking project information.');
      }
      return;
    }
    if (message.type === 'result') {
      if (message.subtype === 'success') {
        const resultText = typeof message.result === 'string' ? message.result : '';
        if (resultText && !run.pendingMessage) scheduleAssistantMessage(run, resultText, `assistant-${message.session_id || 'active'}`);
        finalize(run, 'completed', 'Run complete.');
      } else {
        finalize(run, 'failed', 'The agent could not complete this run. Check its local setup and try again.');
      }
    }
  }

  function attachLineReader(run, parser) {
    let buffered = '';
    run.child.stdout.setEncoding('utf8');
    run.child.stdout.on('data', (chunk) => {
      buffered += chunk;
      if (Buffer.byteLength(buffered, 'utf8') > MAX_STREAM_LINE_BYTES && !buffered.includes('\n')) {
        finalize(run, 'failed', 'The provider returned an oversized stream event.');
        terminateProcessTree(run.child);
        buffered = '';
        return;
      }
      let newlineIndex = buffered.indexOf('\n');
      while (newlineIndex >= 0) {
        const line = buffered.slice(0, newlineIndex).trim();
        buffered = buffered.slice(newlineIndex + 1);
        if (Buffer.byteLength(line, 'utf8') > MAX_STREAM_LINE_BYTES) {
          finalize(run, 'failed', 'The provider returned an oversized stream event.');
          terminateProcessTree(run.child);
          return;
        }
        if (line) parser(run, line);
        newlineIndex = buffered.indexOf('\n');
      }
    });
    run.child.stderr.resume();
  }

  function terminateProcessTree(child) {
    if (!child || child.killed || !child.pid) return;
    if (process.platform === 'win32') {
      const systemRoot = process.env.SystemRoot || 'C:\\Windows';
      const taskkillPath = path.join(systemRoot, 'System32', 'taskkill.exe');
      const killer = spawn(taskkillPath, ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        shell: false,
        stdio: 'ignore',
      });
      killer.on('error', () => { try { child.kill(); } catch {} });
      return;
    }
    try { process.kill(-child.pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch {} }
    const forceTimer = setTimeout(() => {
      try { process.kill(-child.pid, 'SIGKILL'); } catch {}
    }, 1800);
    forceTimer.unref?.();
  }

  async function getStatuses() {
    return Promise.all(Object.entries(PROVIDERS).map(async ([providerId, provider]) => {
      const executablePath = findExecutable(provider.executable);
      if (!executablePath) {
        return {
          providerId,
          state: 'missing',
          authentication: 'not_checked',
          displayName: provider.displayName,
          explanation: `Install ${provider.displayName} locally to use it with Formative. Formative does not install agent providers.`,
          capabilities: {
            canStartRun: false, canStreamEvents: false, canStopRun: false,
            canResumeConversation: false, canEditProjectFiles: false, canUseTools: false,
          },
        };
      }
      return makeStatus(providerId, executablePath);
    }));
  }

  function startRun(request, projectPath) {
    const provider = PROVIDERS[request.providerId];
    if (!provider || !provider.canRun) return { success: false, error: 'This provider is not enabled for runs yet.' };
    if (activeRuns.size >= MAX_ACTIVE_RUNS) return { success: false, error: 'Formative already has three local agent runs in progress.' };
    if (submittedRunIds.has(request.runId)) return { success: false, error: 'This run was already submitted. Start a new message to try again.' };
    const executable = findExecutable(provider.executable);
    if (!executable) return { success: false, error: `${provider.displayName} is not installed or could not be found on this computer.` };
    if (request.permissionMode !== 'read-only') return { success: false, error: 'Only read-only agent runs are available in this first workflow.' };

    // Session IDs are passed as provider CLI arguments. Keep them out of shell syntax
    // when a Windows installation exposes a .cmd/.bat shim (shell:true is required
    // for those shims on Windows).
    if (request.providerSessionId !== undefined && !isSafeProviderSessionId(request.providerSessionId)) {
      return { success: false, error: 'The saved provider session ID contains unsupported characters. Start a new conversation.' };
    }

    const providerSessionId = request.providerId === 'claude-code'
      ? (request.providerSessionId || crypto.randomUUID())
      : request.providerSessionId;
    let args;
    if (request.providerId === 'codex-cli') {
      args = [
        // spawn's cwd is already projectPath. Do not repeat that path as a CLI
        // argument: .cmd/.bat providers run through cmd.exe on Windows.
        '--sandbox', 'read-only', '--ask-for-approval', 'never',
        'exec', '--json', '--ignore-user-config', '--skip-git-repo-check',
      ];
      if (providerSessionId) args.push('resume', providerSessionId);
      args.push('-');
    } else {
      args = [
        '--print', '--input-format', 'stream-json', '--output-format', 'stream-json',
        '--include-partial-messages', '--permission-mode', 'plan', '--tools', 'Read,Glob,Grep',
        '--safe-mode',
      ];
      if (request.providerSessionId) args.push('--resume', request.providerSessionId);
      else args.push('--session-id', providerSessionId);
    }

    let child;
    try {
      child = spawn(executable, args, {
        cwd: projectPath,
        env: buildProviderEnvironment(request.providerId),
        windowsHide: true,
        shell: isWindowsBatch(executable),
        detached: process.platform !== 'win32',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch {
      return { success: false, error: `Formative could not start ${provider.displayName}. Check its local installation.` };
    }
    submittedRunIds.add(request.runId);
    if (submittedRunIds.size > 1000) submittedRunIds.delete(submittedRunIds.values().next().value);

    const run = {
      runId: request.runId,
      projectId: request.projectId,
      projectPath,
      conversationId: request.conversationId,
      providerId: request.providerId,
      providerSessionId,
      child,
      eventCount: 0,
      nextSequence: 2,
      eventSequences: new Map(),
      pendingMessage: '',
      finalized: false,
      stopRequested: false,
    };
    activeRuns.set(run.runId, run);

    const parser = request.providerId === 'codex-cli' ? parseCodexLine : parseClaudeLine;
    attachLineReader(run, parser);
    pushEvent(run, 'progress', `Starting ${provider.displayName} in read-only mode.`, { status: 'running' });

    let stderrBuffered = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderrBuffered += chunk;
      if (stderrBuffered.length > 2000) stderrBuffered = stderrBuffered.slice(-2000);
    });

    child.once('error', () => {
      finalize(run, 'failed', `Formative could not start ${provider.displayName}. Check its local installation.`);
    });
    child.once('close', (code, signal) => {
      if (run.finalized) return;
      if (run.stopRequested || signal) finalize(run, 'cancelled', 'Run stopped.');
      else if (code === 0) finalize(run, 'completed', 'Run complete.');
      else {
        const failureDetail = stderrBuffered.trim()
          ? clampText(stderrBuffered.trim().split(/\r?\n/).slice(-3).join(' '), 300)
          : 'Check its local account and configuration.';
        finalize(run, 'failed', `The ${provider.displayName} run ended before it completed. ${failureDetail}`);
      }
    });

    try {
      if (request.providerId === 'codex-cli') {
        child.stdin.end(request.prompt);
      } else {
        child.stdin.end(JSON.stringify({
          type: 'user',
          message: { role: 'user', content: request.prompt },
        }) + os.EOL);
      }
    } catch {
      finalize(run, 'failed', `Formative could not send the prompt to ${provider.displayName}.`);
      terminateProcessTree(child);
      return { success: false, error: `Formative could not send the prompt to ${provider.displayName}.` };
    }

    return { success: true, runId: run.runId, providerSessionId };
  }

  function stopRun(runId, projectId) {
    const run = activeRuns.get(runId);
    if (!run || run.projectId !== projectId) return false;
    run.stopRequested = true;
    pushEvent(run, 'progress', 'Stopping the agent…', { status: 'stopping' });
    terminateProcessTree(run.child);
    return true;
  }

  function stopAll() {
    for (const run of activeRuns.values()) {
      run.stopRequested = true;
      terminateProcessTree(run.child);
    }
  }

  return { getStatuses, startRun, stopRun, stopAll };
}

module.exports = {
  createAgentRunManager,
  findExecutable,
  isWindowsBatch,
  isSafeProviderSessionId,
  clampText,
  relativeProjectPaths,
};
