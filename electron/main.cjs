const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { pathToFileURL } = require('url');

let mainWindow = null;
let activeWatcher = null;
const approvedDirectoryPaths = new Set();
const approvedTranscriptPaths = new Set();
const MAX_TRANSCRIPT_BYTES = 20 * 1024 * 1024;
const MAX_PROJECTS_BYTES = 30 * 1024 * 1024;

function isLoopbackHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function isTrustedRendererUrl(rawUrl) {
  try {
    if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL) {
      const actual = new URL(rawUrl);
      const expected = new URL(process.env.VITE_DEV_SERVER_URL);
      return actual.protocol === 'http:' && isLoopbackHost(actual.hostname) &&
        actual.origin === expected.origin && actual.pathname === expected.pathname;
    }

    const actual = new URL(rawUrl);
    const expectedFile = new URL(pathToFileURL(path.resolve(__dirname, '../dist/index.html')).href);
    if (actual.protocol === 'file:') return actual.pathname === expectedFile.pathname;
    return false;
  } catch {
    return false;
  }
}

function handleAppIpc(channel, handler) {
  ipcMain.handle(channel, (event, ...args) => {
    const frame = event.senderFrame;
    if (
      !mainWindow ||
      event.sender.id !== mainWindow.webContents.id ||
      !frame ||
      frame.parent ||
      !isTrustedRendererUrl(frame.url)
    ) {
      throw new Error('This request did not come from the Formative window.');
    }
    return handler(event, ...args);
  });
}

function normalizedAbsolutePath(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 4096 || !path.isAbsolute(value)) {
    return null;
  }
  return path.normalize(path.resolve(value));
}

function isApprovedDirectory(value) {
  const normalized = normalizedAbsolutePath(value);
  return Boolean(normalized && approvedDirectoryPaths.has(normalized));
}

function isApprovedTranscript(value) {
  const normalized = normalizedAbsolutePath(value);
  return Boolean(normalized && approvedTranscriptPaths.has(normalized));
}

function readTranscriptContent(transcriptPath) {
  const realPath = path.normalize(path.resolve(fs.realpathSync(transcriptPath)));
  if (!approvedTranscriptPaths.has(realPath)) throw new Error('This transcript is no longer selected or available.');
  transcriptPath = realPath;
  const stat = fs.statSync(transcriptPath);
  if (!stat.isFile()) throw new Error('The selected transcript is not a file.');
  if (stat.size > MAX_TRANSCRIPT_BYTES) throw new Error('This transcript is larger than the 20 MB import limit.');
  return fs.readFileSync(transcriptPath, 'utf8');
}

function getAppDataPath() {
  const dir = path.join(app.getPath('userData'), 'FormativeData');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getProjectsFile() {
  return path.join(getAppDataPath(), 'projects.json');
}

async function readDirectorySample(directoryPath, limit) {
  const directory = await fs.promises.opendir(directoryPath);
  const entries = [];
  let truncated = false;
  try {
    while (entries.length < limit) {
      const entry = await directory.read();
      if (!entry) break;
      entries.push(entry);
    }
    if (entries.length === limit) truncated = Boolean(await directory.read());
    return { entries, truncated };
  } finally {
    await directory.close().catch(() => {});
  }
}

function createWindow() {
  const distPath = path.join(__dirname, '../dist/index.html');
  const devServerUrl = !app.isPackaged ? process.env.VITE_DEV_SERVER_URL : null;
  if (!devServerUrl && !fs.existsSync(distPath)) {
    dialog.showErrorBox('Formative could not start', 'The desktop interface is missing. Reinstall the application or start the development app from its project folder.');
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1520,
    height: 960,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#09090b',
    title: 'Formative Studio',
    icon: path.join(__dirname, '../public/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false,
    },
    autoHideMenuBar: true,
    show: true,
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isTrustedRendererUrl(url)) event.preventDefault();
  });
  mainWindow.webContents.on('will-redirect', (event, url) => {
    if (!isTrustedRendererUrl(url)) event.preventDefault();
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (activeWatcher) {
    activeWatcher.watcher.close();
    activeWatcher = null;
  }
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC HANDLERS ---

// 1. Native Directory & File Selectors
handleAppIpc('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Project Directory to Map',
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  try {
    const selectedPath = path.normalize(path.resolve(fs.realpathSync(result.filePaths[0])));
    if (!fs.statSync(selectedPath).isDirectory()) return null;
    approvedDirectoryPaths.add(selectedPath);
    return selectedPath;
  } catch {
    return null;
  }
});

handleAppIpc('select-transcript-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select JSON or JSONL transcript',
    filters: [
      { name: 'Agent Transcripts', extensions: ['jsonl', 'json'] },
    ]
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  try {
    const selectedPath = path.normalize(path.resolve(fs.realpathSync(result.filePaths[0])));
    if (!fs.statSync(selectedPath).isFile()) return null;
    approvedTranscriptPaths.add(selectedPath);
    return selectedPath;
  } catch {
    return null;
  }
});

// 2. Real Project Folder Scanner
handleAppIpc('scan-project-directory', async (event, folderPath) => {
  try {
    if (!isApprovedDirectory(folderPath)) {
      return { success: false, error: 'Choose the project folder in Formative before scanning it.' };
    }
    const realFolderPath = path.normalize(path.resolve(fs.realpathSync(folderPath)));
    if (realFolderPath !== path.normalize(path.resolve(folderPath)) || !isApprovedDirectory(realFolderPath)) {
      return { success: false, error: 'The selected project folder changed. Choose it again before scanning.' };
    }
    folderPath = realFolderPath;
    if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
      return { success: false, error: 'That project folder no longer exists.' };
    }

    const projectName = path.basename(folderPath) || path.parse(folderPath).root.replace(/[\\/]+$/, '') || 'Project';
    const rootSample = await readDirectorySample(folderPath, 500);
    const entries = rootSample.entries;

    let projectType = 'general';
    const hasPackageJson = fs.existsSync(path.join(folderPath, 'package.json'));
    const hasNextConfig = fs.existsSync(path.join(folderPath, 'next.config.js')) || fs.existsSync(path.join(folderPath, 'next.config.mjs')) || fs.existsSync(path.join(folderPath, 'next.config.ts'));
    const hasPython = fs.existsSync(path.join(folderPath, 'requirements.txt')) || fs.existsSync(path.join(folderPath, 'pyproject.toml'));
    const hasDocker = fs.existsSync(path.join(folderPath, 'docker-compose.yml')) || fs.existsSync(path.join(folderPath, 'Dockerfile'));

    if (hasNextConfig || (hasPackageJson && fs.existsSync(path.join(folderPath, 'src', 'app')))) {
      projectType = 'web';
    } else if (hasPython) {
      projectType = 'backend';
    }

    const keyDirs = [];
    const rootFiles = [];
    let topLevelFolderCount = 0;

    for (const ent of entries) {
      if (ent.name.startsWith('.') || ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'build') continue;

      const fullP = path.join(folderPath, ent.name);
      if (ent.isDirectory()) {
        topLevelFolderCount += 1;
        if (keyDirs.length >= 9) continue;
        try {
          const subSample = await readDirectorySample(fullP, 50);
          const subFiles = subSample.entries.map((entry) => entry.name).filter((name) => !name.startsWith('.'));
          keyDirs.push({ name: ent.name, fileCount: subFiles.length, files: subFiles.slice(0, 5), truncated: subSample.truncated });
        } catch (e) {
          keyDirs.push({ name: ent.name, fileCount: 0, files: [], truncated: false });
        }
      } else {
        rootFiles.push(ent.name);
      }
    }

    const nodes = [];
    const edges = [];

    // Core Root Node
    nodes.push({
      id: 'core-root',
      type: 'archNode',
      position: { x: 80, y: 160 },
      data: {
        label: `${projectName} Root`,
        category: 'folder',
        subtitle: folderPath,
        description: `${rootSample.truncated ? 'Sampled first 500 entries. ' : ''}Project folder with ${topLevelFolderCount} visible top-level folders and ${rootFiles.length} visible top-level files in the sample.`,
        tags: ['Folder map', projectType.toUpperCase(), ...(hasDocker ? ['Docker config found'] : [])],
        status: 'idle',
      },
    });

    // The folder map contains only the sampled project root and its first folders.
    keyDirs.slice(0, 9).forEach((dir, i) => {
      const nodeId = `dir-${i}-${dir.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const col = (i % 3) + 1;
      const row = Math.floor(i / 3);

      nodes.push({
        id: nodeId,
        type: 'archNode',
        position: { x: 100 + col * 400, y: 80 + row * 240 },
        data: {
          label: `${dir.name}`,
          category: 'folder',
          subtitle: `./${dir.name}`,
          description: `Top-level folder with ${dir.truncated ? 'up to ' : ''}${dir.fileCount} visible sampled entries${dir.files.length ? `, including ${dir.files.join(', ')}` : ''}.`,
          tags: [`${dir.truncated ? 'Sample: ' : ''}${dir.fileCount} Entries`],
          status: 'idle',
        },
      });

      edges.push({
        id: `e-core-${nodeId}`,
        source: 'core-root',
        target: nodeId,
        label: 'contains',
        animated: false,
      });
    });

    return {
      success: true,
      project: {
        id: `proj-${crypto.createHash('sha256').update(process.platform === 'win32' ? folderPath.toLowerCase() : folderPath).digest('hex').slice(0, 20)}`,
        source: 'folder-map',
        name: projectName,
        description: `Limited folder map from: ${folderPath}`,
        type: projectType,
        folderPath,
        updatedAt: new Date().toISOString(),
      issues: [],
      nodes,
      edges,
    },
  };
} catch (err) {
    console.error('Scan project error:', err);
    return { success: false, error: err.message };
  }
});

function readTranscriptPreview(filePath) {
  const fd = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(64 * 1024);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    const lines = buffer.toString('utf8', 0, bytesRead).split(/\r?\n/).filter(Boolean).slice(0, 30);
    let isTranscript = false;
    let title = '';

    for (const line of lines) {
      if (line.length > 1024 * 1024) continue;
      try {
        const record = JSON.parse(line);
        if (!record || typeof record !== 'object' || Array.isArray(record)) continue;
        const message = record.message && typeof record.message === 'object' ? record.message : null;
        const role = typeof record.role === 'string' ? record.role : message?.role;
        const type = typeof record.type === 'string' ? record.type : '';
        const recognizedType = /^(user|assistant|message|user_message|assistant_message|user_input|tool_use|tool_result)$/i.test(type);
        if (typeof role !== 'string' && !recognizedType && !Array.isArray(record.tool_calls)) continue;

        isTranscript = true;
        const isUser = String(role || '').toLowerCase() === 'user' || /^(user|user_message|user_input)$/i.test(type);
        if (!title && isUser) {
          title = cleanTranscriptText(message?.content ?? record.content ?? record.cleanContent ?? '');
        }
        if (isTranscript && title) break;
      } catch {}
    }

    return { isTranscript, title: title.slice(0, 60), lineCount: lines.length };
  } finally {
    fs.closeSync(fd);
  }
}

// Discover bounded samples of JSONL files and reject files that do not resemble transcript records.
async function findTranscriptsRecursively(dirPath, maxDepth = 3, currentDepth = 0, budget = { visited: 0, results: [] }) {
  if (currentDepth > maxDepth || budget.results.length >= 200 || budget.visited >= 1000 || !fs.existsSync(dirPath)) return budget.results;

  let entries;
  try {
    entries = (await readDirectorySample(dirPath, 200)).entries;
  } catch {
    return budget.results;
  }

  for (const ent of entries) {
    if (budget.results.length >= 200 || budget.visited >= 1000) break;
    budget.visited += 1;
    if (ent.isSymbolicLink() || ent.name.startsWith('.')) continue;
    const fullPath = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      await findTranscriptsRecursively(fullPath, maxDepth, currentDepth + 1, budget);
    } else if (ent.isFile() && path.extname(ent.name).toLowerCase() === '.jsonl') {
      budget.results.push(fullPath);
    }
  }

  return budget.results;
}

// 3. Existing provider transcript discovery
handleAppIpc('get-agent-sessions', async (event, providerId = 'claude-code') => {
  try {
    if (!['claude-code', 'opencode', 'antigravity'].includes(providerId)) {
      return { success: false, sessions: [], error: 'This transcript source is not supported.' };
    }
    const sessions = [];
    const homeDir = app.getPath('home');

    // Provider A: Claude Code
    if (providerId === 'claude-code') {
      const projectSessionDirectory = path.join(homeDir, '.claude', 'projects');
      const files = await findTranscriptsRecursively(projectSessionDirectory, 2);
      for (const f of files) {
        if (sessions.length >= 200) break;
        try {
          const stat = fs.statSync(f);
          if (stat.size > MAX_TRANSCRIPT_BYTES) continue;
          const preview = readTranscriptPreview(f);
          if (!preview.isTranscript) continue;
          const approvedPath = path.normalize(path.resolve(fs.realpathSync(f)));
          approvedTranscriptPaths.add(approvedPath);
          sessions.push({
            id: approvedPath,
            title: preview.title || `Claude Code Session (${path.basename(f).slice(0, 8)})`,
            provider: 'Claude Code',
            transcriptPath: approvedPath,
            updatedAt: stat.mtimeMs,
            lineCount: preview.lineCount,
            isCurrent: false,
          });
        } catch (e) {}
      }
    }

    // Provider B: OpenCode transcript files
    else if (providerId === 'opencode') {
      const openCodeLocations = [
        path.join(homeDir, '.opencode'),
        path.join(homeDir, '.config', 'opencode'),
      ];

      for (const loc of openCodeLocations) {
        if (sessions.length >= 200) break;
        if (fs.existsSync(loc)) {
          const files = await findTranscriptsRecursively(loc, 2);
          for (const f of files) {
            if (sessions.length >= 200) break;
            try {
              const stat = fs.statSync(f);
              const base = path.basename(f);
              if (stat.size > MAX_TRANSCRIPT_BYTES) continue;
              const preview = readTranscriptPreview(f);
              if (!preview.isTranscript) continue;
              const approvedPath = path.normalize(path.resolve(fs.realpathSync(f)));
              approvedTranscriptPaths.add(approvedPath);
              sessions.push({
                id: approvedPath,
                title: preview.title || `OpenCode Session (${base})`,
                provider: 'OpenCode',
                transcriptPath: approvedPath,
                updatedAt: stat.mtimeMs,
                lineCount: preview.lineCount,
                isCurrent: false,
              });
            } catch (e) {}
          }
        }
      }
    }

    // Provider C: Google Antigravity
    else if (providerId === 'antigravity') {
      const brainDir = path.join(homeDir, '.gemini', 'antigravity', 'brain');
      if (fs.existsSync(brainDir)) {
        const entries = (await readDirectorySample(brainDir, 200)).entries;
        for (const entry of entries) {
          if (sessions.length >= 200) break;
          if (entry.isDirectory()) {
            const transcriptPath = path.join(brainDir, entry.name, '.system_generated', 'logs', 'transcript.jsonl');
            if (fs.existsSync(transcriptPath)) {
              const stat = fs.statSync(transcriptPath);
              if (stat.size > MAX_TRANSCRIPT_BYTES) continue;
              const preview = readTranscriptPreview(transcriptPath);
              if (!preview.isTranscript) continue;

              const approvedPath = path.normalize(path.resolve(fs.realpathSync(transcriptPath)));
              approvedTranscriptPaths.add(approvedPath);
              sessions.push({
                id: entry.name,
                title: preview.title || `Antigravity Session (${entry.name.slice(0, 8)})`,
                provider: 'Antigravity',
                transcriptPath: approvedPath,
                updatedAt: stat.mtimeMs,
                lineCount: preview.lineCount,
                isCurrent: false, // Never auto-select or force on startup
              });
            }
          }
        }
      }
    }

    sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    return { success: true, sessions: sessions.slice(0, 200) };
  } catch (err) {
    console.error('Error reading agent sessions:', err);
    return { success: false, sessions: [], error: err.message };
  }
});

function cleanTranscriptText(value) {
  if (typeof value === 'string') {
    return value
      .replace(/<USER_REQUEST>[\s\S]*?<\/USER_REQUEST>/g, (match) => match.replace(/<\/?USER_REQUEST>/g, ''))
      .replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '')
      .replace(/<SYSTEM_MESSAGE>[\s\S]*?<\/SYSTEM_MESSAGE>/g, '')
      .trim()
      .slice(0, 20000);
  }

  if (!Array.isArray(value)) return '';
  return value.slice(0, 100).map((block) => {
    if (!block || typeof block !== 'object') return '';
    if (typeof block.text === 'string') return block.text.slice(0, 20000);
    if (block.type === 'tool_use' && typeof block.name === 'string') return `Tool: ${block.name}`;
    return '';
  }).filter(Boolean).join('\n').slice(0, 20000);
}

function cleanTranscriptArgument(value) {
  if (typeof value === 'string') return value.slice(0, 4000);
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized.slice(0, 4000) : '';
  } catch {
    return '';
  }
}

function normalizeTranscriptStep(raw, index) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const message = raw.message && typeof raw.message === 'object' && !Array.isArray(raw.message)
    ? raw.message
    : null;
  const roleValue = typeof raw.role === 'string'
    ? raw.role
    : typeof message?.role === 'string' ? message.role : 'agent';
  const role = roleValue.slice(0, 100);
  const rawType = typeof raw.type === 'string' ? raw.type : '';
  const type = rawType || (role.toLowerCase() === 'user' ? 'USER_INPUT' : 'PLANNER_RESPONSE');
  const contentValue = raw.cleanContent ?? message?.content ?? raw.content ?? (typeof raw.message === 'string' ? raw.message : '');
  const cleanContent = cleanTranscriptText(contentValue);
  const blocks = Array.isArray(contentValue) ? contentValue.slice(0, 100) : [];
  const callsValue = raw.tool_calls || message?.tool_calls || (raw.tool_use ? [raw.tool_use] : raw.function_call ? [raw.function_call] : []);
  const tool_calls = (Array.isArray(callsValue) ? callsValue.slice(0, 50) : [callsValue])
    .map((call) => {
      if (!call || typeof call !== 'object') return null;
      const fn = call.function && typeof call.function === 'object' ? call.function : call;
      const name = typeof call.name === 'string' ? call.name : fn.name;
      if (typeof name !== 'string' || !name) return null;
      return {
        name: name.slice(0, 200),
        args: cleanTranscriptArgument(call.args ?? call.parameters ?? call.input ?? fn.arguments),
      };
    })
    .filter(Boolean);

  for (const block of blocks) {
    if (block?.type === 'tool_use' && typeof block.name === 'string' && !tool_calls.some((call) => call.name === block.name)) {
      tool_calls.push({ name: block.name.slice(0, 200), args: cleanTranscriptArgument(block.input) });
    }
  }

  const statusText = String(raw.status || 'DONE').toUpperCase();
  const status = ['ERROR', 'FAILED'].includes(statusText) ? 'ERROR'
    : ['RUNNING', 'IN_PROGRESS'].includes(statusText) ? 'RUNNING'
      : 'DONE';
  const stepIndex = Number(raw.step_index ?? raw.stepIndex ?? index + 1);

  return {
    step_index: Number.isFinite(stepIndex) && stepIndex > 0 ? Math.floor(stepIndex) : index + 1,
    source: String(raw.source || role || 'agent').slice(0, 100),
    type: role.toLowerCase() === 'user' && type === 'PLANNER_RESPONSE' ? 'USER_INPUT' : type.slice(0, 100),
    status,
    created_at: String(raw.created_at || raw.timestamp || new Date().toISOString()).slice(0, 100),
    content: cleanContent,
    cleanContent,
    thinking: typeof raw.thinking === 'string' ? raw.thinking.slice(0, 20000)
      : typeof raw.reasoning === 'string' ? raw.reasoning.slice(0, 20000) : undefined,
    tool_calls: tool_calls.slice(0, 50),
  };
}

function parseTranscriptContent(content, transcriptPath) {
  const extension = path.extname(transcriptPath).toLowerCase();
  let records;

  if (extension === '.json') {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) records = parsed;
    else if (parsed && typeof parsed === 'object') {
      const nestedRecords = ['messages', 'events', 'steps', 'records']
        .map((key) => parsed[key])
        .find(Array.isArray);
      records = nestedRecords || [parsed];
    } else records = [parsed];
  } else if (extension === '.jsonl') {
    records = [];
    let offset = 0;
    let scannedLines = 0;
    while (offset < content.length && scannedLines < 10000) {
      const end = content.indexOf('\n', offset);
      const line = content.slice(offset, end === -1 ? content.length : end).replace(/\r$/, '');
      offset = end === -1 ? content.length : end + 1;
      scannedLines += 1;
      if (!line.trim()) continue;
      if (line.length > 1024 * 1024) continue;
      try { records.push(JSON.parse(line)); } catch {}
    }
  } else {
    throw new Error('Only JSON and JSONL transcript files are supported.');
  }

  const steps = records.slice(0, 10000).map(normalizeTranscriptStep).filter(Boolean);
  if (content.trim() && steps.length === 0) throw new Error('No readable transcript records were found in this file.');
  return steps;
}

// 4. Read a user-selected or explicitly discovered JSON transcript.
handleAppIpc('read-transcript', async (event, transcriptPath) => {
  try {
    if (!isApprovedTranscript(transcriptPath)) {
      return { success: false, error: 'Select a transcript file in Formative before opening it.' };
    }
    const approvedPath = path.normalize(path.resolve(fs.realpathSync(transcriptPath)));
    const content = readTranscriptContent(approvedPath);
    return { success: true, steps: parseTranscriptContent(content, approvedPath) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 5. Observe changes to the already selected transcript. This does not run an agent.
handleAppIpc('start-watching-transcript', async (event, transcriptPath) => {
  try {
    if (!isApprovedTranscript(transcriptPath)) {
      return { success: false, error: 'Select a transcript file in Formative before watching it.' };
    }
    const approvedPath = path.normalize(path.resolve(fs.realpathSync(transcriptPath)));
    if (!activeWatcher || activeWatcher.path !== approvedPath) {
      activeWatcher?.watcher.close();
      const watcher = fs.watch(approvedPath, (eventType) => {
        if (eventType !== 'change' || !mainWindow) return;
        try {
          const content = readTranscriptContent(approvedPath);
          const steps = parseTranscriptContent(content, approvedPath);
          mainWindow.webContents.send('live-transcript-update', steps);
        } catch {
          // A transcript may be mid-write. The next file change will be parsed.
        }
      });
      activeWatcher = { path: approvedPath, watcher };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

handleAppIpc('stop-watching-transcript', async () => {
  if (activeWatcher) {
    activeWatcher.watcher.close();
    activeWatcher = null;
  }
  return { success: true };
});

function normalizeSavedProjects(value) {
  if (!Array.isArray(value) || value.length > 500) throw new Error('Project data must be a list of at most 500 projects.');
  const projects = value.map((project) => {
    if (!project || typeof project !== 'object' || Array.isArray(project)) throw new Error('A saved project record is invalid.');
    if (typeof project.id !== 'string' || project.id.length < 1 || project.id.length > 128) throw new Error('A project has an invalid identifier.');
    if (typeof project.name !== 'string' || project.name.trim().length < 1 || project.name.length > 200) throw new Error('A project has an invalid name.');
    if (project.source !== undefined && !['folder-map', 'starter-example'].includes(project.source)) {
      throw new Error('A project has an unsupported source type.');
    }
    if (project.nextTaskNumber !== undefined && (!Number.isSafeInteger(project.nextTaskNumber) || project.nextTaskNumber < 1)) {
      throw new Error('A project has an invalid next-task number.');
    }
    const nodes = Array.isArray(project.nodes) ? project.nodes : [];
    const edges = Array.isArray(project.edges) ? project.edges : [];
    if (nodes.length > 5000 || edges.length > 10000) throw new Error('A project exceeds the supported canvas size.');

    let folderPath;
    if (typeof project.folderPath === 'string' && project.folderPath.trim().length > 0) {
      folderPath = normalizedAbsolutePath(project.folderPath);
      if (!folderPath || !approvedDirectoryPaths.has(folderPath)) throw new Error('A project folder must be selected in Formative before it can be saved.');
    } else if (project.folderPath !== undefined && project.folderPath !== null && project.folderPath !== '') {
      throw new Error('A project folder path must be an absolute path selected in Formative.');
    }
    return {
      ...project,
      name: project.name.trim(),
      folderPath,
      nodes,
      edges,
      issues: Array.isArray(project.issues) ? project.issues.slice(0, 10000) : [],
    };
  });

  const serialized = JSON.stringify(projects, null, 2);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_PROJECTS_BYTES) throw new Error('Project data exceeds the 30 MB storage limit.');
  return { projects, serialized };
}

// 6. Project storage stays inside the app's user-data directory.
handleAppIpc('get-saved-projects', async () => {
  try {
    const file = getProjectsFile();
    if (!fs.existsSync(file)) return null;
    if (fs.statSync(file).size > MAX_PROJECTS_BYTES) throw new Error('Saved project data exceeds the 30 MB storage limit.');
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(parsed)) return null;
    for (const project of parsed) {
      const savedPath = normalizedAbsolutePath(project?.folderPath);
      if (savedPath) approvedDirectoryPaths.add(savedPath);
    }
    return normalizeSavedProjects(parsed).projects;
  } catch (err) {
    console.error('Unable to read saved projects:', err.message);
    return null;
  }
});

handleAppIpc('save-projects', async (event, input) => {
  let tempFile;
  try {
    const { serialized } = normalizeSavedProjects(input);
    const targetFile = getProjectsFile();
    tempFile = `${targetFile}.${process.pid}.${crypto.randomUUID()}.tmp`;
    fs.writeFileSync(tempFile, serialized, { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tempFile, targetFile);
    return { success: true };
  } catch (err) {
    if (tempFile) {
      try { fs.rmSync(tempFile, { force: true }); } catch {}
    }
    return { success: false, error: err.message };
  }
});
