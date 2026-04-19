# Agent instructions (VSConan)

Guidance for humans and coding agents working in this repository: what the project is, how it is laid out, how to build and test it, and boundaries that keep changes safe and consistent.

## Repository

- **Name:** VSConan (`vsconan`)
- **Purpose:** Visual Studio Code extension that helps manage the Conan local cache and workspace-related Conan flows from the editor (explorers, commands, settings).
- **Upstream:** [https://github.com/afri-bit/vsconan](https://github.com/afri-bit/vsconan)
- **License:** MIT (see `package.json`)

## Tech stack

- **Language:** TypeScript (strict mode), compiled to CommonJS
- **Runtime target:** VS Code extension host (`engines.vscode` in `package.json`)
- **Quality:** ESLint (`npm run lint`), Jest unit tests (`npm test` / `npm run test:unit`)
- **Packaging:** `@vscode/vsce` (`npm run package` / `npm run vsix`)

## Project layout

| Area | Role |
|------|------|
| `src/extension.ts` | Extension entry: activation, wiring managers and tree providers |
| `src/conans/` | Conan domain: API abstractions, Conan 1 vs 2 implementations, command builders, workspace config, models |
| `src/extension/` | VS Code integration: settings, explorer managers, tree view providers, workspace manager |
| `src/utils/` | Shared helpers and constants |
| `test/` | Jest tests (`.test.ts`); may invoke `conan` where integration-style coverage is needed |
| `out/` | **Generated** TypeScript output; do not hand-edit |
| `resources/` | Icons and images for the extension and marketplace |

**Dependency direction (intended):** VS Code–specific code in `src/extension/` should depend on Conan logic in `src/conans/` and `src/utils/`, not the other way around. Keep `src/conans/` free of direct `vscode` imports where practical so CLI and parsing logic stay testable.

## Local setup

1. **Node.js:** Use a current LTS or the version CI uses (see `.github/workflows/build_and_test.yml`; Node **22** as of this writing).
2. **Install dependencies:** `npm ci` (or `npm install` for ad hoc work).
3. **Conan (for some tests):** CI installs Conan via `pip` and runs `conan profile detect --force`. If tests fail locally with missing `conan`, install Conan and ensure it is on `PATH`.
4. **Compile:** `npm run compile` (writes to `out/`).
5. **Lint:** `npm run lint` (zero warnings enforced).
6. **Tests:** `npm run test:unit` (or `npm test`). `pretest` runs compile and lint first.

For day-to-day extension debugging, use VS Code’s “Run Extension” / launch configuration if present in `.vscode/` (not required for CI).

## Guardrails and boundaries

### Scope of changes

- Prefer **minimal, task-focused diffs**. Avoid drive-by refactors, unrelated formatting sweeps, or new documentation files unless the task explicitly asks for them.
- **Do not commit or rely on hand-edits under `out/`**—always change `src/` (and tests) and recompile.
- Preserve **Conan 1 and Conan 2** behavior: version-specific code lives under `src/conans/conan/` and `src/conans/conan2/`; shared contracts live in `src/conans/api/` and related factories. Regressions in either major version are unacceptable unless explicitly agreed.

### VS Code extension rules

- **`package.json` is the contract** for commands, views, activation events, and settings (`contributes`). Adding or renaming commands or configuration keys requires matching updates to registration code and user-facing strings.
- Respect **activation events**: heavy work belongs in activation paths or lazy initialization, not at import time for modules that are not always needed.
- **User environment:** The extension runs subprocesses and reads paths from settings. Treat paths and CLI output as untrusted input; avoid shell injection, and prefer structured argument lists over string concatenation when spawning processes.

### Code style and quality

- Match **existing naming, file placement, and patterns** in nearby code.
- Keep **TypeScript strict**; do not widen types or disable checks to silence errors without fixing root causes.
- After substantive edits, run **`npm run lint`** and **`npm run test:unit`** (or full `npm test`) before considering work complete.

### Security and privacy

- Do not add telemetry, remote endpoints, or credential storage unless there is a tracked product decision and documentation.
- Do not log secrets, full home directory paths in high-verbosity logs without need, or other sensitive user data.

## What agents should do before opening a PR

1. `npm run lint`
2. `npm run compile`
3. `npm run test:unit`
4. Confirm `package.json` / `package-lock.json` changes are intentional and minimal (dependency bumps only when required).

## Where to look first

- **New command or tree behavior:** `package.json` → `src/extension.ts` → relevant manager under `src/extension/manager/` or provider under `src/extension/ui/treeview/`.
- **Conan CLI behavior or parsing:** `src/conans/command/`, `src/conans/conan*/`, `src/conans/api/`.
- **Settings schema:** `package.json` `contributes.configuration` and `src/extension/settings/`.

When in doubt, follow the call chain from the command ID in `package.json` to its handler and mirror existing patterns.
