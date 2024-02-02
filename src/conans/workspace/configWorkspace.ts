import * as fs from "fs";
import { CommandContainer } from "../command/configCommand";

export class ConfigWorkspace {
    public commandContainer: CommandContainer;

    constructor(commandContainer: CommandContainer = new CommandContainer()) {
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
