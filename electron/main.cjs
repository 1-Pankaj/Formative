const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let activeWatcher = null;

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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1520,
    height: 960,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#09090b',
    title: 'Formative Studio: Software Architecture & Single-Agent Orchestration',
    icon: path.join(__dirname, '../public/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    autoHideMenuBar: true,
    show: true,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
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
    activeWatcher.close();
    activeWatcher = null;
  }
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC HANDLERS ---

// 1. Native Directory & File Selectors
ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Project Directory to Map',
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('select-transcript-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select Agent Log or Transcript File (.jsonl, .json, .log, .md)',
    filters: [
      { name: 'Agent Transcripts', extensions: ['jsonl', 'json', 'log', 'txt', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// 2. Real Project Folder Scanner
ipcMain.handle('scan-project-directory', async (event, folderPath) => {
  try {
    if (!folderPath || !fs.existsSync(folderPath)) {
      return { success: false, error: 'Directory does not exist' };
    }

    const projectName = path.basename(folderPath);
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });

    let projectType = 'backend';
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

    for (const ent of entries) {
      if (ent.name.startsWith('.') || ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'build') continue;

      const fullP = path.join(folderPath, ent.name);
      if (ent.isDirectory()) {
        try {
          const subFiles = fs.readdirSync(fullP).filter(f => !f.startsWith('.'));
          keyDirs.push({ name: ent.name, fileCount: subFiles.length, files: subFiles.slice(0, 5) });
        } catch (e) {
          keyDirs.push({ name: ent.name, fileCount: 0, files: [] });
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
        category: projectType === 'web' ? 'frontend' : 'gateway',
        subtitle: folderPath,
        description: `Project root containing ${keyDirs.length} packages/directories and ${rootFiles.length} root configuration files.`,
        tags: [projectType.toUpperCase(), hasDocker ? 'Docker' : 'Modular'],
        status: 'done',
      },
    });

    // Sub-directories mapped into architecture components
    keyDirs.slice(0, 9).forEach((dir, i) => {
      const nodeId = `dir-${dir.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      let category = 'backend';
      const n = dir.name.toLowerCase();

      if (n.includes('ui') || n.includes('components') || n.includes('client') || n.includes('view') || n.includes('pages')) {
        category = 'frontend';
      } else if (n.includes('api') || n.includes('routes') || n.includes('controllers') || n.includes('endpoints')) {
        category = 'gateway';
      } else if (n.includes('db') || n.includes('data') || n.includes('models') || n.includes('prisma') || n.includes('schemas')) {
        category = 'database';
      } else if (n.includes('cache') || n.includes('redis')) {
        category = 'cache';
      } else if (n.includes('queue') || n.includes('events') || n.includes('kafka')) {
        category = 'queue';
      } else if (n.includes('jobs') || n.includes('workers') || n.includes('cron')) {
        category = 'worker';
      } else if (n.includes('ai') || n.includes('agent') || n.includes('agents') || n.includes('llm')) {
        category = 'ai-agent';
      } else if (n.includes('auth') || n.includes('security')) {
        category = 'auth';
      }

      const col = (i % 3) + 1;
      const row = Math.floor(i / 3);

      nodes.push({
        id: nodeId,
        type: 'archNode',
        position: { x: 100 + col * 400, y: 80 + row * 240 },
        data: {
          label: `${dir.name}`,
          category,
          subtitle: `./${dir.name}`,
          description: `Discovered directory containing ${dir.fileCount} source files (${dir.files.join(', ')}).`,
          tags: [`${dir.fileCount} Files`, category.toUpperCase()],
          status: 'done',
        },
      });

      edges.push({
        id: `e-core-${nodeId}`,
        source: 'core-root',
        target: nodeId,
        animated: true,
      });
    });

    return {
      success: true,
      project: {
        id: `proj-${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: projectName,
        description: `Mapped from local workspace: ${folderPath}`,
        type: projectType,
        folderPath,
        updatedAt: new Date().toISOString(),
      issues: [
        {
          id: `iss-${Date.now()}-1`,
          key: 'TASK-1',
          title: `Inspect architecture components for ${projectName}`,
          status: 'in_progress',
          assignee: 'Chief Executive Agent',
          assigneeInitials: 'CEO',
          projectName,
          projectColor: '#3b82f6',
          isLive: true,
          date: 'Today',
          description: `Analyze mapped directories (${keyDirs.map(d => d.name).slice(0, 4).join(', ')}) and verify service boundaries.`,
        },
        {
          id: `iss-${Date.now()}-2`,
          key: 'TASK-2',
          title: 'Trace package dependencies and data flow',
          status: 'todo',
          assignee: 'Systems & Backend Specialist',
          assigneeInitials: 'BE',
          projectName,
          projectColor: '#10b981',
          isLive: false,
          date: 'Today',
          description: `Validate imports and inter-module connections across ${keyDirs.length} scanned packages.`,
        },
      ],
      nodes,
      edges,
    },
  };
} catch (err) {
    console.error('Scan project error:', err);
    return { success: false, error: err.message };
  }
});

// Helper to scan directory for transcript files
function findTranscriptsRecursively(dirPath, maxDepth = 3, currentDepth = 0) {
  const results = [];
  if (currentDepth > maxDepth || !fs.existsSync(dirPath)) return results;

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name.startsWith('.') && ent.name !== '.claude' && ent.name !== '.openhands') continue;
      const fullPath = path.join(dirPath, ent.name);
      if (ent.isDirectory()) {
        results.push(...findTranscriptsRecursively(fullPath, maxDepth, currentDepth + 1));
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if (['.jsonl', '.json', '.log'].includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  } catch (e) {}

  return results;
}

// 3. Multi-Agent Provider Sessions Discovery
ipcMain.handle('get-agent-sessions', async (event, providerId = 'claude-code') => {
  try {
    const sessions = [];
    const homeDir = app.getPath('home');

    // Provider A: Claude Code
    if (providerId === 'claude-code') {
      const claudeLocations = [
        path.join(homeDir, '.claude', 'projects'),
        path.join(homeDir, '.claude', 'logs'),
        path.join(homeDir, '.claude'),
      ];

      for (const loc of claudeLocations) {
        if (fs.existsSync(loc)) {
          const files = findTranscriptsRecursively(loc, 2);
          for (const f of files) {
            try {
              const stat = fs.statSync(f);
              const base = path.basename(f);
              let title = `Claude Code Session (${base.slice(0, 8)})`;
              let lineCount = 1;

              try {
                const rawHead = fs.readFileSync(f, 'utf8').split('\n').slice(0, 30);
                lineCount = rawHead.filter(Boolean).length;
                for (const line of rawHead) {
                  if (!line.trim()) continue;
                  const parsed = JSON.parse(line);
                  if (parsed.message && parsed.message.role === 'user' && typeof parsed.message.content === 'string') {
                    title = parsed.message.content.trim().slice(0, 60);
                    break;
                  } else if (parsed.content && typeof parsed.content === 'string' && parsed.content.length > 5) {
                    title = parsed.content.trim().slice(0, 60);
                    break;
                  }
                }
              } catch (e) {}

              sessions.push({
                id: f,
                title,
                provider: 'Claude Code',
                transcriptPath: f,
                updatedAt: stat.mtimeMs,
                lineCount,
                isCurrent: false,
              });
            } catch (e) {}
          }
        }
      }
    }

    // Provider B: OpenCode / Codex / Aider / OpenHands
    else if (providerId === 'opencode') {
      const openCodeLocations = [
        path.join(homeDir, '.opencode'),
        path.join(homeDir, '.config', 'opencode'),
        path.join(homeDir, '.openhands'),
        path.join(homeDir, '.aider'),
      ];

      for (const loc of openCodeLocations) {
        if (fs.existsSync(loc)) {
          const files = findTranscriptsRecursively(loc, 2);
          for (const f of files) {
            try {
              const stat = fs.statSync(f);
              const base = path.basename(f);
              sessions.push({
                id: f,
                title: `OpenCode / Agent (${base})`,
                provider: 'OpenCode',
                transcriptPath: f,
                updatedAt: stat.mtimeMs,
                lineCount: 1,
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
        const entries = fs.readdirSync(brainDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const transcriptPath = path.join(brainDir, entry.name, '.system_generated', 'logs', 'transcript.jsonl');
            if (fs.existsSync(transcriptPath)) {
              const stat = fs.statSync(transcriptPath);
              let title = `Antigravity Session (${entry.name.slice(0, 8)})`;
              let lineCount = 0;

              try {
                const content = fs.readFileSync(transcriptPath, 'utf8');
                const lines = content.trim().split('\n').filter(Boolean);
                lineCount = lines.length;

                for (const l of lines) {
                  const obj = JSON.parse(l);
                  if (obj.type === 'USER_INPUT' && obj.content) {
                    title = obj.content.replace(/<[^>]+>/g, '').trim().slice(0, 60);
                    break;
                  }
                }
              } catch (e) {}

              sessions.push({
                id: entry.name,
                title,
                provider: 'Antigravity',
                transcriptPath,
                updatedAt: stat.mtimeMs,
                lineCount,
                isCurrent: false, // Never auto-select or force on startup
              });
            }
          }
        }
      }
    }

    sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    return sessions;
  } catch (err) {
    console.error('Error reading agent sessions:', err);
    return [];
  }
});

// 4. Read Transcript & Parse Multi-Format Trajectories
ipcMain.handle('read-transcript', async (event, transcriptPath) => {
  try {
    if (!transcriptPath || !fs.existsSync(transcriptPath)) return [];
    const content = fs.readFileSync(transcriptPath, 'utf8');

    // Case 1: JSONL file
    if (transcriptPath.endsWith('.jsonl') || content.trim().startsWith('{')) {
      const lines = content.trim().split('\n').filter(Boolean);
      const steps = [];

      for (let i = 0; i < lines.length; i++) {
        try {
          const raw = JSON.parse(lines[i]);
          
          // Normalized schema:
          let step_index = raw.step_index || i + 1;
          let source = raw.source || raw.role || 'agent';
          let type = raw.type || (raw.role === 'user' ? 'USER_INPUT' : 'PLANNER_RESPONSE');
          let status = raw.status || 'DONE';
          let created_at = raw.created_at || raw.timestamp || new Date().toISOString();
          let thinking = raw.thinking || raw.reasoning || undefined;
          let textContent = raw.content || raw.message || '';

          // Normalize Claude Code / OpenAI tool_calls
          let tool_calls = raw.tool_calls;
          if (!tool_calls && raw.tool_use) {
            tool_calls = [{ name: raw.tool_use.name, args: raw.tool_use.input }];
          } else if (!tool_calls && raw.function_call) {
            tool_calls = [{ name: raw.function_call.name, args: raw.function_call.arguments }];
          }

          let cleanContent = '';
          if (typeof textContent === 'string') {
            cleanContent = textContent
              .replace(/<USER_REQUEST>[\s\S]*?<\/USER_REQUEST>/g, (m) => m.replace(/<\/?USER_REQUEST>/g, ''))
              .replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '')
              .replace(/<SYSTEM_MESSAGE>[\s\S]*?<\/SYSTEM_MESSAGE>/g, '')
              .trim();
          } else if (Array.isArray(textContent)) {
            // Claude format array of blocks
            cleanContent = textContent
              .map(b => b.text || (b.type === 'tool_use' ? `Tool: ${b.name}` : ''))
              .filter(Boolean)
              .join('\n');
          }

          steps.push({
            step_index,
            source,
            type,
            status,
            created_at,
            content: textContent,
            cleanContent,
            thinking,
            tool_calls,
          });
        } catch (e) {}
      }

      return steps;
    }

    // Case 2: Full JSON Array
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          step_index: item.step_index || idx + 1,
          source: item.source || item.role || 'agent',
          type: item.type || (item.role === 'user' ? 'USER_INPUT' : 'PLANNER_RESPONSE'),
          status: item.status || 'DONE',
          created_at: item.created_at || new Date().toISOString(),
          cleanContent: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
          thinking: item.thinking,
          tool_calls: item.tool_calls,
        }));
      }
    } catch (e) {}

    return [];
  } catch (err) {
    console.error('Error reading transcript:', err);
    return [];
  }
});

// 5. Watch Transcript Real-Time
ipcMain.handle('start-watching-transcript', async (event, transcriptPath) => {
  try {
    if (activeWatcher) {
      activeWatcher.close();
      activeWatcher = null;
    }

    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      return { success: false, message: 'File not found' };
    }

    activeWatcher = fs.watch(transcriptPath, async (eventType) => {
      if (eventType === 'change' && mainWindow) {
        try {
          const content = fs.readFileSync(transcriptPath, 'utf8');
          const lines = content.trim().split('\n').filter(Boolean);
          const steps = [];
          for (let i = 0; i < lines.length; i++) {
            try {
              const raw = JSON.parse(lines[i]);
              steps.push({
                step_index: raw.step_index || i + 1,
                source: raw.source || raw.role || 'agent',
                type: raw.type || (raw.role === 'user' ? 'USER_INPUT' : 'PLANNER_RESPONSE'),
                status: raw.status || 'DONE',
                created_at: raw.created_at || new Date().toISOString(),
                cleanContent: (raw.content || '').replace(/<[^>]+>/g, '').trim(),
                thinking: raw.thinking,
                tool_calls: raw.tool_calls,
              });
            } catch (e) {}
          }
          mainWindow.webContents.send('live-transcript-update', steps);
        } catch (e) {}
      }
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('stop-watching-transcript', async () => {
  if (activeWatcher) {
    activeWatcher.close();
    activeWatcher = null;
  }
  return { success: true };
});

// 6. Project Storage
ipcMain.handle('get-saved-projects', async () => {
  try {
    const file = getProjectsFile();
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {}
  return null;
});

ipcMain.handle('save-projects', async (event, projects) => {
  try {
    fs.writeFileSync(getProjectsFile(), JSON.stringify(projects, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
