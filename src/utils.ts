import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import * as constants from "./constants";
import * as fs from "fs";
import { ConfigGlobal, ConfigGlobalGeneral, ConfigGlobalExplorer } from "./config/configGlobal";
import { ConfigWorkspace } from "./config/configWorkspace";
import {
    CommandContainer, ConfigCommandBuild, ConfigCommandCreate,
    ConfigCommandInstall, ConfigCommandPackage, ConfigCommandPackageExport,
    ConfigCommandSource
} from "./config/configCommand";
import { spawn } from "child_process";

export namespace vsconan {
    /**
     * Function to get the absolute path of VSConan home directory
     * This directory is stored under user HOME directory
     * @returns Absolute path to the VSConan home directory
     */
    export function getVSConanHomeDir(): string {
        return path.join(os.homedir(), constants.VSCONAN_FOLDER);
    }

    /**
     * Get the absolute path of VSConan temporary directory
     * @returns Absolute path of VSConan temporary directory
     */
    export function getVSConanHomeDirTemp(): string {
        return path.join(getVSConanHomeDir(), constants.TEMP_FOLDER);
    }

    /**
     * Get abolute path of VSConan global config file
     * @returns Abolute path of VSConan global config file
     */
    export function getGlobalConfigPath(): string {
        return path.join(getVSConanHomeDir(), constants.CONFIG_FILE);
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

        // TODO: Remove the config file generation, since configuration will be moved to vscode configuration
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

    export namespace cmd {
        /**
         * Function to execute command and print the output to the output channel
         * @param cmd Command in string format
         * @param channel VS Code output channel
         */
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
    
        /**
         * Utility function to retrieve python interpreter for explorer manager from the config file 
         * @returns String of python interpreter that is stored in the configuration file | undefined on error
         */
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
    
            configWorkspace.writeToFile(path.join(configPath, constants.CONFIG_FILE));
        }
    }
}

export namespace conan {
    /**
     * Utility function to determine whether a folder is a conan project 
     * by checking if the folder contains conanfile.py or conanfile.txt
     * @param ws Absolute path to workspace to be checked
     * @returns 'true' the path contains conanfile.py or conanfile.txt, otherwise 'false'
     */
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

    /**
     * Helper function to get absolute path in relative to workspace path
     * If the path to be merged with workspace path is absolute it will return that path itself.
     * If the path is not absolute, it will return absolute path which is merge with workspace path.
     * 
     * @param wsPath Absolute path from workspace
     * @param pathName Path to be merged with workspace
     * @returns 
     */
    export function getAbsolutePathFromWorkspace(wsPath: string, pathName: string): string {
        if (path.isAbsolute(pathName)) { // Absolute path from the path itself
            return pathName;
        }
        else { // Absolute path in relative to workspace
            return path.join(wsPath, pathName);
        }
    }
}