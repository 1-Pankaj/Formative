# Formative Studio: Comprehensive Architecture, Findings & Engineering Handbook

**Document Path:** `docs/antigravityfindings.md`  
**Target Repository:** Formative Studio (Desktop-first Windows Application for Coding Agents)  
**Workspace:** `d:\Codeloom\Internal Projects\Structra`  
**Status:** Living Master Specification & Engineering Guide  
**Reference Document:** `docs/PRODUCT_PLAN.md`  

---

## 1. Executive Overview & Core Philosophy

Formative Studio is an open-source, desktop-first workspace for Windows designed to bring structural visibility, architectural discipline, and grounded telemetry to coding agents. It unifies freeform system design, deterministic multi-language source mapping, real agent CLI execution, task tracking, and a living 3D procedural office.

### The Five Non-Negotiable Product Boundaries
1. **Zero Mock Runs / Zero Fake Reasoning**: Formative never synthesizes fake agent output, artificial thoughts, or simulated telemetry. An agent run is backed exclusively by a real local CLI process (`codex-cli`, `claude-code`) or a real IDE transcript (`Antigravity`).
2. **No SaaS Accounts or Cloud Subscriptions**: Formative runs 100% locally on the user's machine. It never requires a Formative user account, login, or billing subscription. It leverages user-owned local CLIs and credentials.
3. **Canvas vs. Architecture Map Separation**:
   - **Interactive Canvas (`agent-flow`)**: An editable, expressive blackboard where developers model architectures, write notes, and plan workflows using `@xyflow/react`.
   - **Architecture Map (`architecture`)**: A strictly read-only, evidence-backed reflection of the actual filesystem and source code, computed deterministically via an isolated Web Worker.
4. **Preserved 3D Isometric Office Experience**: The procedural Three.js 3D office is a foundational visual anchor and operational floor reflecting real agent work. It is never reverted to flat 2D tile engines or discarded.
5. **Windows-First Architecture**: Paths, process termination (`taskkill /pid <PID> /T /F`), shells, and system dialogues are optimized specifically for Windows. Packaging into an NSIS installer is strictly the final deliverable (Phase 8/9).

---

## 2. Codebase Topology & Graphify Knowledge Graph Insights

The codebase was extracted using Graphify (`graphify extract . --code-only`), generating a comprehensive AST knowledge graph in `graphify-out/graph.json` and an Obsidian visual vault in `graphify-out/obsidian/`.

### Graph Metrics
- **Total AST Nodes:** 840 (declarations, components, types, functions, IPC channels)
- **Total Edges:** 1,842 (calls, imports, state subscriptions, IPC listeners)
- **Detected Communities:** 59 modular clusters across 50 source files

### Primary God Nodes & Architectural Anchors
- **`createThreeOffice()`** in `src/components/office/three/ThreeOfficeEngine.ts` (126 edges): Core Three.js procedural engine managing isometric camera geometry, pixel-art shaders, character skeletons, lighting cycles, desk typing states, and canvas portrait generation.
- **`ThemeMode`** in `src/types/index.ts` (44 edges): Global theme discriminator (`'dark' | 'light'`) ensuring high contrast and seamless token switching across every view, modal, and drawer.
- **`App()`** in `src/App.tsx` (30 edges): Top-level application orchestrator managing view routing, active project state, dual-rail layout, keyboard shortcuts, and atomic file persistence.
- **`Project`** in `src/types/index.ts` (29 edges): The central data contract linking tasks (`issues`), canvas nodes/edges, folder scans, architecture maps, employee rosters, and agent run histories.
- **`buildArchitectureMap()`** in `src/workers/architectureMap.worker.ts` (17 edges): Background AST and tokenizer engine running off the main thread to parse codebases across 9+ languages without causing UI drops.

---

## 3. Subsystem Deep-Dive: File-by-File Reality

```
Structra / Formative
├── docs/
│   ├── PRODUCT_PLAN.md                  # Comprehensive product plan & phase roadmap
│   └── antigravityfindings.md           # This document (Architecture, Findings & Handbook)
├── electron/
│   ├── main.cjs                         # Main process: Window setup, IPC handlers, process kill, atomic save
│   ├── preload.cjs                      # Context isolation bridge exposing window.formativeApi
│   ├── agent-run-manager.cjs            # Child process manager for codex-cli & claude-code streaming
│   ├── agent-run-history.cjs            # Schema validation & monotonic sequence normalization
│   └── architecture-source-reader.cjs   # Local file walker with size caps & secret exclusions
├── src/
│   ├── App.tsx                          # Root React view router, dual-rail navigation, persistence
│   ├── index.css                        # Tailwind directives, custom scrollbars, canvas styles
│   ├── types/
│   │   ├── index.ts                     # Project, Issues, Theme, Office Profile, Canvas Node types
│   │   ├── architectureMap.ts           # ArchitectureMap, Module, Connection, Summary types
│   │   ├── agentRuns.ts                 # AgentRun, AgentEvent, Provider Status, Capabilities types
│   │   └── electron.d.ts                # TypeScript bridge types for window.formativeApi
│   ├── workers/
│   │   └── architectureMap.worker.ts    # Web Worker: Babel AST parser + Multi-language regex tokenizers
│   ├── components/
│   │   ├── AppNavigation.tsx            # Dual-rail navigation bar (slim icon rail + project rail)
│   │   ├── WelcomeScreen.tsx            # Project library, recent workspaces, template starters
│   │   ├── ProjectHomeView.tsx          # Project dashboard, folder scan summary, quick actions
│   │   ├── ArchitectureMapView.tsx      # Read-only static architecture graph viewer
│   │   ├── AgentChatView.tsx            # Real-time CLI agent terminal stream & conversation viewer
│   │   ├── IssuesView.tsx               # Kanban task board, employee assignees, run summaries
│   │   ├── Header.tsx                   # Top project title bar, run status, layout triggers
│   │   ├── Sidebar.tsx                  # Canvas card block palette
│   │   ├── Inspector.tsx                # Selected canvas node property inspector
│   │   ├── ContextMenu.tsx              # Canvas right-click context menu
│   │   ├── InteractiveGuide.tsx         # User guide and onboarding overlay
│   │   ├── LaunchpadModal.tsx           # Quick project switcher and template launcher
│   │   ├── NewProjectModal.tsx          # Project creation dialog (folder link or template)
│   │   ├── SettingsModal.tsx            # Global preferences and diagnostics
│   │   ├── TutorialModal.tsx            # Interactive feature walkthrough
│   │   ├── ui/
│   │   │   └── FormativeGlyphs.tsx      # Custom inline SVG glyph system (Zero icon dependencies)
│   │   ├── nodes/                       # React Flow custom canvas node cards
│   │   │   ├── ArchitectureCardNode.tsx # High-level architecture card
│   │   │   ├── ArchNode.tsx             # System node with port connectors
│   │   │   ├── AgentStepNode.tsx        # Agent workflow step card
│   │   │   └── NoteNode.tsx             # Freeform sticky note card
│   │   └── office/                      # 3D Procedural Office Subsystem
│   │       ├── OfficeFloorView.tsx      # Three.js canvas mount, depth slider, stats overlay
│   │       ├── OfficeCoordinatorChat.tsx# In-office chat with Rex (CEO) grounded in project tasks
│   │       ├── EmployeeSetupModal.tsx   # Custom employee roster editor (appearance, role, provider)
│   │       ├── officeCast.ts            # Default roster data, department mappings, skill labels
│   │       ├── officeDialogue.ts        # Quip generator and employee personality phrases
│   │       ├── officeDispatcher.ts      # Assigns incoming agent runs to designated employees
│   │       ├── useOfficeModalAccessibility.ts # Focus trapping & escape key handlers
│   │       └── three/
│   │           └── ThreeOfficeEngine.ts # 5,120-line procedural Three.js isometric engine
│   └── utils/
│       ├── canvasNodeCompatibility.ts   # Migrates legacy node data formats safely
│       └── treeLayout.ts                # Hierarchical tree auto-layout generator
├── package.json                         # Dependencies, scripts, and electron-builder config
├── tailwind.config.js                   # Color palette, font tokens, and drop-shadow definitions
└── tsconfig.json                        # TypeScript strict mode compiler options
```

### Detailed Subsystem Analysis

#### 3.1 Electron Main Process & Security (`electron/main.cjs`)
- **Sandboxing & Isolation**: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and strict CSP headers applied on all windows.
- **Origin Validation**: `isTrustedFrame(event.senderFrame)` validates that IPC messages originate exclusively from the legitimate application frame.
- **Process Termination on Windows**: Uses `taskkill /pid <PID> /T /F` to kill the entire process tree of child agent processes, preventing orphaned node/python/exe processes in Windows Task Manager.
- **Atomic Persistence with Self-Healing**:
  1. Writes to `projects.json.tmp`.
  2. Renames `projects.json.tmp` to `projects.json`.
  3. Maintains a fallback `projects.json.bak` backup.
  4. If `projects.json` fails JSON validation on startup, it automatically restores from `projects.json.bak` and preserves corrupted data in `projects.json.corrupt.<timestamp>` for safety.

#### 3.2 Agent CLI Execution Pipeline (`electron/agent-run-manager.cjs`)
- **Supported Providers**: Codex CLI (`codex-cli`) and Claude Code CLI (`claude-code`).
- **Read-Only Enforced Flags**: Passes `--approval-mode read-only` and `--safety-mode read-only` to prevent unintended disk writes during exploration.
- **NDJSON Stream Parsing**: Normalizes heterogeneous CLI outputs line-by-line into standard Formative events:
  - `tool_started`: Extracted tool name, call args.
  - `tool_finished`: Output snippet, exit status.
  - `file_changed`: Project-relative paths only.
  - `assistant_message`: Clean user-visible markdown content.
  - `error`: Actionable error messages.
- **Monotonic Event Sequencing**: `electron/agent-run-history.cjs` ensures strictly incrementing `sequence` integers per run so the renderer can detect drops or ordering anomalies.

#### 3.3 Deterministic Architecture Scanner & Worker (`src/workers/architectureMap.worker.ts`)
- **Safe Reader (`electron/architecture-source-reader.cjs`)**:
  - Scans up to 4,000 files; reads up to 450 source files; caps files at 256KB.
  - Honors `.gitignore`.
  - Excludes secrets: `.env`, `*.pem`, `id_rsa`, `credentials.json`, `*secret*`, etc.
- **Web Worker Parser**:
  - **JavaScript / TypeScript / JSX / TSX**: Full Babel AST parser extracting imports, exports, API calls (`fetch`, `axios`), route patterns.
  - **Python / Go / Rust / Java / C# / PHP / Ruby**: High-performance regex tokenizers extracting packages, classes, route declarations, and dependencies.
  - **Framework Route Conventions**: Automatically maps file paths to HTTP routes for Next.js (App & Pages router), Remix, SvelteKit, Nuxt, and Astro.
  - **Data Schemas**: Detects Prisma models, GraphQL schemas, Protobuf files, and SQL table declarations.

#### 3.4 Procedural 3D Office Subsystem (`src/components/office/`)
- **Procedural Geometry**: Does NOT require external `.gltf` / `.obj` 3D files. Desks, monitors, plants, walls, floors, and characters are procedurally constructed using Three.js primitive geometries.
- **Procedural Character Styling**:
  - Customizable hair styles: `short`, `curly`, `bald`, `buzz`, `ponytail`, `messy`, `long`, `bun`, `cap`.
  - Custom colors: skin, hair, shirt, pants, tie, cap.
  - Accessories: glasses, headsets, business suits.
- **Dynamic Office States**:
  - Time-of-day lighting: Morning, Noon, Sunset, Night with smooth color temperature transitions.
  - Depth effect: Tilt slider (default 40%) adjusting isometric perspective angle.
  - Live Desk Reactions: Characters sit at desks and play typing animations when assigned agent runs are active, and celebration animations on completion.
- **Grounded Coordinator**: `OfficeCoordinatorChat.tsx` interfaces with Rex (CEO/Coordinator), answering questions grounded in actual project tasks and architecture.

---

## 4. UI Design System & Aesthetic Preservation Guide ("Do Not Lose Plot")

Formative features a bespoke, refined dark-mode-first aesthetic with a carefully calibrated warm accent. Any future additions MUST adhere strictly to these tokens and patterns.

### 4.1 Color Tokens & Palettes

```
Brand (Terracotta / Warm Red-Orange):
  DEFAULT:       #E04418   (Primary actions, active states, key accents)
  hover:         #F25224   (Hovered buttons and links)
  active:        #C7380F   (Pressed states)
  subtle:        rgba(224, 68, 24, 0.12) (Pill backgrounds, badge fills)
  border:        rgba(224, 68, 24, 0.28) (Accent outlines, highlighted node borders)
  glow:          rgba(224, 68, 24, 0.35) (Focus rings, execution pulses)

Dark Mode Surfaces:
  App Background:        #09090b / #0E0F12 (Deep void background)
  Sidebar & Panels:      #0c0c0e / #15171D (Secondary container background)
  Elevated Cards:        #18181b / #1A1C24 (Card surfaces, modals)
  Hover Surface:         #222530 / #27272a (Interactive rows on hover)
  Border Strong:         #27272a / #272A36 (Container dividers)
  Border Subtle:         #1F222C           (Subtle card outlines)

Light Mode Surfaces:
  App Background:        #fafafa
  Sidebar & Panels:      #f4f4f5
  Elevated Cards:        #ffffff
  Border:                #e4e4e7 (zinc-200)

Text & Typography Hierarchy:
  ink.primary:           #FFFFFF           (Headings, primary values)
  ink.secondary:         #E2E4E9           (Body text, table values)
  ink.muted:             #9A9DA8           (Labels, timestamps, secondary descriptions)
  ink.faint:             #626572           (Disabled text, subtle metadata)
```

### 4.2 Typography Rules
- **Sans-Serif (`font-sans`)**: `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`. Used for all UI copy, navigation items, headings, dialogs, and task cards.
- **Monospace (`font-mono`)**: `JetBrains Mono, Consolas, monospace`. Used for terminal outputs, agent event streams, file paths, line numbers, code snippets, and token metrics.

### 4.3 Custom Icon System (`FormativeGlyphs.tsx`)
- Formative does **NOT** import heavyweight icon packages like `lucide-react` or `@heroicons/react` into the client bundle.
- It uses a custom SVG glyph component:
  ```tsx
  <FormativeGlyph name="terminal" className="w-4 h-4 text-brand" />
  ```
- All standard Lucide names (`ArrowLeft`, `Bot`, `Cpu`, `Layers`, `Terminal`, `Settings`, etc.) are mapped via internal aliases in `FormativeGlyphs.tsx`. Always use `FormativeGlyph`.

### 4.4 Layout Proportions & Dual-Rail Navigation
- **Rail 1 (Slim Icon Rail)**: Fixed width `44px` (expandable to `52px` on XL displays). Hosts the logo badge, project quick-switch buttons, new project button, theme toggle, and settings triggers.
- **Rail 2 (Project Context Rail)**: Width `240px`. Hosts the project selector, project metadata, and primary view navigation pills.
- **Main Viewport**: Fills remaining width with `overflow-hidden`. Views manage their own internal scrolling or canvas panning.

---

## 5. Code Writing Standards & Engineering Protocol

To maintain high code quality and prevent any breakage across the repository:

### 5.1 Strict TypeScript & Typings
- **No `any` in new code**: Define explicit interfaces and export them from `src/types/`.
- **Strict Null Checks**: Always handle `null` and `undefined` guards explicitly.
- **Type-Only Imports**: Use `import type { ... } from '...'` whenever importing contracts or interfaces.

### 5.2 IPC Bridge Protocol
- **Renderer Protection**: The renderer (`src/`) must **NEVER** import Node.js built-ins (`fs`, `path`, `child_process`).
- **All IPC must pass through `window.formativeApi`**:
  - Methods declared in `electron/preload.cjs`.
  - Types mirrored in `src/types/electron.d.ts`.
  - Handlers validated with `isTrustedFrame` in `electron/main.cjs`.

### 5.3 Web Worker Computation
- Any AST parsing, large regex scans, or dependency graph generation **MUST** run inside `src/workers/architectureMap.worker.ts`.
- The main UI thread must remain responsive at 60fps at all times.

### 5.4 Three.js Memory & Resource Safety
- All Three.js objects (geometries, materials, textures, renderers) must have explicit `.dispose()` calls upon unmounting or scene teardown to prevent WebGL context leaks on Windows.

---

## 6. Development Workflow (Zero-Regression Protocol)

Whenever developing or improving features in Formative Studio:

```
[Inspect Target Files] ──> [Surgical Clean Edits] ──> [Typecheck: tsc --noEmit] 
                                                                 │
[Graphify Sync: graphify update .] <── [Electron Runtime Check] <── [Build: vite build]
```

1. **Surgical Scope**: Inspect the target source files first. Edit only what is necessary for the specific task.
2. **Typecheck Gate**: Run `zap npm run build` (`tsc && vite build`) to confirm there are zero TypeScript compiler errors or bundle breaks.
3. **Runtime Verification**: Test the feature inside Electron via `zap npm run start` or `zap npm run desktop`.
4. **Graphify Synchronization**: After modifying or adding features, run `zap graphify update .` to keep the Obsidian knowledge graph and AST index 100% synchronized at zero cost.

---

## 7. Master Phased Task Roadmap (Phases 1 through 9)

```
Phase 1: Verification, Baseline Safety Net & Process Hardening (Highest Priority)
Phase 2: Live Architecture Map Execution Overlay (Phase 3D - High Priority)
Phase 3: Antigravity IDE Live Observer Bridge (Phase 3C - High Priority)
Phase 4: Agent-Assisted Architecture Proposals (Phase 4B - High Priority)
Phase 5: State-Aware First-Success Onboarding & UX Polish (Phase 3E - Medium Priority)
Phase 6: Multi-Language AST Expansion & Drift Detection (Phase 4A & 4C - Medium Priority)
Phase 7: Performance, WebGL Lifecycle & Canvas Virtualization (Phase 5 - Stability)
Phase 8: Open-Source Readiness, CI/CD & Community Docs (Phase 7 - Community Priority)
Phase 9: Windows Packaging & Final Release Delivery (Phase 8 - Final Deliverable)
```

### Detailed Phase Tasks

#### Phase 1: Verification, Baseline Safety Net & Process Hardening
- **[T1.1] Vitest Unit Test Harness Setup**: Set up tests for Web Worker AST parsers, regex tokenizers, and normalization schemas (`electron/agent-run-history.cjs`) in isolation without touching runtime code.
- **[T1.2] CLI Process Lifecycle & `taskkill` Verification**: Verify Windows process tree termination via `taskkill /pid <PID> /T /F` so child CLI processes never linger in Task Manager.
- **[T1.3] Graceful Failure & CLI Auth Handling**: Provide human-readable UI guidance when CLI binaries are missing from PATH, when keys expire, or when network drops.
- **[T1.4] Startup Self-Healing & Interrupted Runs**: Validate that abruptly terminating the app during an active run cleanly transitions stale runs to `interrupted` upon relaunch.
- **[T1.5] Windows Path & Space Normalization**: Audit file walking and route resolution when directories contain spaces (e.g. `d:\Codeloom\Internal Projects\Structra`).

#### Phase 2: Live Architecture Map Execution Overlay (Phase 3D)
- **[T2.1] Runtime Event-to-File Matcher**: Pure utility mapping normalized events (`tool_started`, `file_changed`) against Architecture Map nodes.
- **[T2.2] Visual Node Glow & Activity Pulse**: Non-destructive pulsing borders on active nodes in `ArchitectureMapView.tsx` that fade gracefully when idle.
- **[T2.3] Live Execution Activity Drawer**: Collapsible bottom drawer showing a real-time feed of touched files and executed tools with timestamps.

#### Phase 3: Antigravity IDE Live Observer Bridge (Phase 3C)
- **[T3.1] Antigravity Live Transcript Watcher**: Debounced IPC file watcher on active conversation transcripts (`transcript.jsonl`).
- **[T3.2] Active IDE Session Streaming**: Stream real-time IDE tool calls and planner responses into Formative's terminal viewer.
- **[T3.3] Session History Replay & Task Binding**: Link past Antigravity conversation sessions directly to project tasks for transparent auditing.

#### Phase 4: Agent-Assisted Architecture Proposals (Phase 4B)
- **[T4.1] Architecture Prompt Context Formatter**: Formats bounded file trees and package manifests into a structured prompt requiring strict JSON output.
- **[T4.2] Proposal Schema & Validation Engine**: Type-safe schema validation for proposed modules, boundaries, and dependencies.
- **[T4.3] Interactive Review & Diff Modal**: Side-by-side review modal where users can inspect proposed nodes, check/uncheck individual items, and accept or discard. Zero automatic overwrites.

#### Phase 5: State-Aware First-Success Onboarding & UX Polish (Phase 3E)
- **[T5.1] State-Aware First-Success Checklist**: Replaces static tutorial text with an interactive checklist tracking: Project Created → Architecture Scanned → Office Employee Assigned → First Agent Run.
- **[T5.2] Viewport & Responsive Layout Hardening**: Stress-test layouts at 1024×680 minimum resolution and 1280×720 baseline.
- **[T5.3] Keyboard Accessibility & Focus Trapping**: Ensure `Escape` cleanly dismisses modals, `Tab` cycles focus, and background scroll locks.

#### Phase 6: Multi-Language AST Expansion & Drift Detection (Phase 4A & 4C)
- **[T6.1] Backend Framework Route Expansion**: Add route tokenizers for Express, Fastify, NestJS, Django, and Spring Boot to `architectureMap.worker.ts`.
- **[T6.2] Architecture Drift Detection**: Compare filesystem modules against manual canvas cards and flag missing or deleted components with subtle warning indicators.

#### Phase 7: Performance, WebGL Lifecycle & Canvas Virtualization (Phase 5)
- **[T7.1] Three.js Scene Disposal & WebGL Cleanup**: Explicitly dispose geometries, materials, and textures when switching views or unmounting the 3D office.
- **[T7.2] Canvas Graph Virtualization**: Optimize React Flow node rendering on graphs with 500+ nodes to preserve smooth 60fps panning and zooming.
- **[T7.3] Persistence Throttling**: Fine-tune atomic write debounce timers to prevent excessive disk I/O on large projects.

#### Phase 8: Open-Source Readiness, CI/CD & Community Docs (Phase 7)
- **[T8.1] GitHub Actions CI Pipeline**: Automate `npm run build` (`tsc && vite build`) and unit tests on every push/PR to guarantee `master` never breaks.
- **[T8.2] Comprehensive CONTRIBUTING.md**: Complete local development setup, code review guidelines, and architecture diagrams.
- **[T8.3] Issue & PR Templates**: Standardized GitHub templates for bug reports, agent CLI issues, and feature proposals.

#### Phase 9: Windows Packaging & Release Delivery (Phase 8)
- **[T9.1] NSIS Windows Installer Configuration**: Desktop shortcuts, Start menu entries, custom install directory, and clean uninstaller logic.
- **[T9.2] Standalone Portable `.exe` Build & Verification**: Verify single-binary execution on Windows without installation.
- **[T9.3] Release Verification & SHA256 Checksums**: Sandbox testing and publication verification.
