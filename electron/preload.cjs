const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('formativeApi', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectTranscriptFile: () => ipcRenderer.invoke('select-transcript-file'),
  scanProjectDirectory: (path) => ipcRenderer.invoke('scan-project-directory', path),
  readArchitectureSources: (path) => ipcRenderer.invoke('read-architecture-sources', path),
  getSavedProjects: () => ipcRenderer.invoke('get-saved-projects'),
  saveProjects: (projects) => ipcRenderer.invoke('save-projects', projects),
  getAgentSessions: (providerId) => ipcRenderer.invoke('get-agent-sessions', providerId),
  readTranscript: (path) => ipcRenderer.invoke('read-transcript', path),
  startWatchingTranscript: (path) => ipcRenderer.invoke('start-watching-transcript', path),
  stopWatchingTranscript: () => ipcRenderer.invoke('stop-watching-transcript'),
  getAgentProviderStatuses: () => ipcRenderer.invoke('get-agent-provider-statuses'),
  startAgentRun: (request) => ipcRenderer.invoke('start-agent-run', request),
  stopAgentRun: (request) => ipcRenderer.invoke('stop-agent-run', request),
  generateOfficeDialogue: (request) => ipcRenderer.invoke('generate-office-dialogue', request),
  onLiveTranscriptUpdate: (callback) => {
    const handler = (event, steps) => callback(steps);
    ipcRenderer.on('live-transcript-update', handler);
    return () => ipcRenderer.removeListener('live-transcript-update', handler);
  },
  onAgentRunEvent: (callback) => {
    const handler = (event, payload) => callback(payload);
    ipcRenderer.on('agent-run-event', handler);
    return () => ipcRenderer.removeListener('agent-run-event', handler);
  },
});
