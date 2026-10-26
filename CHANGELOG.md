# Changelog

All notable changes to Formative will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-26

### Added
- **Interactive Architecture Canvas**: Editable node-and-edge visual workspace supporting frontend, gateway, backend, database, cache, queue, worker, and service nodes with automatic layout arrangement and drag-to-connect relationships.
- **Source Architecture Map**: Static analysis pipeline that scans local project source files (JavaScript, TypeScript, Python, Go, Rust, Java, C#, PHP, Ruby), resolving module imports, framework route patterns (Next.js, Remix, SvelteKit, Nuxt, Astro), and database schema links.
- **3D Project Office Floor**: Three.js isometric office environment with procedural character rendering, desk assignments, daytime/evening lighting cycles, real-time live clock, and camera panning.
- **Local In-Office AI Colleague**: Integrated local language model runtime powered by quantized GGUF weights (`node-llama-cpp`). Enables immediate in-character desk conversations with office coordinators and teammates completely offline with zero external API dependencies.
- **Agent CLI Telemetry**: Connects with locally installed CLI agents (Claude Code, Codex CLI), capturing live tool calls, file edits, thinking steps, and status traces in read-only mode.
- **Task & Issue Tracker**: Project issue backlog supporting status progression (todo, in progress, blocked, done), assignees, and direct linking to agent execution sessions.
- **Offline Data Persistence**: Project configurations, architecture diagrams, issue records, and conversation history persist locally in SQLite / local storage with automatic project switching.
- **Windows Packaging**: Native NSIS installer and single-file portable executable configuration via Electron Builder.
