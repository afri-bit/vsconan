import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import * as global from "../globals";
import * as fs from "fs";
import { ConfigGlobal } from "../config/configGlobal";
import { ConfigWorkspace } from "../config/configWorkspace";

export namespace conan {
    export function getConanCacheDir(): string {
        return path.join(os.homedir(), ".conan");
    }
}

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

export namespace json {
    export function writeToJson(object: any, filename: string, indent: number = 4) {
        let jsonString = JSON.stringify(object, null, indent);
        fs.writeFile(filename, jsonString, "utf8", function (err) {
            if (err) throw err;
        });
    }

    export function readFromJSON(filename: string, object: any) {
        let configText = fs.readFileSync(filename, 'utf8');
        object = JSON.parse(configText);
        return object;
    }
}

export namespace config{
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
        // TODO: Config workspace has priority over the global config
        // If workspace config is undefined or empty, the global config will be used
        // With this logic, user can define the python configuration locally in workspace

        if (configWorkspace.python != undefined && configWorkspace.python != "") { // Returning workspace python
            return configWorkspace.python;
        }
        else if (configGlobal.general.python != undefined && configGlobal.general.python != "") { // Returning global python
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
            vscode.window.showErrorMessage("Unable to find configuration file")
        }
    }
}
