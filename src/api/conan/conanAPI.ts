import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { exec, execSync } from "child_process";
import * as utils from "../../utils/utils";

/**
 * Currently the Conan API relies on the conan CLI.
 * The whole API mechanism will use filesystem approach, which means
 * writing and reading results of the command execution to and from JSON file.
 */
export class ConanAPI {

    constructor() {

    }

    /**
     * This function executes conan command and write the result to a JSON file
     * Conan API doesn't provide direct JSON output from the stdout. So to get a proper result
     * of the command execution we will use JSON file access. Conan provides the API to write
     * the result to JSON natively with parameter "-j / --json JSON_File"
     * 
     * @param cmd Command to be executed
     * @param jsonPath JSON file path to store the result of the command execution
     */
    private commandToJsonExecutor(cmd: string, jsonPath: string) {
        try {
            execSync(`${cmd} ${jsonPath}`).toString();
        }
        catch (err: any) {
            console.log(err.message);
        }
    }

    public getRecipes(): Array<string> {

        let arrayRecipeList: Array<string> = [];

        let jsonName: string = "recipe.json"

        let jsonPath: string = path.join(utils.getVSConanHomeDirTemp(), jsonName);

        this.commandToJsonExecutor("python -m conans.conan search --raw --json", jsonPath);

        // Check if the file exists
        // With this check it validates if the conan command executed correctly without error
        // No JSON file will be written if the command is not executed correctly
        if (fs.existsSync(jsonPath))
        {
            let tempFile = fs.readFileSync(jsonPath, 'utf8');
            let recipeJson = JSON.parse(tempFile);

            // The result in the JSON file from contains an error flag
            // If this contains error, the file will not be processed
            if (!recipeJson.error)
            {
                // Double check if there is data inside by checking the length of the array
                if (recipeJson.results.length > 0)
                {
                    // Example of the JSON format looks as following
                    // {
                    //   "error": false,
                    //   "results": [
                    //     {
                    //       "remote": null,
                    //       "items": [
                    //         {
                    //           "recipe": {
                    //             "id": "ade/0.1.1f"
                    //           }
                    //         },
                    //         {
                    //           "recipe": {
                    //             "id": "boost/1.77.0"
                    //           }
                    //         }
                    //       ]
                    //     }
                    //   ]
                    // }
                    let recipeItems = recipeJson.results[0].items;

                    for (let recipe of recipeItems) {
                        arrayRecipeList.push(recipe.recipe.id);
                    }
                }
            }
            else
            {
                // TODO: Write some log / pop up message box
            }

            // Delete the temporary file after processing
            fs.unlinkSync(jsonPath);

            return arrayRecipeList;
        }

        return arrayRecipeList;
    }

    public getProfiles(): Array<string> {

        let arrayProfileList: Array<string> = [];

        let jsonName: string = "profile.json"

        let jsonPath: string = path.join(utils.getVSConanHomeDirTemp(), jsonName);

        this.commandToJsonExecutor("python -m conans.conan profile list --json", jsonPath);

        if (fs.existsSync(jsonPath))
        {
            let tempFile = fs.readFileSync(jsonPath, 'utf8');
            let jsonData = JSON.parse(tempFile);

            for (let profile of jsonData) {
                arrayProfileList.push(profile);
            }

            // Delete the temporary file after processing
            fs.unlinkSync(jsonPath);

            return arrayProfileList;
        }

        return arrayProfileList;
    }

    /**
     * Get list of packages from a specific recipe
     * 
     * @param recipe Recipe ID to get the packages from
     * @returns Return will be an array of dictionary / map from JSON file
     */
    public getPackages(recipe: string): Array<any> {
        let arrayPackageList: Array<any> = [];
        if (recipe == "") {
            return arrayPackageList;
        }
        else {
            let jsonName: string = "package.json"

            let jsonPath: string = path.join(utils.getVSConanHomeDirTemp(), jsonName);

            let recipeName: string = "";

            if (!recipe.includes("@")) {
                recipeName = recipe + "@";
            }
            else {
                recipeName = recipe;
            }

            this.commandToJsonExecutor(`python -m conans.conan search ${recipeName} --json`, jsonPath);

            // Check if the file exists
            // With this check it validates if the conan command executed correctly without error
            // No JSON file will be written if the command is not executed correctly
            if (fs.existsSync(jsonPath)) {
                let tempFile = fs.readFileSync(jsonPath, 'utf8');
                let recipeJson = JSON.parse(tempFile);

                // The result in the JSON file from contains an error flag
                // If this contains error, the file will not be processed
                if (!recipeJson.error) {
                    // Double check if there is data inside by checking the length of the array
                    if (recipeJson.results.length > 0) {
                        let packageItems = recipeJson.results[0].items[0].packages;

                        for (let pkg of packageItems) {
                            arrayPackageList.push(pkg);
                        }
                    }
                }
                else {
                    // TODO: Write some log / pop up message box
                }

                // Delete the temporary file after processing
                fs.unlinkSync(jsonPath);

                return arrayPackageList;
            }

            // Return an empty list
            return arrayPackageList;
        }
    }

    public getRemotes(): Array<any> {
        let arrayRemoteList: Array<any> = [];

        let jsonPath: string = path.join(utils.getConanCacheDir(), "remotes.json");

        // Check if the file exists
        // With this check it validates if the conan command executed correctly without error
        // No JSON file will be written if the command is not executed correctly
        if (fs.existsSync(jsonPath)) {
            let tempFile = fs.readFileSync(jsonPath, 'utf8');
            let remoteJson = JSON.parse(tempFile);

            // The result in the JSON file from contains an error flag
            // If this contains error, the file will not be processed

            let remoteItemList = remoteJson.remotes

            for (let remote of remoteItemList) {
                arrayRemoteList.push(remote);
            }

            // Delete the temporary file after processing
            fs.unlinkSync(jsonPath);

            return arrayRemoteList;
        }

        // Return an empty list
        return arrayRemoteList
    }
}