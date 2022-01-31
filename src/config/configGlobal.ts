import * as fs from "fs";
import * as vscode from "vscode";
import * as utils from "../utils/utils";


export class ConfigDataGlobal{
    public python: string;

    constructor(python: string = "python") {
        this.python = python;
    }
}

export class ConfigGlobal {
    private config: ConfigDataGlobal;

    constructor(config: ConfigDataGlobal) {
        this.config = config;
    }

    public getPython(): string {
        return this.config.python;
    }

    public getConfig(): ConfigDataGlobal {
        return this.config;
    }

    public getJsonString(): string{
        let jsonString = JSON.stringify(this.config, null, 4);
        return jsonString;
    }

    /**
     * Set the configurations parameter to default values
     */
    public setDefault(){
        this.config = new ConfigDataGlobal("python");
    }

    /**
     * Read config file with give filename
     * 
     * @param filename Full path where this file is located
     */
    public readConfigFromFile(filename: string){
        let configText = fs.readFileSync(filename, 'utf8');
        this.config = JSON.parse(configText);
    }

    /**
     * Read config file from the default path of the config file
     * 
     */
    public readConfig(){
        if (fs.existsSync(utils.getGlobalConfigPath())) {
            this.readConfigFromFile(utils.getGlobalConfigPath())
        }
        else {
            throw("Unable to find global config file.");
        }
    }

    /**
     * Save current configuration to JSON file with give file name
     * 
     * @param filename
     */
    public writeConfigToFile(filename: string){
        let jsonString = JSON.stringify(this.config, null, 4);
        fs.writeFile(filename, jsonString, "utf8", function (err) {
            if (err) throw err;
        });
    }

    /**
     * Save current configuration to JSON file with default location of the config file
     */
    public writeConfig(){
        this.writeConfigToFile(utils.getGlobalConfigPath());
    }
}
