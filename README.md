<div align="center">

<img src="public/assets/FormativeLogo.png" alt="Formative logo" width="88" />

# Formative

**A desktop workspace for project diagrams, tasks, and local agent conversations.**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Desktop-black.svg?style=flat-square)](#quick-start)
[![Built With](https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Electron%2035-black.svg?style=flat-square)](#tech-stack)

</div>

---

Formative brings project work, architecture diagrams, and supported local agent tools into one open-source desktop app. It is released under the MIT License and has no Formative subscription plans or paid feature gates.

> [!NOTE]
> Formative is in active development. The sections below describe what works today and what is still planned.

<p align="center">
  <a href="#what-works-today">Features</a> ·
  <a href="#agent-connections">Agent connections</a> ·
  <a href="#privacy-and-provider-costs">Privacy</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#tech-stack">Tech stack</a>
</p>

## What works today

| Area | Available now |
| --- | --- |
| Projects | Create a project, open a local folder, or start from a clearly labeled example. Choose a project before opening its work areas. |
| Canvas diagram | Add, edit, move, and connect components. The diagram is saved with the project and stays under your control. |
| Project structure | Browse a limited folder view and see what selected root files suggest about the project. This view does not inspect source code. |
| Architecture map | Build a separate, read-only map from local source files. It follows resolvable imports, recognizes selected framework routes, and marks inferred links. |
| Tasks and issues | Create and update project tasks. Link a task to Agent Chat to include its key, title, status, and description as context. Comments are not included. |
| Agent Chat | Start or resume read-only conversations through local Codex CLI and Claude Code CLI installations. |
| Transcript review | Open JSON or JSONL transcripts, or browse supported local transcript locations. Review is read-only and does not control the agent that created the file. |
| Project Office | Explore the 2D pixel office simulation. It is not connected to live agent activity. |

### Project structure and architecture map

These are separate views. The Project structure scan samples up to 500 root entries, maps up to nine top-level folders, and samples up to 50 entries in each mapped folder. It checks selected files such as `package.json`, framework configuration, Python project files, and Docker configuration.

The Architecture map reads a bounded set of selected local source files. It can group files into modules, follow local imports across supported languages, recognize selected Next.js, Remix, SvelteKit, Nuxt, and Astro route patterns, and suggest links between API calls and routes or source references and schemas. Import links are observed in source; API and schema links are labeled as inferences.

Analysis runs locally. Formative does not execute project code, install dependencies, or upload source files. Dynamic imports, runtime behavior, generated code, and unsupported conventions may not appear. External package nodes currently come from `package.json`; other language ecosystems appear when imports resolve to scanned local files. File and graph limits are shown with the results.

JavaScript and TypeScript imports use a syntax parser, including scripts in Vue, Svelte, and Astro files. Python, Go, Rust, Java, C#, PHP, and Ruby imports use conservative pattern matching, so some relationships may be missed.

Opening a folder again refreshes its Project structure scan while preserving the editable canvas. Refreshing the Architecture map updates that map separately.

### Agent connections

The current connections use the provider's installed command-line tools:

| Provider | Current behavior |
| --- | --- |
| Codex | Uses its read-only sandbox and may run read-only checks. |
| Claude Code | Starts in Plan mode with project reading and search. Shell commands, file editing, and project MCP tools are not enabled in this workflow. |

These connections are early implementations. Packaged-app and provider-runtime verification is still in progress.

Formative checks whether the local command is installed, but does not check provider sign-in. Your prompt and relevant project context may be sent through the provider's service, and provider fees may apply. Formative does not currently coordinate multiple agents or measure token savings.

Codex desktop conversations, Claude Code desktop sessions, and running Antigravity IDE sessions are not connected. Antigravity IDE support is a priority. Connections for OpenCode, OpenClaw, Ollama, Kiro, API keys, and MCP are also planned, but are not available integrations today.

### Transcript review

Formative can read and watch a selected transcript file for changes. It can discover supported local Claude Code, OpenCode, and Antigravity transcript locations. Antigravity IDE session folders are not discovered yet. The transcript is temporary, is cleared when you switch projects, and is not saved as an Agent Chat conversation. The picker currently supports JSON and JSONL files.

## Privacy and provider costs

Project records are saved in Formative's local app data, with a browser-storage recovery copy. The browser preview does not have Electron file access, so local folder scanning and transcript import require the desktop app.

Architecture analysis reads selected project files on your device and does not send them to Formative. Agent Chat uses the provider service associated with the selected CLI. The provider may receive your prompt and relevant project context; provider usage or subscription fees may apply. Transcript contents and file paths can be sensitive, so choose files deliberately.

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

This command checks the TypeScript, builds the interface, and launches Electron.

### Browser development preview

```bash
npm run dev
```

The browser preview is for interface development. It cannot scan local folders or import transcripts.

### Build Windows packages

These commands create an unpacked review build or a portable executable. A standard Windows installer is planned for the final delivery phase, after product work and release verification.

```bash
npm run dist:dir
npm run dist:portable
```

## Canvas controls

Scroll to zoom, drag the canvas to pan, move nodes by dragging them, and connect components from one node handle to another. Canvas connections are user-authored diagram lines; Formative does not verify them against project code.

## Tech stack

- **UI:** [React 19](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite 6](https://vitejs.dev/)
- **Canvas:** [@xyflow/react](https://reactflow.dev/) and [PixiJS v8](https://pixijs.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) and [Lucide](https://lucide.dev/)
- **Desktop runtime:** [Electron 35](https://www.electronjs.org/) and [Electron Builder](https://www.electron.build/)

## License

Formative is distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
