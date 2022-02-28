import * as fs from "fs";
import * as vscode from "vscode";
import * as utils from "../utils/utils";

export class ConfigGlobalGeneral {
    public python: string | undefined;
    constructor(python: string = "") {
        this.python = python;
    }
}

export class ConfigGlobalExplorer {
    public python: string | undefined;

    constructor(python: string = "") {
        this.python = python;
    }
}

export class ConfigGlobal {
    public general: ConfigGlobalGeneral = new ConfigGlobalGeneral();
    public explorer: ConfigGlobalExplorer = new ConfigGlobalExplorer();

    constructor(general: ConfigGlobalGeneral = new ConfigGlobalGeneral(), explorer: ConfigGlobalExplorer = new ConfigGlobalExplorer) {
        this.general = general;
        this.explorer = explorer;
    }

    public getJsonString(): string {
        let jsonString = JSON.stringify(this, null, 4);
        return jsonString;
    }

    /**
     * Save current configuration to JSON file with give file name
     * 
     * @param filename
     */
    public writeToFile(filename: string) {
        let jsonString = JSON.stringify(this, null, 4);
        fs.writeFile(filename, jsonString, "utf8", function (err) {
            if (err) throw err;
        });
    }
}
