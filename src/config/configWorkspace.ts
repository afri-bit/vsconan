import * as fs from "fs";
import { CommandContainer } from "./configCommand";

export class ConfigWorkspace {
    public python: string;
    public commandContainer: CommandContainer;

    constructor(python: string = "python", commandContainer: CommandContainer = new CommandContainer()) {
        this.python = python;
        this.commandContainer = commandContainer;
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
            if (err) {
                throw err;
            }
        });
    }
}
