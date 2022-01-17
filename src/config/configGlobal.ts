import * as fs from "fs";
import * as vscode from "vscode";
import * as utils from "../utils/utils";


export class ConfigGlobal {
    public python: string;

    constructor(python: string = "python") {
        this.python = python;
    }
}

export class ConfigGlobalController {
    private config: ConfigGlobal;

    constructor(config: ConfigGlobal) {
        this.config = config;
    }

    public getPython(): string {
        return this.config.python;
    }

    public getConfig(): ConfigGlobal {
        return this.config;
    }

    public generateDefaultConfig() {

        let config = new ConfigGlobal("python");

        this.config = config;
    }

    public fetchConfig(): boolean {

        if (fs.existsSync(utils.getGlobalConfigPath()!)) {
            let configText = fs.readFileSync(utils.getGlobalConfigPath()!, 'utf8');
            this.config = JSON.parse(configText);
            return true;
        }
        else {
            vscode.window.showErrorMessage("Unable to find global config file.");
            return false;
        }
    }
}

