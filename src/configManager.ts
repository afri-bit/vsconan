import * as vscode from "vscode";


/**
 * Class to manage the extension configuration
 * This class actually only abstracts the usage of VS Code configuration API
 */
export class ConfigurationManager {
    private context: vscode.ExtensionContext;

    // This variable is used to store the original path from the environment
    // If there is no environment variable defined the path will be an empty string.
    private envConanUserHome: string | undefined = undefined; 

    public constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public getPythonGeneral(): string | undefined {
        return vscode.workspace.getConfiguration("vsconan").get("general.pythonInterpreter");
    }
    
    public showDirtyPackage(): boolean | undefined {
        return vscode.workspace.getConfiguration("vsconan").get("explorer.treeview.package.showDirtyPackage");
    }

    public setEnvConanUserHome(envConanUserHome: string | undefined) {
        this.envConanUserHome = envConanUserHome;
    }

    public getEnvConanUserHome(): string | undefined {
        return this.envConanUserHome;
    }
}