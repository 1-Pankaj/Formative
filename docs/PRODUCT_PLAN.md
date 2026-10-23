# Formative product plan and audit backlog

**Status:** Phase 1 source changes are complete; desktop runtime verification remains pending  
**Last updated:** 2026-10-23  
**Scope:** Formative desktop application, product direction, UX, security, and audited backlog

This document captures the product intent and the issues found in the initial audit. It is the shared reference for planning the work. Items below are proposals and todo items, not a commitment to implement every provider or feature in the first release. Product and provider priorities can be refined before each phase starts.

## 1. Product direction

Formative is a desktop-first, open-source workspace for using local and hosted AI agents on real projects. It should help a person choose an agent, give it useful work, understand what it is doing while it runs, and review the result in one coherent project context.

The workflow view is a live explanation of real execution. Its nodes should show meaningful events such as the task, agent activity, tool use, files changed, checkpoints, blockers, and completion. A newcomer should be able to understand the important points without reading raw logs; an experienced user should be able to inspect the underlying detail. A graph that is merely decorative, prefilled, or disconnected from agent activity does not meet this goal.

Formative should remain free and open source as an application. Users should be able to bring their existing local agent installations, credentials, API keys, or MCP services where supported. “Free” must be explained accurately: a provider may still charge for its CLI subscription, API use, hosted model, or other service. Formative should show known usage and cost information where it can do so reliably and label estimates clearly. Token saving is a product goal, but the app must explain what it saved and how it calculated that number rather than making unsupported claims.

The product should feel approachable to a first-time user without hiding useful control from experienced users. Clear defaults, plain-language explanations, and a guided first success belong in the main experience. Advanced configuration can be available when needed, with provider and technical terms explained in context.

## 2. Product principles

- **Real state only.** “Online,” “running,” “streaming,” task counts, workflow nodes, and analysis results must come from real state. Samples must be labelled as samples.
- **Project context first.** Workspaces, tasks, blueprints, and agent conversations belong to a selected project. A user should not accidentally act on an unclear project.
- **Show the work.** A live workflow should be derived from actual agent and tool events, with a readable summary and inspectable details.
- **Beginner clarity with expert depth.** Explain unfamiliar terms at the point of use. Keep raw events, provider settings, and advanced controls available without making them the first thing everyone sees.
- **Local-first and explicit access.** Make it clear which project files, processes, credentials, and tools a connection can access. Ask for user approval at meaningful security boundaries.
- **Reversible where practical.** Preserve edits, warn before destructive actions, and provide recovery or undo when feasible.
- **Consistent Formative identity.** Use a deliberate shared type, color, spacing, component, and interaction system across every view. Learn from Paperclip’s attention to real task state, hierarchy, and feedback without copying its product identity or layout wholesale.
- **Useful before impressive.** Prioritize working project and agent flows over decorative dashboards, generic AI styling, or speculative features.

## 3. Audience and platform scope

### Initial audience

- People who are curious about agents but do not know CLI, MCP, token, or model-provider terminology.
- Developers and technical users who already use local or hosted coding agents and want one project-aware place to work with them.
- Open-source contributors and teams who want an inspectable, extensible desktop harness rather than a locked-in hosted service.

### Initial platform

Formative is desktop-first. The desktop window must adapt cleanly when resized, including at the app’s current minimum window size and at a narrower working size. Desktop responsiveness is in scope now; mobile support and full browser parity are later platform decisions. The desktop app should not depend on browser-only behavior for its core workflow. If a capability is unavailable in a particular runtime, the interface must say so instead of presenting a control that silently does nothing.

### Office simulation boundary

The 2D pixel office is a valued part of the product. Its visual design and office-specific interactions are deferred until the user asks to work on that area. During the foundation work, the app may make only narrow state-binding changes needed to avoid presenting transcript review as a real agent run; the office itself is not being redesigned or expanded. The existing Munder Difflin implementation is useful product context and a reference for the office experience.

## 4. Context and navigation rules

The following is the proposed access model for the first coherent workflow:

1. The user creates or selects a project before entering project work areas such as tasks, issues, blueprints, workflow, or project agent conversations.
2. A new conversation is created inside the selected project and is associated with an agent/provider connection.
3. Controls that operate on a conversation or its run require an active conversation. The interface should explain how to select or start one when none is active.
4. Project-independent areas such as global preferences, help, and connection setup may be available outside a project when they do not inspect or change project data.
5. Empty states should say what is missing and offer the next useful action. They should not show invented tasks, online agents, live runs, or project analysis as if they were real.

This rule should be reflected in navigation, deep links, keyboard actions, and empty states, not enforced only by hiding one button.

## 5. Intended first-use and work journey

1. **Create or open a project.** Explain what choosing a project grants Formative access to and show the selected folder clearly.
2. **Connect an agent.** Offer only methods the app can actually use. Explain whether the user is connecting an installed local tool, a hosted account/API, an MCP server, or a local model.
3. **Create or select work.** Start with a plain-language task or issue and let the user attach the conversation and agent run to it.
4. **Start a real run.** Show what the agent can access and whether approval is needed before it edits files or invokes tools.
5. **Follow progress.** Turn actual events into a live workflow with concise explanations, status, timestamps, and details for inspection. Keep the conversation and its run understandable together.
6. **Review the result.** Show completion, failure, or interruption truthfully; let the user inspect relevant output and files before continuing.
7. **Keep a useful record.** Preserve tasks, conversation history, workflow events, and project changes across navigation and app restarts according to clear retention settings.

## 6. Agent and connection strategy

The long-term direction includes local agents and popular external agent platforms, including Codex, Antigravity, Claude Code, OpenCode, OpenClaw, Ollama, and Kiro. The list is a set of candidate integrations, not a claim that each one is currently supported. Integration work should be incremental and based on an explicit provider capability matrix.

Candidate connection methods include:

- Discovering or launching an installed local CLI or agent application.
- Connecting through a provider account or API key where the provider allows it.
- Connecting to an MCP server and exposing only its declared, approved capabilities.
- Connecting to local model runtimes such as Ollama.
- Importing or observing existing local session/transcript data where its format and permissions are understood.

Each integration should declare the actions it can perform: send a prompt, stream events, stop a run, read session history, edit files, invoke tools, or report usage. The UI must not imply that an integration has a capability it does not implement. Credentials should use an appropriate operating-system secure store where available and must not be written into ordinary project files, browser storage, event payloads, or logs. File and process access should be scoped and explained.

Before selecting integration order, define the first complete provider workflow and the security/approval model. Do not build shallow “connected” badges for every provider before one provider works end to end.

## 7. Product and design references

- **Paperclip code in this repository:** Use it to study clear hierarchy, contextual feedback, consistent interface primitives, and real task/cost state. It is a reference for quality and selected interaction patterns, not a template to copy. Formative needs its own information architecture and identity.
- **Munder Difflin code in this repository:** Use it to understand the existing pixel-office concept and local-agent direction. Preserve the office as it stands during the initial phases.
- **Formative itself:** Establish shared design tokens and component behavior, then bring each existing view into that system. Avoid view-by-view styling exceptions that cause the current theme drift.

The design system should cover color and contrast, typography, spacing, surfaces, navigation, buttons, form states, feedback, dialogs, empty/loading/error states, and responsive behavior. Visual polish follows a coherent and truthful workflow; it should not disguise missing functionality.

## 8. Initial audit findings

The first pass reviewed the current source and selected screens in the running development UI. These findings are a baseline for follow-up verification, not a claim that every path or release build has been tested.

### P1 — address before treating the app as a dependable agent workspace

- [x] **SEC-01 — Narrow and validate Electron capabilities.** Main-window isolation, sandboxing, web security, content security policy, navigation/new-window restrictions, IPC sender/frame/origin validation, selected-directory and transcript allowlists, and bounded path reads were implemented. Packaged apps now fail closed when their UI bundle is missing instead of trusting a localhost page. A packaged-app and IPC runtime review remains open under verification.
- [x] **DATA-01 — Prevent silent canvas/workflow data loss.** Canvas edits now autosave to project state, debounce desktop persistence, flush before navigation/project switches, and report save errors. Runtime restart, filesystem failure, and concurrent-save behavior still need verification.
- [x] **AGENT-01 — Make transcript ingestion format-safe.** The picker only accepts JSON/JSONL, JSON and JSONL records are normalized defensively, and files, records, line sizes, and displayed text are bounded. Malformed/large-file cases have not been runtime tested; TXT/LOG/MD remain unsupported and are no longer advertised.
- [x] **TRUTH-01 — Replace simulated agent state with observed state.** Simulated task/live-agent controls, online indicators, generated running nodes, fictional task assignees, sample task records, and the hard-coded agent org chart were removed or relabeled. Transcript viewing is described as read-only monitoring and does not claim to start or control agents.
- [x] **FLOW-01 — Remove silent no-op core actions and enforce project/chat context.** Unsupported browser-only scan/import paths explain the desktop requirement; project areas and transcript discovery require a selected project; transcript monitoring requires an explicitly selected transcript. A running agent chat is not implemented yet.
- [x] **CANVAS-01 — Place library nodes predictably.** New nodes are positioned near the viewport center and checked against existing nodes with a cascade.
- [x] **DELETE-01 — Protect project removal.** Project removal now asks for confirmation, explains that folder files are preserved, and offers an undo action.
- [x] **SCAN-01 — Make the current folder import honest and bounded.** It now presents generic folder nodes and “contains” relationships, samples at most 500 root entries, inspects at most nine top-level folders, and checks no arbitrary project code. README and UI describe this as a limited folder map, not dependency or architecture analysis. A richer evidence-based project analysis remains a Phase 2 decision.

### P2 — resolve in the coherent workflow and usability phases

- [x] **SETTINGS-01 — Make settings real or remove them.** Unused provider-path, transcript-history, and save-interval controls were removed from Preferences. The theme selector is retained and persists on-device. Provider directories remain fixed to the currently discovered local locations; configurable discovery paths can return when they are implemented end to end.
- [x] **ISSUE-01 — Keep issue/task counts and identifiers consistent.** Navigation counts now come from the active project; task keys use a project-persisted next number and survive task deletion/restart. Runtime persistence verification remains pending.
- [x] **UX-01 — Establish a compact desktop shell baseline.** Navigation widths and status content now compress, project-work areas are gated, and Electron’s minimum window size is 1024×680. Resizing/scrolling and visual clarity still need runtime review at the agreed desktop sizes.
- [ ] **A11Y-01 — Make interaction and text accessible.** Several clickable `<div>` elements (including onboarding choices, transcript entries, and issue rows) lack native button/link semantics. Dialogs need appropriate dialog semantics, focus containment/restoration, and keyboard behavior. Review color contrast, remaining local text-selection suppression, accessible names, and reduced-motion behavior.
- [ ] **ONBOARD-01 — Turn onboarding into a useful guided first success.** The close action now records dismissal, and current copy no longer claims unsupported shortcuts or agent controls. The current tab/step explanation is still not a contextual tutorial. Replace it with a resumable path that helps a person select a project, connect a real supported agent, create a task, start a safe run, and understand the resulting workflow. Include a clearly labeled sample path if a real connection is not yet configured.
- [ ] **BLUEPRINT-01 — Make blueprints real, or stop presenting them as generated truth.** Define what a blueprint represents, how it is created, validated, edited, and used. Blueprints must map to real project evidence or be clearly marked as editable examples/templates. Their nodes and edges must work. If no valid blueprint exists, use an honest empty state rather than generic jargon or fabricated architecture.
- [ ] **STYLE-01 — Bring all views into a coherent Formative design system.** Audit theme drift, dense technical labels, inconsistent controls, low-contrast light-theme text, and the split between beginner and advanced concepts. Use shared components and tokens across project selection, canvas, issue/task, onboarding, telemetry, settings, and other app views.
- [x] **PRIV-01 — Align offline/privacy claims with actual dependencies.** The remote Google Fonts dependency was removed; the app uses system fonts and the README now describes local desktop data access and provider-side cost/network caveats. Runtime network behavior still needs packaged-app review.
- [x] **DOC-01 — Align product documentation and supported-provider claims.** README now separates working project/task/transcript features from planned agent integrations and documents the scanner limits, transcript formats, desktop requirements, and provider cost caveat. Provider discovery behavior still needs runtime verification.

### Follow-up verification still needed

- [ ] Review packaged desktop behavior, all exposed Electron IPC handlers, provider discovery, file permissions, and update/install behavior.
- [ ] Inventory dependencies and run the appropriate security/dependency review when implementation verification is requested.
- [ ] Recheck every primary screen and core journey at supported desktop window sizes, with keyboard-only use and assistive-technology semantics in mind.
- [ ] Verify all audit findings against current source before implementation; line numbers above are approximate anchors and may move.

## 9. Phased roadmap

Each phase should start with a short acceptance checklist. Later phases depend on trustworthy state and a defined provider contract; avoid spreading effort across unfinished surfaces.

### Phase 0 — Product decisions and workflow specification

- [ ] Confirm the first complete user journey and the project/chat context rules in this document.
- [ ] Define the meaning and measurement of “save tokens” (for example, fewer repeated prompts, context selection, summarization, and/or transparent usage reporting).
- [ ] Pick the first provider integration based on the audience and available local setup; document what it can and cannot do.
- [ ] Define file/process access, tool approval, cancellation, credential storage, event retention, and error-state expectations.
- [ ] Specify what a blueprint is and whether the first release needs blueprints at all.
- [ ] Establish supported desktop window sizes and an initial accessibility bar.

### Phase 1 — Trustworthy desktop foundation

- [x] Harden the Electron/preload/IPC boundary and make capabilities explicit. (Source implementation complete; runtime review pending.)
- [x] Add project persistence, canvas autosave/flush behavior, project removal recovery, and bounded JSON/JSONL transcript handling. (Runtime/restart/failure checks pending.)
- [x] Remove simulated live statuses and task records; make unsupported agent-run actions explicit.
- [x] Apply project-first navigation and transcript-selection rules with clear messages.
- [x] Raise readable light-mode secondary-text contrast, preserve intentionally dark surfaces, and correct light-surface hover/guide labels. (Source update complete; live visual review pending.)
- [ ] Verify the desktop shell at supported resized window dimensions and address any remaining layout defects.
- [ ] Review light- and dark-theme contrast, hover, focus, and disabled states in the desktop app.
- [x] Keep folder import bounded and labeled as a folder map; defer dependency-aware project analysis to Phase 2.
- [ ] Complete runtime verification for persistence, selected-file permissions, transcript parsing/watching, and packaged Electron behavior.

### Phase 2 — Coherent project workspace

- [ ] Design a beginner-readable project home with a clear next action and visible project identity.
- [ ] Make tasks/issues, conversations, workflow, and project analysis share reliable project data.
- [ ] Decide the first evidence sources and implement a project scanner that explains what each source proves and where it is uncertain.
- [ ] Decide, then implement functional blueprints or remove/defer the unsupported blueprint experience.
- [ ] Add accessible interaction semantics and consistent visual tokens to the core paths.

### Phase 3 — One real agent, end to end

- [ ] Define a provider adapter contract and truthful capability/status model.
- [ ] Implement one prioritized provider connection, prompt/run, event stream, stop/cancel, failure, and reconnect path.
- [ ] Represent observed execution as readable workflow events with detail inspection and useful explanations.
- [ ] Associate runs with a project, task, and conversation; preserve history and outputs.
- [ ] Deliver a guided tutorial that walks through this real supported path, with a sample fallback clearly labeled.

### Phase 4 — Broader local and multi-agent support

- [ ] Expand integrations incrementally across the user-prioritized candidates: Codex, Antigravity, Claude Code, OpenCode, OpenClaw, Ollama, Kiro, API/BYOK, and MCP.
- [ ] Show a per-provider capability and setup matrix; never imply parity where it does not exist.
- [ ] Add multi-agent coordination only when assignments, handoffs, permissions, event ownership, and failure recovery are understandable and observable.
- [ ] Report token/cost savings only with a defined calculation, provider data, and a distinction between measured values and estimates.

### Phase 5 — Open-source release quality

- [ ] Document installation, local prerequisites, provider setup, permissions, troubleshooting, privacy, and contribution workflow.
- [ ] Publish an accurate feature/provider/platform matrix and migration/backup guidance.
- [ ] Review packaged app security and dependency/update posture; verify release builds and recovery paths.
- [ ] Complete focused automated and manual verification for the agreed acceptance criteria.

### Later, separate phase — Office simulation

- [ ] Revisit office changes only after the user asks to begin office work. Keep the existing pixel-office experience unchanged during Phases 0–5 unless a core app integration requires a narrowly scoped connection that does not redesign the office.

## 10. First usable milestone acceptance criteria

The first usable milestone should satisfy all of the following before broadening features:

- A user can select or create a project before using project-specific features, and can tell which project is active.
- A user can connect at least one genuinely functioning, explicitly supported agent using a documented method.
- A task and conversation can be created in that project and tied to a real run.
- Run, idle, disconnected, failed, stopped, and completed states are accurate; no hardcoded “online” or simulated live reasoning is presented as real.
- The user can understand key progress events in plain language and inspect the underlying details.
- Unsupported actions explain why they are unavailable; core controls do not silently no-op.
- Canvas/workflow and task data survive navigation and app restart or clearly warn before unsaved work can be lost.
- Project scanning and blueprints report evidence honestly; sample content is visibly labeled.
- The core journey remains usable as the desktop window is resized within the agreed supported range.
- Primary controls and dialogs work with a keyboard and expose sensible accessible names and focus behavior.
- Access to project files, processes, credentials, and tools is scoped and explained.
- The office simulation remains visually unchanged during this milestone.

## 11. Decisions to settle during planning

These are intentionally recorded instead of guessed. They do not prevent writing this plan, but they should be answered before work that depends on them begins.

- Which provider should be the first full integration, and does it use an existing local login, an API key, MCP, or another method?
- Does “save tokens” primarily mean reduce context sent, reuse/summarize history, avoid redundant work, or display usage and cost? Which measures can be proven?
- What file changes and tool calls may an agent make by default, and which actions require user approval?
- Which operating systems are supported for the first desktop release?
- Does the first multi-agent experience need simultaneous agents, sequential delegation, or both?
- Should chat and workflow remain visible together by default, or should users choose the emphasis?
- Which project files should the first scanner read, and how should it explain confidence and limitations?
- Should blueprints be a first-release feature, a template system, or a generated project map?

## 12. Audit method and limits

The initial audit inspected the Formative source tree, Electron entry/preload code, React views and styling, README/configuration claims, and selected screens in a running development UI. It identified concrete code paths and visual states listed above. The browser was used as an inspection surface; Formative’s intended product remains desktop-first.

The initial audit did not build or package the Electron application, execute a test suite, exhaustively exercise every UI state, inspect every office renderer path, run a dependency scanner, or prove an exploit. Security items are risks to validate and harden, not claims of a confirmed attack. Phase 1 source changes began on 2026-10-23 after the product plan was established. The updated source passes `npm run build` (TypeScript and Vite); Vite still reports the existing JavaScript chunk-size warning above 500 kB. The user also reported a successful `npm run desktop` build/start before the latest light-theme changes. Live Electron visual review, window-resize checks, persistence restart/failure checks, and packaged-app verification remain pending because the open desktop window was not accessible to this audit session.
