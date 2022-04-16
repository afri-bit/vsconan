import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import * as global from "./globals";
import * as fs from "fs";
import { ConfigGlobal, ConfigGlobalGeneral, ConfigGlobalExplorer } from "./config/configGlobal";
import { ConfigWorkspace } from "./config/configWorkspace";
import {
    CommandContainer, ConfigCommandBuild, ConfigCommandCreate,
    ConfigCommandInstall, ConfigCommandPackage, ConfigCommandPackageExport,
    ConfigCommandSource
} from "./config/configCommand";
import * as globals from "./globals";
import { spawn } from "child_process";

export namespace vsconan {

    export function getVSConanHomeDir(): string {
        return path.join(os.homedir(), global.constant.VSCONAN_FOLDER);
    }

    export function getVSConanHomeDirTemp(): string {
        return path.join(getVSConanHomeDir(), global.constant.TEMP_FOLDER);
    }

    export function getGlobalConfigPath(): string {
        return path.join(getVSConanHomeDir(), global.constant.CONFIG_FILE);
    }

    /**
     * Function to initialize the global area such as creating .vsconan folder
     * in the HOME folder, creating a temporary folder and creating a default global
     * config file
     */
     export function initializeGlobalArea() {
        if (!fs.existsSync(vsconan.getVSConanHomeDir())) {
            fs.mkdirSync(vsconan.getVSConanHomeDir());
        }

        // Check if global config file is available, otherwise create a new one with default parameters
        if (!fs.existsSync(vsconan.getGlobalConfigPath())) {
            let configGlobal = new ConfigGlobal(new ConfigGlobalGeneral("python"), new ConfigGlobalExplorer("python"));
            configGlobal.writeToFile(vsconan.getGlobalConfigPath());
        }

        //  Additionally the temp folder will created to store temporary files
        if (!fs.existsSync(vsconan.getVSConanHomeDirTemp())) {
            fs.mkdirSync(vsconan.getVSConanHomeDirTemp());
        }
    }

    export function getWebviewContent(content: string) {
        return `
    <html>
    <body>
    <pre>
    <code>
    ${content}
    </code>
    </pre>
    </body>
    </html>`;
    }

    export namespace cmd {
        export async function executeCommand(cmd: string, channel: vscode.OutputChannel) {
            // const exec = util.promisify(require('child_process').exec);
            // const { stdout, stderr } = await spawn(cmd);
            channel.show();
        
            const ls = spawn(cmd, [], { shell: true });
        
            ls.stdout.on("data", data => {
                channel.append(`${data}`);
            });
        
            ls.stderr.on("data", data => {
                channel.append(`${data}`);
            });
        
            ls.on('error', (error) => {
                channel.append(`ERROR: ${error.message}`);
            });
        
            ls.on("close", code => {
                channel.append(`\nProcess exited with code ${code}\n`);
            });
        }

    }
    

    export namespace config {
        /**
         * Method to select python interpreter between global and workspace configuration
         * The workspace python has higher priority over the global configuration.
         * If both are filled with information, the workspace interpreter will be chosen as return.
         * 
         * @param configDataGlobal 
         * @param configDataWorkspace 
         * @returns <string> String return will occur if the configuration is not empty string
         *          <undefined> This will be return as result if string is empty string or atrribute is not defined in the configuration file
         */
        export function selectPython(configGlobal: ConfigGlobal, configWorkspace: ConfigWorkspace): string | undefined {
            // Config workspace has priority over the global config
            // If workspace config is undefined or empty, the global config will be used
            // With this logic, user can define the python configuration locally in workspace
    
            if (configWorkspace.python !== undefined && configWorkspace.python !== "") { // Returning workspace python
                return configWorkspace.python;
            }
            else if (configGlobal.general.python !== undefined && configGlobal.general.python !== "") { // Returning global python
                return configGlobal.general.python;
            }
            else { // No other option available
                return undefined;
            }
    
        }
    
        export function getExplorerPython(): string | undefined {
            if (fs.existsSync(vsconan.getGlobalConfigPath())) {
                let configGlobal = new ConfigGlobal();
    
                let configText = fs.readFileSync(vsconan.getGlobalConfigPath(), 'utf8');
                configGlobal = JSON.parse(configText);
    
                return configGlobal.explorer.python!;
            }
            else {
                vscode.window.showErrorMessage("Unable to find configuration file");
            }
        }
    
        /**
         * Function to create initial workspace configuration file with all conan commands
         * registered in the config files
         *
         * @param configPath Path where the config file is to be stored
         *
         */
        export function createInitialWorkspaceConfig(configPath: string) {
            let configWorkspace = new ConfigWorkspace("python", new CommandContainer(
                [new ConfigCommandCreate()],
                [new ConfigCommandInstall()],
                [new ConfigCommandBuild()],
                [new ConfigCommandSource()],
                [new ConfigCommandPackage()],
                [new ConfigCommandPackageExport()]
            ));
    
            configWorkspace.writeToFile(path.join(configPath, globals.constant.CONFIG_FILE));
        }
    }
}

export namespace conan {
    export function isFolderConanProject(ws: string): boolean {
        let ret: boolean = false;

        let conanpy: string = path.join(ws, "conanfile.py");
        let conantxt: string = path.join(ws, "conanfile.txt");

        if (fs.existsSync(conanpy) || fs.existsSync(conantxt)) {
            ret = true;
        }

        return ret;
    }
}
    
export namespace editor {
    /**
     * Function to open file in the editor, with or without workspace.
     * This function is just to simplify the mechanism of opening file in the editor
     * 
     * @param filePath File path to be opened
     */
    export async function openFileInEditor(filePath: string) {

        const doc = await vscode.workspace.openTextDocument(filePath);
        vscode.window.showTextDocument(doc);
    }
}

export namespace workspace {
    /**
     * Function to show quick pick to get a workspace path.
     * This can list the multiple workspaces and user can select it using a quick pick menu. 
     * 
     * @returns Promise<string | undefined> Selected workspace path or undefined
     */
    export async function selectWorkspace(): Promise<string | undefined> {
        let wsList = vscode.workspace.workspaceFolders;

        return new Promise<string | undefined>(async (resolve, reject) => {
            if (wsList !== undefined) {
                if (wsList!.length > 1) { // Workspace contains multiple folders
                    const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();
                    let quickPickItems = [];
                    for (let i = 0; i < wsList!.length; i++) {
                        quickPickItems.push({
                            label: wsList![i].name,
                            description: wsList![i].uri.fsPath,
                            detail: "",
                            index: i
                        });
                    }
                    quickPickItems.map(label => ({ label }));
                    quickPick.items = quickPickItems;

                    const choice = await vscode.window.showQuickPick(quickPickItems);

                    if (choice) {
                        // Returning the filesystem path
                        return resolve(choice.description);
                    }
                    else {
                        return resolve(undefined);
                    }
                }
                else if (wsList!.length === 1) {
                    // Choose the only path it has
                    return resolve(wsList![0].uri.fsPath);
                }
            }
            else {
                return reject(undefined);
            }
        });
    }
}