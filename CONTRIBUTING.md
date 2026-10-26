# Contributing to Formative

Thank you for taking an interest in Formative. Contributions should make the app more useful, understandable, and dependable without claiming behavior that has not been verified.

## Before you start

- Read the [product plan](docs/PRODUCT_PLAN.md) for product boundaries, current status, and the implementation workflow.
- Search existing issues and pull requests. For a substantial change, open an issue first so the problem and scope can be discussed.
- Keep changes focused. Avoid combining unrelated UI, provider, and data-model work in one pull request.
- Do not commit project data, provider transcripts, API keys, credentials, local paths, or other private material. Redact logs and screenshots before sharing them.
- Check the license of third-party code, fonts, and art you add. A file in this repository is not necessarily covered by the root MIT license.

## Set up the project

Use Node.js 22 LTS or later and npm. From the repository root:

```bash
npm ci
npm run dev
```

To run the Windows desktop app:

```bash
npm run desktop
```

The optional office model is not in the repository. You can run the app without it; Project Office will offer to import a compatible `.gguf` file when you have one. The model is stored in local app data. Windows packages omit model weights by default. See the README if you intentionally need a private build that bundles them.

To run the automated test suite:

```bash
npm test
```

To run the TypeScript and production renderer build check:

```bash
npm run build
```

Before submitting a pull request, verify that both `npm test` and `npm run build` pass cleanly without errors.

## Pull requests

- Use a clear title and explain the user problem, the change, and any known limitations.
- Link the related issue when one exists.
- Include screenshots for visible UI changes, with private project names and data removed.
- Update the README or product plan when a change affects documented behavior, provider support, privacy, or release status.
- Mention the platform and app surface you checked. If you could not verify a native or provider workflow, say so.
- Keep changes compatible with the project's desktop-first Windows target. Do not claim other platforms are supported without verifying them.

Contributed code is expected to be distributed under the repository's MIT License. Only submit material you have the right to share, and identify any content with separate terms.
