import * as fs from "fs";
import { commandContainerSchema, CommandContainer } from "../command/configCommand";

export class ConfigWorkspace {
    public commandContainer: CommandContainer;

    constructor(commandContainer: CommandContainer = commandContainerSchema.parse({})) {
        this.commandContainer = commandContainer;
    }

    public getJsonString(): string {
        let jsonString = JSON.stringify(this, null, 4);
        return jsonString;
    }

    /**
     * Save current configuration to JSON file with given file name
     * 
     * @param filename - The name of the file to save the configuration to.
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
