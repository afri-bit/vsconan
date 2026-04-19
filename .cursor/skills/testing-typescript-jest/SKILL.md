---
name: testing-typescript-jest
description: Writes and maintains TypeScript unit tests with Jest for this repository. Covers test layout, ts-jest, VS Code module mocking, Conan CLI–dependent tests, lint/compile pretest, and coverage. Use when adding or changing tests, fixing Jest failures, improving coverage, or when the user mentions Jest, unit tests, mocks, or test-and-coverage.
---

# Testing (TypeScript + Jest) — VSConan

## Quick context

- Tests live under **`test/`** only; Jest **`roots`** is `./test` (`jest.config.js`).
- Files must match **`\.test\.ts$`** (e.g. `test/conan/foo.test.ts`).
- **`ts-jest`** compiles tests using the repo **`tsconfig.json`** (strict).
- **`collectCoverageFrom`**: `src/**/*.ts` — coverage is for extension source, not `test/`.
- See **AGENTS.md** for repo boundaries and **`package.json` `scripts`** for commands.

## Commands (verify after changes)

```bash
npm run lint
npm run compile
npm run test:unit
```

`npm test` runs the same suite; **`pretest`** runs `compile` and `lint` first. For coverage: `npm run test-and-coverage`.

## Importing code under test

Use path relative to the test file into **`src/`**, matching existing files:

```typescript
import { something } from "../../src/conans/command/configCommand";
```

Do not import from **`out/`** in tests.

## Mocking `vscode`

Many **`src/`** modules import `vscode`. In tests, either:

1. **Shared mock** (common in this repo): at the top of the test file, before other imports that pull in `vscode`:

```typescript
import * as vscode from "../../mocks/vscode";

jest.mock("vscode", () => vscode, { virtual: true });
```

Use **`./mocks/vscode`** from `test/*.test.ts`, **`../mocks/vscode`** from `test/conan/*.test.ts`, and **`../../mocks/vscode`** from `test/conan/commandBuilder/*.test.ts` (see existing files).

2. **Inline mock** when only a small surface is needed (see `test/conan/readEnv.test.ts`).

Extend **`test/mocks/vscode.ts`** when new `vscode` APIs are required; keep mocks minimal and typed enough to satisfy strict TS.

## What to test

- **Pure logic / schemas / builders** (`src/conans/`, `src/utils/`): prefer tests that do not need a real VS Code host; mock `vscode` only if the import graph requires it.
- **Conan 1 vs 2**: mirror production split (`src/conans/conan/` vs `src/conans/conan2/`); add or update tests on both sides when behavior is version-specific.
- **Subprocess / CLI**: some tests run **`conan`** on the machine. CI installs Conan (`pip install conan`) and runs `conan profile detect --force`. If a test fails locally with “conan not found”, document that Conan must be on `PATH` (do not skip tests silently).

## Patterns and libraries

- **`jest.spyOn`** for patching `os`, module exports, or small environment hooks (see `test/utils.test.ts`).
- **`ts-sinon`** is available for stubs/spies if it reduces boilerplate; stay consistent with nearby tests.
- Use **`beforeEach`** to reset mocks when tests mutate shared jest.fn state.

## Anti-patterns

- Committing expectations that depend on a developer’s **personal Conan cache** unless the test creates an isolated fixture.
- Broad **`jest.mock`** of entire `src/` modules without a clear need — prefer testing public behavior of the unit under test.
- Skipping **`npm run lint`** before declaring tests done; **`pretest`** enforces it but run explicitly when iterating.

## Optional deep dives

- Jest config: **`jest.config.js`**
- ESLint test scope: **`package.json`** `lint` includes `./test`
