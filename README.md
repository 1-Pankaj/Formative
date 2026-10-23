<div align="center">

# Formative Studio

**Desktop Software Architecture Studio & Single-Agent Orchestration Canvas**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Web-black.svg?style=flat-square)](#quick-start)
[![Built With](https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Electron%2035-black.svg?style=flat-square)](#tech-stack)

*An engineering-grade architecture studio and real-time AI execution stream designed for autonomous workflows, microservice mapping, and local agent orchestration.*

</div>

---

## ✦ Overview

**Formative** is an open-source visual architecture studio and single-agent telemetry environment built with the high-contrast **Paperclip design system**. It bridges software architecture blueprints with live agent tool execution, allowing engineers to visualize distributed systems, map local repositories, track real issues, and watch coding agents execute in real time with **zero extra API costs**.

---

## ⚡ Key Capabilities

### 1. Visual Architecture Canvas
- **Paperclip Design Language**: Pitch-black (`#09090b`) dark mode and crisp slate light mode with high-contrast UI controls.
- **Hierarchical Layout Engine**: Clean tree auto-layout (`treeLayout.ts`) and orthogonal step connectors.
- **7 Starter Blueprints**:
  - Full-Stack Web Platform (Next.js, Fastify API Gateway, PostgreSQL, Redis Cache)
  - AI Agent Autonomous Workflow (Goal Intake, Code Graph, Tool Sandbox, Verification Critic)
  - Microservices & Event-Driven Cloud (Edge CDN, Auth Service, Orders Service, Kafka Bus)
  - Mobile & Cross-Platform Engine (React Native, GraphQL Gateway, Lambda Workers, DynamoDB)
  - Real-Time Collaborative System (Canvas Client, WebSocket Signaling, CRDT Sync Engine)
  - Data Pipeline & Vector Lakehouse (Ingestion API, Embedding Worker, Vector DB)
  - Blank Canvas (Clean slate for custom microservices)

### 2. Local AI Agent Telemetry & Console
- **Multi-Agent Connectivity**: Connects directly to local session logs for:
  - **Google Antigravity** (`~/.gemini/antigravity/brain/`)
  - **Claude Code** (`~/.claude/projects/`)
  - **OpenCode & Codex** (`~/.opencode/`, `~/.openhands/`)
- **Real-Time Step Streaming**: Displays prompts, internal thoughts, tool calls, and execution status live as your agent executes.
- **100% Offline & Private**: Reads only from your local filesystem. Zero external telemetry or secret leakage.

### 3. Local Project Directory Scanner
- Open any local repository (`Ctrl+O`) to automatically analyze directories, package configurations (`package.json`, `requirements.txt`, Dockerfiles), and construct an interactive component map with attached verification tasks.

### 4. Real Issues & Roadmap Tracking
- Persistent workspace tasks with statuses (`To Do`, `In Progress`, `Blocked`, `Completed`), assignment roles, and discussion comments stored directly alongside workspace configurations.

### 5. Interactive Org Chart & Virtual Office Floor
- **Org Chart**: Visual hierarchy mapping single-agent roles and specialist abilities (Frontend, Backend, Systems/DevOps, Database Architecture).
- **CEO Office Floor**: 2D PixiJS office simulation showing agent movement and arrival routines.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/formative.git
cd formative

# Install dependencies
npm install
```

### Running the Application

#### Option A: Windows Desktop App (Electron)
```bash
# Launch in desktop mode
npm run desktop

# Or use the 1-click batch launcher
Launch-Formative.bat
```

#### Option B: Browser Web Studio (Localhost)
```bash
# Launch the Vite dev server
npm run dev

# Or use the 1-click batch launcher
Launch-Web.bat
```

### Building Standalone Executables
```bash
# Build unpacked Windows folder (build-release/win-unpacked/Formative.exe)
npm run dist:dir

# Build single-file portable Windows executable (build-release/Formative 1.0.0.exe)
npm run dist:portable
```

---

## ⌨️ Shortcuts & Navigation

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + O` | Open & Scan Local Project Folder |
| `Ctrl + N` | Create New Architecture Workspace |
| `Spacebar + Drag` | Pan Architecture Canvas |
| `Mouse Wheel` | Zoom In / Out (`0.2x` – `2.0x`) |
| `Click + Drag` | Box Multi-Select Components |
| `Escape` | Close Open Modals & Dialogs |

---

## 🛠️ Tech Stack

- **UI Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling:** [Vite 6](https://vitejs.dev/)
- **Canvas Engine:** [@xyflow/react](https://reactflow.dev/) (React Flow v12) + [PixiJS v8](https://pixijs.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Desktop Runtime:** [Electron 35](https://www.electronjs.org/) + [Electron Builder](https://www.electron.build/)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
