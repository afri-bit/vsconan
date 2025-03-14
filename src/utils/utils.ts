import { PythonExtension } from '@vscode/python-extension';
import { execSync, spawn } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import {
    commandContainerSchema, configCommandBuildSchema, configCommandCreateSchema,
    configCommandInstallSchema, configCommandPackageSchema, configCommandPackageExportSchema,
    configCommandSourceSchema
} from "../conans/command/configCommand";
import { ConfigWorkspace } from "../conans/workspace/configWorkspace";
import * as constants from "./constants";

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
        export async function executeCommand(cmd: string, args: Array<string>, channel: vscode.OutputChannel) {
            // const exec = util.promisify(require('child_process').exec);
            // const { stdout, stderr } = await spawn(cmd);
            channel.show();
            channel.appendLine(`Executing: "${cmd} ${args.join(' ')}`);

            const ls = spawn(cmd, args, { shell: true, 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined });

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
         * Function to create initial workspace configuration file with all conan commands
         * registered in the config files
         *
         * @param configPath Path where the config file is to be stored
         *
         */
        export function createInitialWorkspaceConfig(configPath: string) {
            let configWorkspace = new ConfigWorkspace(commandContainerSchema.parse({
                create: [configCommandCreateSchema.parse({})],
                install: [configCommandInstallSchema.parse({})],
                build: [configCommandBuildSchema.parse({})],
                source: [configCommandSourceSchema.parse({})],
                pkg: [configCommandPackageSchema.parse({})],
                pkgExport: [configCommandPackageExportSchema.parse({})]
            }));

            configWorkspace.writeToFile(path.join(configPath, constants.CONFIG_FILE));
        }
    }
}

export namespace conan {
    /**
     * Enum to distinguish between different Conan environments.
     */
    export enum ConanEnv {
        buildEnv = "BuildEnv",
        runEnv = "RunEnv"
    }

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

    /**
     * Read environment variables from Conan's VirtualBuildEnv/VirtualRunEnv.
     *
     * @param conanEnv Which environment to generate
     * @param pythonInterpreter Path to python interpreter
     * @param args Additional Conan arguments as given to `conan install`
     * @returns Array of environment settings
     */
    export async function readEnvFromConan(conanEnv: ConanEnv, pythonInterpreter: string, args: string[]): Promise<[string, string][]> {
        let envScript = path.join(path.dirname(__dirname), '..', '..', 'resources', 'print_env.py');
        if (!fs.existsSync(envScript)) {
            envScript = path.join(path.dirname(__dirname), '..', 'resources', 'print_env.py');
        }
        if (!fs.existsSync(envScript)) {
            throw new Error('Unable to locate print_env.py');
        }
        const options = { timeout: 20000, cwd: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };

        const cmd = `${pythonInterpreter} ${envScript} ${conanEnv} ${args.join(' ')}`;
        try {
            const output = execSync(cmd, options);
            const parsed = JSON.parse(`${output}`);
            return Object.entries(parsed);
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
            throw err;
        }
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
            return JSON.stringify(pathName);
        }
        else { // Absolute path in relative to workspace
            return JSON.stringify(path.join(wsPath, pathName));
        }
    }
}

export namespace general {
    export function plainObjectToClass<T>(classType: new () => T, plainObject: Record<string, any>): T {
        const instance: any = new classType();

        for (const key in plainObject) {
            if (Object.prototype.hasOwnProperty.call(plainObject, key)) {
                instance[key] = plainObject[key];
            }
        }

        return instance;
    }
}

export namespace python {
    let _api: PythonExtension | undefined;

    async function getPythonExtensionAPI(): Promise<PythonExtension | undefined> {
        if (_api) {
            return _api;
        }
        _api = await PythonExtension.api();
        return _api;
    }

    export async function getCurrentPythonInterpreter(): Promise<string | undefined> {
        let pythonExtension = vscode.extensions.getExtension("ms-python.python");
        if (!pythonExtension) {
            return;
        }
        const api = await getPythonExtensionAPI();
        const environment = await api?.environments.resolveEnvironment(api?.environments.getActiveEnvironmentPath());
        return environment?.executable.uri?.fsPath;
    }
}
