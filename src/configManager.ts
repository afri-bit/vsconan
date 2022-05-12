import * as vscode from "vscode";


/**
 * Class to manage the extension configuration
 * This class actually only abstracts the usage of VS Code configuration API
 */
export class ConfigurationManager {
    private context: vscode.ExtensionContext;

    public constructor(context: vscode.ExtensionContext) {
        this.context = context
    }

    public getPythonGeneral(): string | undefined {
        return vscode.workspace.getConfiguration("vsconan").get("general.pythonInterpreter");
    }
    
    public getPythonExplorer(): string | undefined {
        return vscode.workspace.getConfiguration("vsconan").get("explorer.pythonInterpreter");
    }

    public showDirtyPackage(): boolean | undefined {
        return vscode.workspace.getConfiguration("vsconan").get("explorer.treeview.package.showDirtyPackage");
    }
}