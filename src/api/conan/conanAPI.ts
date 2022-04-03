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
    /**
     * This function executes conan command and write the result to a JSON file
     * Conan API doesn't provide direct JSON output from the stdout. So to get a proper result
     * of the command execution we will use JSON file access. Conan provides the API to write
     * the result to JSON natively with parameter "-j / --json JSON_File"
     * 
     * @param cmd Command to be executed
     * @param jsonPath JSON file path to store the result of the command execution
     */
    private static commandToJsonExecutor(cmd: string, jsonPath: string) {
        try {
            execSync(`${cmd} ${jsonPath}`).toString();
        }
        catch (err) {
            console.log((err as Error).message);
        }
    }

    /**
     * Method to get the home folder of conan by using CLI
     * 
     * @param python path to python interpreter that contains conan
     * @returns
     *      string - path is successful obtained
     *      undefined - on error
     */
    public static getConanHomePath(python: string = "python"): string | undefined {
        try {
            let homePath = execSync(`${python} -m conans.conan config home`).toString();
            return homePath.trim(); // Remove whitespace and new lines
        }
        catch (err) {
            console.log((err as Error).message);
            return undefined;
        }
    }

    public static getConanProfilesPath(python: string = "python"): string | undefined {
        let conanHomePath = this.getConanHomePath(python);

        if (conanHomePath != undefined) {
            return path.join(conanHomePath, "profiles");
        }
        else {
            return undefined;
        }
    }

    public static getProfileFilePath(profile: string, python: string = "python"): string | undefined {
        let conanProfilesPath = this.getConanProfilesPath(python)

        if (conanProfilesPath != undefined) {
            return path.join(conanProfilesPath, profile);
        }
        else {
            return undefined;
        }
    }

    public static getRecipePath(recipe: string, python: string = "python") {
        let conanHome = this.getConanHomePath(python = python);

        if (conanHome != undefined) { // Start processing the data if the conan home folder exists
            let conanDataPath = path.join(conanHome, "data");
            let recipeName: string = "";
            let recipeVersion: string = "";
            let recipeUser: string = "_";
            let recipeChannel: string = "_";

            if (recipe.includes("@")) { // Recipe has user and channel
                recipeName = recipe.split("@")[0].split("/")[0];
                recipeVersion = recipe.split("@")[0].split("/")[1];
                recipeUser = recipe.split("@")[1].split("/")[0];
                recipeChannel = recipe.split("@")[1].split("/")[1];
            }
            else { // Recipe has NO user and channel
                recipeName = recipe.split("/")[0];
                recipeVersion = recipe.split("/")[1];
            }

            let recipePath = path.join(conanDataPath, recipeName, recipeVersion, recipeUser, recipeChannel);

            return (fs.existsSync(recipePath) ? recipePath : undefined);
        }
        else {
            return undefined
        }
    }

    /**
     * Function to get the specified binary package path.
     * This method doesnt use original Conan CLI but constructs the path based recipe and package ID
     * to navigate through the file system.
     * Required basic information is the Conan home folder. 
     * 
     * @param recipe 
     * @param packageId 
     * @param python 
     * @returns 
     */
    public static getPackagePath(recipe: string, packageId: string, python: string = "python") {
        let recipePath = this.getRecipePath(recipe, python);

        if (recipePath != undefined) {
            let packageFolder = path.join(recipePath, "package", packageId);

            let conanLinkFile = path.join(packageFolder, ".conan_link");

            // If .conanlink exists, it means conan only give reference to the real path using content of this file
            if (fs.existsSync(conanLinkFile)) {
                let realPackagePath = fs.readFileSync(conanLinkFile).toString('utf8');
                return realPackagePath.trim();
            }
            else {
                return packageFolder;
            }
        }
        else {
            return undefined;
        }
    }

    public static getRecipes(python: string): Array<string> {

        let arrayRecipeList: Array<string> = [];

        let jsonName: string = "recipe.json"

        let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

        this.commandToJsonExecutor(`${python} -m conans.conan search --raw --json`, jsonPath);

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

    public static getProfiles(python: string): Array<string> {

        let arrayProfileList: Array<string> = [];

        let jsonName: string = "profile.json"

        let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

        this.commandToJsonExecutor(`${python} -m conans.conan profile list --json`, jsonPath);

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
    public static getPackages(python: string, recipe: string): Array<any> {
        let arrayPackageList: Array<any> = [];
        if (recipe == "") {
            return arrayPackageList;
        }
        else {
            let jsonName: string = "package.json"

            let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

            let recipeName: string = "";

            if (!recipe.includes("@")) {
                recipeName = recipe + "@";
            }
            else {
                recipeName = recipe;
            }

            this.commandToJsonExecutor(`${python} -m conans.conan search ${recipeName} --json`, jsonPath);

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

    public static getRemoteFilePath(python: string = "python"): string | undefined {
        let conanHomePath = this.getConanHomePath(python);

        let remotePath = undefined;

        if (conanHomePath) {
            remotePath = path.join(conanHomePath!, "remotes.json");
        }

        return remotePath;
    }

    public static getRemotes(python: string = "python"): Array<any> {
        let arrayRemoteList: Array<any> = [];

        let conanHomePath = this.getConanHomePath(python);

        if (conanHomePath == undefined) {
            throw new Error("Unable to locate Conan home folder.");
        }

        let jsonPath: string = path.join(conanHomePath!, "remotes.json");

        if (fs.existsSync(jsonPath)) {
            let tempFile = fs.readFileSync(jsonPath, 'utf8');
            let remoteJson = JSON.parse(tempFile);

            // The result in the JSON file from contains an error flag
            // If this contains error, the file will not be processed

            let remoteItemList = remoteJson.remotes

            for (let remote of remoteItemList) {
                arrayRemoteList.push(remote);
            }
        }

        return arrayRemoteList
    }

    public static getPackageInformation(python: string, recipe: string, packageId: string) {
        let packageList = this.getPackages(python, recipe);

        for (let pkg of packageList) {
            if (pkg.id == packageId) {
                return pkg;
            }
        }

        return undefined;
    }

    public static removePackage(recipe: string, packageId: string, python: string = "python") {
        execSync(`${python} -m conans.conan remove ${recipe} -p ${packageId} -f`);
    }

    public static removeRecipe(recipe: string, python: string = "python") {
        execSync(`${python} -m conans.conan remove ${recipe} -f`);
    }

    public static removeProfile(profile: string, python: string = "python") {
        let conanProfilesPath = this.getConanProfilesPath(python);
        
        if (conanProfilesPath == undefined) {
            throw new Error("Unable to locate Conan profiles folder.");
        }

        let profileFilePath = path.join(conanProfilesPath, profile);

        fs.unlinkSync(profileFilePath);
    }

    public static addRemote(remote: string, url: string, python: string = "python") {
        execSync(`${python} -m conans.conan remote add ${remote} ${url}`);
    }

    public static removeRemote(remote: string, python: string="python") {
        execSync(`${python} -m conans.conan remote remove ${remote}`);
    }

    public static enableRemote(remote: string, enable: boolean, python: string="python" ) {
        if (enable) {
            execSync(`${python} -m conans.conan remote enable ${remote}`);
        }
        else {
            execSync(`${python} -m conans.conan remote disable ${remote}`);
        }
    }

    public static renameProfile(oldProfileName: string, newProfileName: string, python: string = "python") {
        let oldProfilePath = this.getProfileFilePath(oldProfileName, python);

        if (oldProfilePath) {
            fs.renameSync(oldProfilePath, path.join(this.getConanProfilesPath(python)!, newProfileName));
        }
        else {
            throw new Error(`Unable to locate profile ${oldProfileName}`);
        }
    }

    public static duplicateProfile(oldProfileName: string, newProfileName: string, python: string = "python") {
        let oldProfilePath = this.getProfileFilePath(oldProfileName, python);

        if (oldProfileName) {
            fs.copyFileSync(oldProfilePath!, path.join(this.getConanProfilesPath(python)!, newProfileName));
        }
        else {
            throw new Error(`Unable to duplicate profile ${oldProfileName}`)
        }
    }

    public static createNewProfile(profileName: string, python: string = "python") {
        execSync(`${python} -m conans.conan profile new  ${profileName}`);
    }
}