import * as vscode from "vscode";
import * as path from "path";

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

    if (getWorkspaceFolder() != undefined){
        vscodePath = path.join(getWorkspaceFolder()!, ".vscode");
    }

    return vscodePath;
}

export function getWorkspaceConfigPath(): string | undefined {
    let configPath = undefined;

    if (getVSCodePath() != undefined) {
        configPath = path.join(getVSCodePath()!, "vsconan.json");
    }

    return configPath;
}