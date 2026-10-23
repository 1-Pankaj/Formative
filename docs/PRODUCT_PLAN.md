# Formative product plan and audit backlog

**Status:** Phase 2 source implementation and Playwright renderer verification are complete; the Phase 3 read-only chat source workflow is implemented and awaiting desktop runtime verification; native Electron and persistence verification remain pending
**Last updated:** 2026-10-24
**Scope:** Formative desktop application, product direction, UX, security, and audited backlog

This document captures the product intent and the issues found in the initial audit. It is the shared reference for planning the work. Items below are proposals and todo items, not a commitment to implement every provider or feature in the first release. Product and provider priorities can be refined before each phase starts.

## 1. Product direction

Formative is a desktop-first, open-source workspace for using local and hosted AI agents on real projects. It should help a person choose an agent, give it useful work, understand what it is doing while it runs, and review the result in one coherent project context.

The workflow view is a live explanation of real execution. Its nodes should show meaningful events such as the task, agent activity, tool use, files changed, checkpoints, blockers, and completion. A newcomer should be able to understand the important points without reading raw logs; an experienced user should be able to inspect the underlying detail. A graph that is merely decorative, prefilled, or disconnected from agent activity does not meet this goal.

Formative should remain free and open source as an application, with no Formative subscription plans or paid feature gates. Users should be able to bring their existing local agent installations, credentials, API keys, or MCP services where supported. “Free” must be explained accurately: a provider may still charge for its CLI subscription, API use, hosted model, or other service. Formative should show known usage and cost information where it can do so reliably and label estimates clearly. Token saving is a product goal, but the app must explain what it saved and how it calculated that number rather than making unsupported claims.

The product should feel approachable to a first-time user without hiding useful control from experienced users. Clear defaults, plain-language explanations, and a guided first success belong in the main experience. Advanced configuration can be available when needed, with provider and technical terms explained in context.

## 2. Product principles

- **Real state only.** “Online,” “running,” “streaming,” task counts, workflow nodes, and analysis results must come from real state. Samples must be labelled as samples.
- **Project context first.** Canvas work, tasks, folder evidence, transcript inspection, and future agent conversations belong to a clearly selected project. A user should not accidentally act on an unclear project.
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

1. The user creates or selects a project before entering project work areas such as tasks, issues, the canvas, workflow, or project agent conversations.
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

### Provider priority for Phase 3

The user has chosen **Codex CLI and Claude Code together** for the first real in-app agent workflow. **Google Antigravity remains high priority**, immediately after the shared Codex/Claude workflow has a dependable run, stop, history, and permission model. Google's [current FAQ](https://antigravity.google/docs/faq/) says wrapping the Antigravity headless CLI in third-party applications is unsupported for consumer plans. Formative must not ship that consumer CLI wrapper; verify an explicitly supported connection path first. A direct Gemini API connection, if added, is a separate provider and must not be presented as Antigravity. Detecting an installed command or discovering a transcript must not be presented as full run support.

| Provider | Phase 3 route | Initial boundary | Required before it is labelled supported |
| --- | --- | --- | --- |
| Codex | Current first slice starts/resumes the installed Codex CLI. Evaluate the documented app-server for a native Formative conversation surface that does not require users to work in a terminal. | Read-only project scope; no dangerous approval/sandbox bypasses. Existing Codex desktop sessions are not attached by the current CLI workflow. | Start and resume a project conversation; stream useful events; stop safely; save accurate local history. Evaluate app-server for desktop-app users; distinguish starting a Formative-owned thread from attaching to an existing Codex app thread. |
| Claude Code | Current first slice starts/resumes the installed CLI. Claude Code's Desktop Code tab is not integrated. Official documentation describes separate Desktop and CLI session histories, so transcript discovery must not be assumed to expose Desktop sessions. | Read-only project inspection; no permission-bypass mode, shell tool, project MCP server, hook, or customization is enabled in this first slice. Provider credentials remain in the user's own setup. | Research a documented local SDK/session bridge for Desktop and IDE users; test which local histories are readable. Keep start/resume/control capabilities distinct from passive transcript review. |
| Antigravity | High-priority evaluation. Current Formative transcript discovery checks `~/.gemini/antigravity/brain`; it does not check the Antigravity IDE root at `~/.gemini/antigravity-ide/brain`. Evaluate documented IDE hooks and transcript metadata as an opt-in, local, read-only observer that matches the selected project. | Do not wrap consumer `agy` CLI sessions in Formative. Google's [hooks documentation](https://antigravity.google/docs/hooks?tab=ide) describes workspace paths and transcript locations, but any observer must be checked against current provider terms and must not imply control of the IDE agent. A direct Gemini API adapter is a separate provider. | Confirm that the proposed observation method is supported; identify sessions by their real workspace path; stream only documented activity; verify privacy, cancellation semantics, and Windows behavior before claiming support. Keep Formative-initiated Antigravity runs unavailable until an explicitly supported route is confirmed. |

#### Desktop and IDE sessions

The first source implementation is CLI-only for Codex and Claude Code. It does not detect whether their desktop applications are installed, attach to the conversation currently open in those applications, or read their live app state. Codex's documented app-server is a candidate native protocol for Formative-owned threads and events; it does not by itself prove that an existing desktop-app thread can be attached. Claude Code Desktop and CLI histories are separate according to the [Desktop documentation](https://code.claude.com/docs/en/desktop), so the existing CLI transcript scanner is not evidence of Desktop session support.

For Antigravity IDE, the user wants Formative to observe the local workspace that is already running there. The current code does not do this: it only discovers transcripts under the Antigravity App data root. First investigate an opt-in, read-only observer using documented local session metadata, scoped to the selected project. Label it as “watching an external session”; do not imply Formative started, can resume, or can stop that IDE run unless those actions are implemented through an approved provider interface.

Phase 3 does **not** imply simultaneous multi-agent orchestration. It first creates one clear conversation and run at a time, with provider selection per conversation. Task association, workflow summaries, persisted history, and tutorial steps must be backed by real state.

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
- [x] **FLOW-01 — Remove silent no-op core actions and enforce project/chat context.** Unsupported browser-only scan/import paths explain the desktop requirement; project areas and transcript discovery require a selected project; transcript monitoring requires an explicitly selected transcript. At the audit baseline, a running agent chat was not implemented; Phase 3 now adds the read-only Codex and Claude Code workflow described below.
- [x] **CANVAS-01 — Place library nodes predictably.** New nodes are positioned near the viewport center and checked against existing nodes with a cascade.
- [x] **DELETE-01 — Protect project removal.** Project removal now asks for confirmation, explains that folder files are preserved, and offers an undo action.
- [x] **SCAN-01 — Make the current folder import honest and bounded.** It presents generic folder nodes and “contains” relationships, samples at most 500 root entries, inspects at most nine top-level folders, and does not run project code. Phase 2 adds fixed, existence-only checks for selected manifests/config files and records their meaning and limitations. The result remains a folder map, not dependency or architecture analysis.

### P2 — resolve in the coherent workflow and usability phases

- [x] **SETTINGS-01 — Make settings real or remove them.** Unused provider-path, transcript-history, and save-interval controls were removed from Preferences. The theme selector is retained and persists on-device. Provider directories remain fixed to the currently discovered local locations; configurable discovery paths can return when they are implemented end to end.
- [x] **ISSUE-01 — Keep issue/task counts and identifiers consistent.** Navigation counts now come from the active project; task keys use a project-persisted next number and survive task deletion/restart. Runtime persistence verification remains pending.
- [x] **UX-01 — Establish a compact desktop shell baseline.** Navigation widths and status content now compress, project-work areas are gated, and Electron’s minimum window size is 1024×680. Playwright renderer checks covered 1024×680 and 1280×720; native Electron review is still pending.
- [ ] **A11Y-01 — Make interaction and text accessible.** The project chooser and task selection now expose keyboard semantics, and the new-project dialog has a labelled dialog role. Onboarding choices and other older interactions still need native semantics; focus containment/restoration, reduced motion, selection behavior, and a full contrast review remain open.
- [ ] **ONBOARD-01 — Turn onboarding into a useful guided first success.** The close action now records dismissal, and current copy no longer claims unsupported shortcuts or agent controls. The current tab/step explanation is still not a contextual tutorial. Replace it with a resumable path that helps a person select a project, connect a real supported agent, create a task, start a safe run, and understand the resulting workflow. Include a clearly labeled sample path if a real connection is not yet configured.
- [x] **BLUEPRINT-01 — Remove the unsupported blueprint concept.** There is no separate generated blueprint in the first coherent workspace. The canvas is a user-edited project diagram; starter diagrams are labelled as static examples. The agent team view is deferred until real runs exist.
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
- [x] Specify that the first release uses an editable project canvas and labelled examples, with no separate generated blueprint feature.
- [ ] Establish supported desktop window sizes and an initial accessibility bar.

### Phase 1 — Trustworthy desktop foundation

- [x] Harden the Electron/preload/IPC boundary and make capabilities explicit. (Source implementation complete; runtime review pending.)
- [x] Add project persistence, canvas autosave/flush behavior, project removal recovery, and bounded JSON/JSONL transcript handling. (Runtime/restart/failure checks pending.)
- [x] Remove simulated live statuses and task records; make unsupported agent-run actions explicit.
- [x] Apply project-first navigation and transcript-selection rules with clear messages.
- [x] Raise readable light-mode secondary-text contrast, preserve intentionally dark surfaces, and correct light-surface hover/guide labels. (Source update complete; live visual review pending.)
- [x] Verify the renderer shell at 1024×680 and 1280×720; no page overflow remained in the overview, tasks, canvas, or guide. Native Electron review is still open.
- [ ] Review light- and dark-theme contrast, hover, focus, and disabled states in the desktop app.
- [x] Keep folder import bounded and labeled as a folder map; defer dependency-aware project analysis to Phase 2.
- [ ] Complete runtime verification for persistence, selected-file permissions, transcript parsing/watching, and packaged Electron behavior.

### Phase 2 — Coherent project workspace

- [x] Add a project overview as the first screen after selecting or creating a project, with project identity, real task/canvas counts, and direct paths to the current work areas.
- [x] Keep project tasks, canvas items, and scan evidence in the saved project record. Transcript review remains read-only and temporary; it is not presented as a saved project conversation or agent run.
- [x] Scan bounded directory samples and fixed marker paths using existence checks only. Explain what each observed marker suggests and what it cannot prove; do not read source code or execute project files.
- [x] Defer separate blueprints and the unsupported agent-team view. Keep the project canvas user-authored and starter diagrams visibly labelled as examples.
- [x] Add keyboard-operable project selection/task selection, accessible names for the project cards and task actions, dialog semantics for project creation, and theme-safe overview styling. The broader A11Y-01 and STYLE-01 audits remain open.

**Phase 2 boundaries:** live agent conversations, run history, provider execution, and a guided tutorial for a real run stay in Phase 3. Folder scans are refreshed when the same folder is opened again; refresh updates evidence but preserves user canvas edits.

### Phase 3 — Real project conversations with Codex and Claude Code

- [x] Define a provider adapter contract and truthful capability/status model in the shared types. No provider is marked supported until its implementation is complete.
- [x] Add project-scoped conversation, run, and user-visible event records with bounded IPC validation. Stored paths must be project-relative; hidden model reasoning is excluded from the event model.
- [x] Set provider order: Codex CLI and Claude Code in the first workflow; Antigravity remains the high-priority follow-up, gated on an explicitly supported third-party connection path. Local command presence is neither an authentication nor an authorization check.
- [x] Document the first Codex and Claude CLI protocols, safe read-only limits, and authentication boundaries. Local installs are detected; account state is not probed.
- [x] Implement provider discovery that reports local command installation separately from unchecked authentication.
- [x] Build a project-first Agent Chat workspace with Codex/Claude provider choice, conversation history, task association, and run status. When a task is linked, only its key, title, status, and description are sent as provider context; the UI explains that sharing. Source is implemented; live desktop review remains open.
- [x] Implement source paths for Codex/Claude conversation start/resume, structured progress, stop/cancel, and failure states. Provider runtime behavior and restart recovery have not yet been exercised.
- [ ] Add and verify non-CLI provider surfaces for users of desktop apps and IDEs: evaluate Codex app-server for Formative-owned conversations, investigate Claude Code Desktop/IDE session access, and add opt-in Antigravity IDE session observation only through a provider-supported, project-scoped path. Make “start,” “watch,” “resume,” and “stop” distinct capabilities.
- [x] Show the read-only project scope and provider data/billing notice. No permission/sandbox bypass flags are used.
- [x] Map real provider messages and read-tool progress into readable events; hidden reasoning and raw tool output are excluded. Only bounded conversation output is retained locally.
- [x] Preserve conversation/run history locally with bounded records and terminal states. Startup recovery marks stale in-flight records as interrupted so they do not remain “running” after Formative restarts; persistence/restart verification remains open.
- [ ] Add a Formative-visible approval flow before enabling project edits or agent commands that need broader permission.
- [ ] Complete the contextual guided tutorial. Agent Chat now offers an in-view, action-oriented first-run step based on folder, provider, and prompt readiness. Continue it through run review, make progress resumable, and include an explicitly labeled sample fallback without simulating real runs.
- [ ] Run a desktop smoke walkthrough with each locally installed provider, including stop, resume, failure, and app restart. Do not submit a provider prompt without the user's own action inside Formative.

**Antigravity follow-up (high priority):** immediately after the Codex/Claude baseline, confirm an integration route that is explicitly supported for third-party applications. Current official guidance rules out wrapping the consumer headless CLI; keep Antigravity unavailable unless a permitted route is confirmed. Any Google AI Studio/Gemini API connector is a separate provider, not Antigravity.

### Phase 4 — Broader local and multi-agent support

- [ ] Expand integrations incrementally across the user-prioritized candidates: OpenCode, OpenClaw, Ollama, Kiro, API/BYOK, and MCP. Antigravity remains a high-priority Phase 3 evaluation, gated on a supported third-party connection path.
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

### Phase 6 — Final Windows installer and release packaging

This is the final delivery phase. Start it only after the agreed product and office work for the first release is complete and the Phase 0–5 acceptance checks have passed. The current unpacked and portable Windows builds are development/review artifacts; they are not an installer.

- [ ] Choose and document the installer format and install scope (per-user or per-machine), installation location, shortcuts, upgrade behavior, and uninstall behavior.
- [ ] Configure the installer and its branding. Decide whether code signing is in scope and document the certificate and release requirements if it is.
- [ ] Produce a Windows installer from the release build and verify installation, first launch, upgrade from a prior supported build, repair/reinstall, and uninstall on supported Windows versions.
- [ ] Verify that packaged assets, app permissions, local provider discovery, and user data retention/recovery behave as documented after install and uninstall.
- [ ] Prepare checksums, installation/update instructions, known limitations, and release notes for the installer artifact.

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

- **Resolved:** Codex CLI and Claude Code are both in the first integration set; Antigravity remains high priority but cannot be wrapped through the consumer headless CLI under current Google guidance. Confirm an approved route before implementation. Document authentication per provider and never assume credentials are available just because a CLI is installed.
- Does “save tokens” primarily mean reduce context sent, reuse/summarize history, avoid redundant work, or display usage and cost? Which measures can be proven?
- What file changes and tool calls may an agent make by default, and which actions require user approval?
- Which operating systems are supported for the first desktop release?
- Does the first multi-agent experience need simultaneous agents, sequential delegation, or both?
- Should chat and workflow remain visible together by default, or should users choose the emphasis?
- Which project files should the first scanner read, and how should it explain confidence and limitations?
- Blueprints are not a separate first-release feature; the editable canvas and labelled starter examples cover the current use case.

## 12. Audit method and limits

Playwright renderer verification on 2026-10-23 covered the project overview, task empty state, canvas, and every guide section at 1024×680 and 1280×720. The canvas had no page overflow, all four nodes stayed within its visible bounds, and the minimap was hidden at the compact breakpoint. Guide sections were checked in light and dark themes; the long component section stayed inside its scrollable panel. No browser console errors were recorded. The source passed `npm run build`, `node --check electron/main.cjs`, `node --check electron/preload.cjs`, and `git diff --check`. Vite still reports its existing main-bundle size warning. These checks exercised the renderer through a Playwright-backed browser, not the user's open Electron window. Native Electron, persistence/restart, and packaged behavior remain open.

The initial audit inspected the Formative source tree, Electron entry/preload code, React views and styling, README/configuration claims, and selected screens in a running development UI. It identified concrete code paths and visual states listed above. The browser was used as an inspection surface; Formative’s intended product remains desktop-first.

The initial audit did not package the Electron application, execute a test suite, exhaustively exercise every UI state, inspect every office renderer path, run a dependency scanner, or prove an exploit. Security items are risks to validate and harden, not claims of a confirmed attack. Phase 1 source changes began on 2026-10-23 after the product plan was established; Phase 2 source work added the project overview, scan evidence, and clarified canvas/transcript scope. A focused renderer preview pass on 2026-10-23 checked the project canvas and guide at 1024×680 and 1280×720, including both themes. It corrected component-library row clipping, canvas minimap overlap, resize fitting, and guide contrast/surfaces. This was a browser renderer preview, not the user's running Electron window. The current source passes `npm run build` (TypeScript and Vite) and `node --check electron/main.cjs`. Vite still reports a large JavaScript chunk warning (the main app bundle is about 1.09 MB). No test suite was run. Native Electron behavior, scan refresh and persistence, and packaged-app verification remain pending; the current session cannot inspect the open native desktop window.
