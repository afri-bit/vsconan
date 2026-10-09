import { createVSCodeMock } from "jest-mock-vscode";

/**
 * jest-mock-vscode covers most of the `vscode` namespace (workspace, window, Uri, ...).
 * `env` and `extensions` are not implemented by the package, so they are added here.
 */
const vscodeMock = createVSCodeMock(jest) as Record<string, any>;

vscodeMock.extensions = { getExtension: jest.fn() };
vscodeMock.env = { remoteName: undefined, clipboard: { writeText: jest.fn() } };

export = vscodeMock;
