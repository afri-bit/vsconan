import * as vscode from 'vscode';

export const window = {
    createOutputChannel: jest.fn().mockReturnValue({
        appendLine: jest.fn(),
        show: jest.fn(),
        clear: jest.fn(),
        dispose: jest.fn(),
    }),
    showErrorMessage: jest.fn(),
    // Mock OutputChannel
    outputChannel: jest.fn().mockImplementation(() => ({
        appendLine: jest.fn(),
        show: jest.fn(),
        clear: jest.fn(),
        dispose: jest.fn(),
    })),
};

export const commands = {
    executeCommand: jest.fn(),
};

export const workspace = {
    getConfiguration: jest.fn().mockReturnValue({
        get: jest.fn(),
        update: jest.fn(),
    }),
};

export const URI = {
    file: jest.fn().mockReturnValue({
        fsPath: '/mock/path',
    }),
};

export const env = {
    clipboard: {
        writeText: jest.fn(),
    },
};

export const extensions = {
    getExtension: jest.fn().mockReturnValue({
        activate: jest.fn(),
    }),
};

