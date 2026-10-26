# Changelog

Notable changes to Formative are recorded here. This file follows the structure of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions are released only when a tagged release is published.

## [Unreleased]

### Added

- Project workspaces with an editable architecture canvas, task list, and project overview.
- Bounded local project structure scanning and a separate read-only source architecture map.
- Read-only Agent Chat runs through supported Codex CLI and Claude Code CLI installations.
- Transcript review for supported JSON and JSONL sources.
- A project-scoped 3D office that reflects supported real agent-run activity.
- Optional on-device office chat after the user selects a compatible GGUF model.
- Persistent background activity for agent runs and local model replies.

### Changed

- Default Windows packaging excludes model weights. A user-selected model is stored in local app data; a private build may opt into bundling a model after checking its license and provenance.
- Local project scanning does not execute project code. Provider runs are separate and may send the chosen prompt and bounded context to the provider service.

### Fixed

- Hardened Windows CLI argument handling for saved provider session IDs.
- Kept local office chat limited to character roleplay, reduced small-model drift with bounded history and safer sampling, and added grounded responses for unsupported identity/date questions. Team Setup now previews the office engine's actual sprite and saved appearance/roster changes refresh the live scene.

## Release status

The package scripts define Windows installer and portable targets. This source changelog does not confirm that a specific binary has been built, tested, or published. See the [GitHub Releases page](https://github.com/1-Pankaj/Formative/releases) for published artifacts.
