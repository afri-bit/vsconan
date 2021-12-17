import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";

export function getWorkspaceFolder(): string | undefined {
    let wsPath = undefined;

    if (vscode.workspace.workspaceFolders?.length === 1) {
        let root = vscode.workspace.workspaceFolders[0];
        wsPath = root.uri.fsPath;
    }

    return wsPath
}

export function getVSCodePath(): string | undefined {
    let vscodePath = undefined;

    if (getWorkspaceFolder() != undefined) {
        vscodePath = path.join(getWorkspaceFolder()!, ".vscode");
    }

    return vscodePath;
}

export function getVSConanPath(): string | undefined {
    let vsconanPath = undefined;

    if (getWorkspaceFolder() != undefined) {
        vsconanPath = path.join(getWorkspaceFolder()!, ".vsconan");
    }

    return vsconanPath;
}

export function getWorkspaceConfigPath(): string | undefined {
    let configPath = undefined;

    if (getVSConanPath() != undefined) {
        configPath = path.join(getVSConanPath()!, "vsconan.json");
    }

    return configPath;
}

export function getVSConanHomeDir(): string {
    return path.join(os.homedir(), ".vsconan");
}

export function getVSConanHomeDirTemp(): string {
    return path.join(getVSConanHomeDir(), "temp");
}

