import * as fs from "fs";
import * as vscode from "vscode";
import { CommandContainer } from "./configCommand";
import * as utils from "../utils/utils";

export class ConfigWorkspace {
    public python: string;
    public commandContainer: CommandContainer;

    constructor(python: string = "python", commandContainer: CommandContainer = new CommandContainer()) {
        this.python = python;
        this.commandContainer = commandContainer;
    }
}

// export class ConfigWorkspace {
//     private config: ConfigDataWorkspace;

//     constructor(config: ConfigDataWorkspace) {
//         this.config = config;
//     }

//     public getPython(): string {
//         return this.config.python;
//     }

//     public getConfig(): ConfigDataWorkspace {
//         return this.config;
//     }

//     public getJsonString(): string {
//         let jsonString = JSON.stringify(this.config, null, 4);
//         return jsonString;
//     }

//     /**
//      * Set the configurations parameter to default values
//      */
//     public setDefault() {
//         this.config = new ConfigDataWorkspace();
//     }

//     /**
//      * Read config file with give filename
//      * 
//      * @param filename Full path where this file is located
//      */
//     public readConfigFromFile(filename: string) {
//         let configText = fs.readFileSync(filename, 'utf8');
//         this.config = JSON.parse(configText);
//     }

//     /**
//      * Read config file from the default path of the config file
//      * 
//      */
//     public readConfig() {
//         this.readConfigFromFile(utils.getWorkspaceConfigPath()!)
//     }

//     /**
//      * Save current configuration to JSON file with give file name
//      * 
//      * @param filename
//      */
//     public writeConfigToFile(filename: string) {
//         let jsonString = JSON.stringify(this.config, null, 4);
//         fs.writeFile(filename, jsonString, "utf8", function (err) {
//             if (err) throw err;
//         });
//     }
// }

