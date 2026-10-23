<div align="center">

# Formative Studio

**A desktop-first project workspace for diagrams, tasks, and agent transcript review**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Desktop-black.svg?style=flat-square)](#quick-start)
[![Built With](https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Electron%2035-black.svg?style=flat-square)](#tech-stack)

</div>

---

## What Formative does today

Formative is an open-source desktop application for keeping project diagrams, tasks, and selected agent transcripts together. It is in an early foundation phase. It does **not** send prompts to an agent, start or stop agent runs, coordinate multiple agents, or report token savings.

### Projects and diagrams

- Create a blank project, open a local folder, or choose a clearly labeled static starter example.
- Edit a project canvas and save its nodes and connections with the project.
- Opening a folder creates a limited folder map. The scanner samples up to 500 top-level entries and shows up to nine folders, with a small sample of each folder’s entries. It checks a few root-level marker files, but does not analyze dependencies, inspect arbitrary source code, or run project code.

### Tasks

- Create and update task records inside a selected project.
- Task records are stored locally with the project. They do not start an agent run, and agent assignment is not available yet.

### Existing transcript review

- Open JSON or JSONL transcript files, or look for readable transcripts in the local Claude Code, OpenCode, and Antigravity locations currently supported by the app.
- Formative reads and can watch the selected file for changes. It does not connect to, prompt, start, or control the agent that produced it.
- The transcript picker does not currently support TXT, LOG, or Markdown files. Codex, OpenClaw, Ollama, Kiro, API-key connections, and MCP connections are product directions, not working integrations today.
- Transcript contents and paths can be sensitive. The user chooses which transcript file to open.

### Project office

The existing 2D pixel office is a visual simulation. It is not connected to a real agent run. The office experience is being kept separate from the current project-workflow changes.

## Privacy and costs

The desktop app works with local project folders and transcript files selected or discovered on the user’s device. It does not currently call hosted model APIs. Local or hosted agent providers may use their own network connections and may charge for their services; Formative does not claim that using those providers is free or that it saves tokens.

Project records are saved in Formative’s local app data, with a browser-storage recovery copy. The browser preview has no Electron file-access bridge, so folder scanning and transcript import require the desktop app.

## Quick start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm

### Install

Install dependencies in the project folder:

```bash
npm install
```

### Run the desktop app

```bash
npm run desktop
```

This command type-checks the app, builds the desktop UI, and launches Electron. Packaged Windows targets can be created with the commands below.

### Browser development preview

```bash
npm run dev
```

The Vite preview is for UI development. It does not provide desktop file scanning or transcript import.

### Build Windows packages

```bash
npm run dist:dir
npm run dist:portable
```

## Canvas controls

The project canvas uses React Flow interactions: scroll to zoom, drag the canvas to pan, drag nodes to reposition them, and connect node handles to create a relationship. These connections are user-authored diagram lines; Formative does not verify them against project code.

## Tech stack

- **UI:** [React 19](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite 6](https://vitejs.dev/)
- **Canvas:** [@xyflow/react](https://reactflow.dev/) and [PixiJS v8](https://pixijs.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) and [Lucide](https://lucide.dev/)
- **Desktop runtime:** [Electron 35](https://www.electronjs.org/) and [Electron Builder](https://www.electron.build/)

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
