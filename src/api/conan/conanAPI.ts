import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as utils from "../../utils";

/**
 * Class to interact with the conan package manager
 * 
 * Currently the Conan API relies on the conan CLI. There is no direct API from conan, except with python.
 * The whole API mechanism will use diffrent approaches, such as filesystem and CLI.
 * Most of the public method of this class requires path to the python interpreter, before calling the API methods
 * the extension will read the configuration file, where user stores the python interpreter.
 * 
 * This will be adapted in the future using file watcher instead.
 */
export class ConanAPI {

    public constructor() {

    }

    /**
     * Method to get the home folder of conan by using CLI
     * @param python
     * @returns Path to conan home folder | undefined on error
     */
    public getConanHomePath(python: string = "python"): string | undefined {
        try {
            let homePath = execSync(`${python} -m conans.conan config home`).toString();
            return homePath.trim(); // Remove whitespace and new lines
        }
        catch (err) {
            console.log((err as Error).message);
            return undefined;
        }
    }

    /**
     * Method to get the path where all the profiles are located
     * This method depends on the conan home directory, which can be configured by the user.
     * @param python
     * @returns Full path to the conan profiles directory | undefined on error
     */
    public getConanProfilesPath(python: string = "python"): string | undefined {
        let returnValue: string | undefined = undefined;

        let conanHomePath = this.getConanHomePath(python);

        if (conanHomePath !== undefined) {
            returnValue = path.join(conanHomePath, "profiles");
        }

        return returnValue;
    }

    /**
     * Method to get absolute path to selected conan profile.
     * @param profileName Conan profile name
     * @param python 
     * @returns Absolute path to the selected conan profile | undefined on error
     */
    public getProfileFilePath(profileName: string, python: string = "python"): string | undefined {
        let returnValue: string | undefined = undefined;

        let conanProfilesPath = this.getConanProfilesPath(python);

        if (conanProfilesPath !== undefined) {
            returnValue = path.join(conanProfilesPath, profileName);
        }

        return returnValue;
    }

    /**
     * Method to get the conan recipe path in the local cache
     * To get the path in this method, we will create the path based on 
     * the folder structure pattern in the local cache, that is created by Conan.
     * @param recipe Conan recipe name
     * @param python 
     * @returns Absolute path to the local cache of the recipe | undefined on error
     */
    public getRecipePath(recipe: string, python: string = "python"): string | undefined {
        let conanHome = this.getConanHomePath(python = python);

        let returnValue: string | undefined = undefined;

        if (conanHome !== undefined) { // Start processing the data if the conan home folder exists
            // All the recipe and packages are stored under folder data in the conan home folder
            let conanDataPath = path.join(conanHome, "data");
            let recipeName: string = "";
            let recipeVersion: string = "";
            let recipeUser: string = "_"; // This is a default name of the folder if the recipe does not have a user on it
            let recipeChannel: string = "_"; // This is a default name of the folder if the recipe does not have a channel on it

            // Break down all the information from the recipe name input
            // Name pattern of the recipe: "foo/1.0.0@user/channel"
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

            // Make sure once again that the path exists
            if (fs.existsSync(recipePath)) {
                returnValue = recipePath;
            }
        }

        return returnValue;
    }

    /**
     * Method to get the specified binary package path.
     * This method doesnt use original Conan CLI but constructs the path based recipe and package ID
     * to navigate through the file system.
     * Required basic information is the Conan home folder. 
     * @param recipe Conan recipe name
     * @param packageId Binary package Id that belongs to the recipe
     * @param python 
     * @returns Absolute path to the binary package folder | undefined on error
     */
    public getPackagePath(recipe: string, packageId: string, python: string = "python"): string | undefined {
        let returnValue: string | undefined = undefined;

        let recipePath = this.getRecipePath(recipe, python);

        if (recipePath !== undefined) {
            let packageFolder = path.join(recipePath, "package", packageId);

            let conanLinkFile = path.join(packageFolder, ".conan_link");

            // If .conan_link exists, it means conan only give reference to the real path using content of this file
            if (fs.existsSync(conanLinkFile)) {
                let realPackagePath = fs.readFileSync(conanLinkFile).toString('utf8');
                returnValue = realPackagePath.trim();
            }
            else {
                returnValue = packageFolder;
            }
        }

        return returnValue;
    }

    /**
     * Method to get list of existing recipe in the local cache.
     * This method uses combination of CLI and filesystem that is provided by Conan itself.
     * We will execute one of the conan commands and write the result into a JSON file.
     * @param python 
     * @returns List of all recipes in the local cache
     */
    public getRecipes(python: string): Array<string> {
        // Initialize an empty array of string as default return value
        let arrayRecipeList: Array<string> = [];

        // Initialize the temporary json file name
        let jsonName: string = "recipe.json";

        // Create the path where the temporary file will be stored
        // We will use the VSConan home folder under user home folder
        let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

        execSync(`${python} -m conans.conan search --raw --json ${jsonPath}`);

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
            else {
                throw new Error("Unable to process JSON File of Conan recipe list.");
            }

            // Delete the temporary file after processing
            fs.unlinkSync(jsonPath);
        }

        return arrayRecipeList;
    }

    /**
     * Method to get list of existing profiles.
     * This method executes the Conan CLI and stores the result in a JSON file
     * @param python 
     * @returns List of all exisiting profiles
     */
    public getProfiles(python: string): Array<string> {

        let arrayProfileList: Array<string> = [];

        let jsonName: string = "profile.json";

        let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

        execSync(`${python} -m conans.conan profile list --json ${jsonPath}`);

        if (fs.existsSync(jsonPath)) {
            let tempFile = fs.readFileSync(jsonPath, 'utf8');
            let jsonData = JSON.parse(tempFile);

            for (let profile of jsonData) {
                arrayProfileList.push(profile);
            }

            // Delete the temporary file after processing
            fs.unlinkSync(jsonPath);
        }

        return arrayProfileList;
    }

    /**
     * Get list of packages from a specific recipe
     * @param recipe Recipe ID to get the packages from
     * @returns Return will be an array of dictionary / map from JSON file
     */
    public getPackages(recipe: string, python: string = "python"): Array<any> {
        let arrayPackageList: Array<any> = [];

        // This if condition is meant to empty the list
        // User can put empty string of the recipe name to get empty list
        if (recipe === "") {
            return arrayPackageList;
        }
        else {
            let jsonName: string = "package.json";

            let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

            let recipeName: string = "";

            if (!recipe.includes("@")) {
                recipeName = recipe + "@";
            }
            else {
                recipeName = recipe;
            }

            execSync(`${python} -m conans.conan search ${recipeName} --json ${jsonPath}`);

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
                    throw new Error("Unable to process JSON File of Conan binary package list.");
                }

                // Delete the temporary file after processing
                fs.unlinkSync(jsonPath);
            }

            // Return an empty list
            return arrayPackageList;
        }
    }

    /**
     * Method to get absolute path to the Conan remote json file.
     * This json file stores all the information about all the remotes information users configure
     * @param python 
     * @returns Absolute path to the Conan remote json file | undefined on error
     */
    public getRemoteFilePath(python: string = "python"): string | undefined {
        let conanHomePath = this.getConanHomePath(python);

        let remotePath = undefined;

        if (conanHomePath) {
            remotePath = path.join(conanHomePath!, "remotes.json");
        }

        return remotePath;
    }

    /**
     * Get the list of available remotes
     * @param python 
     * @returns List of availabel remotes
     */
    public getRemotes(python: string = "python"): Array<any> {
        let arrayRemoteList: Array<any> = [];

        let conanHomePath = this.getConanHomePath(python);

        if (conanHomePath === undefined) {
            throw new Error("Unable to locate Conan home folder.");
        }

        let jsonPath: string = path.join(conanHomePath!, "remotes.json");

        if (fs.existsSync(jsonPath)) {
            let tempFile = fs.readFileSync(jsonPath, 'utf8');
            let remoteJson = JSON.parse(tempFile);

            let remoteItemList = remoteJson.remotes;

            for (let remote of remoteItemList) {
                arrayRemoteList.push(remote);
            }
        }

        return arrayRemoteList;
    }

    /**
     * Method to remove a selected binary package from its recipe
     * @param recipe Conan recipe name
     * @param packageId Selected package Id to be removed
     * @param python 
     */
    public removePackage(recipe: string, packageId: string, python: string = "python") {
        execSync(`${python} -m conans.conan remove ${recipe} -p ${packageId} -f`);
    }

    /**
     * Remove a selected recipe from the local cache
     * @param recipe Conan recipe name to be removed
     * @param python 
     */
    public removeRecipe(recipe: string, python: string = "python") {
        execSync(`${python} -m conans.conan remove ${recipe} -f`);
    }

    /**
     * Remove a selected conan profile
     * To make the process quicker, we will delete the file directly from the system.
     * In this case, we don't use the Conan CLI
     * @param profile Conan profile name to be removed
     * @param python 
     */
    public removeProfile(profile: string, python: string = "python") {
        let conanProfilesPath = this.getConanProfilesPath(python);

        if (conanProfilesPath === undefined) {
            throw new Error("Unable to locate Conan profiles folder.");
        }

        let profileFilePath = path.join(conanProfilesPath, profile);

        fs.unlinkSync(profileFilePath);
    }

    /**
     * Add a new remote
     * @param remote Remote name
     * @param url URL that belongs to the remote
     * @param python 
     */
    public addRemote(remote: string, url: string, python: string = "python") {
        execSync(`${python} -m conans.conan remote add ${remote} ${url}`);
    }

    /**
     * Remove a selected remote from Conan
     * @param remote Remote name to be removed
     * @param python 
     */
    public removeRemote(remote: string, python: string = "python") {
        execSync(`${python} -m conans.conan remote remove ${remote}`);
    }

    /**
     * Enable/disable selected remote
     * @param remote Remote name
     * @param enable State to enable or disable
     * @param python 
     */
    public enableRemote(remote: string, enable: boolean, python: string = "python") {
        if (enable) {
            execSync(`${python} -m conans.conan remote enable ${remote}`);
        }
        else {
            execSync(`${python} -m conans.conan remote disable ${remote}`);
        }
    }

    /**
     * Rename selected remote
     * @param remoteName Remote name to be renamed
     * @param newName New name for the remote
     * @param python 
     */
    public renameRemote(remoteName: string, newName: string, python: string = "python") {
        execSync(`${python} -m conans.conan remote rename ${remoteName} ${newName}`);
    }

    /**
     * Edit URL of the selected remote
     * @param remoteName Remote name to be modified
     * @param url New URL for the selected remote
     * @param python 
     */
    public updateRemoteURL(remoteName: string, url: string, python: string = "python") {
        execSync(`${python} -m conans.conan remote update ${remoteName} ${url}`);
    }

    /**
     * Rename a selected profile
     * For this method we will use the file system approach again.
     * @param oldProfileName Profile name to be renamed
     * @param newProfileName New profile name
     * @param python 
     */
    public renameProfile(oldProfileName: string, newProfileName: string, python: string = "python") {
        // Get the absolute path to the selected profile
        let oldProfilePath = this.getProfileFilePath(oldProfileName, python);

        if (oldProfilePath) {
            fs.renameSync(oldProfilePath, path.join(this.getConanProfilesPath(python)!, newProfileName));
        }
        else {
            throw new Error(`Unable to locate profile ${oldProfileName}`);
        }
    }

    /**
     * Method to duplicate selected profile.
     * Sometimes we don't want to write everything from scratch, but just want to edit a small detail.
     * Therefore we can just use this method to duplicate an existing profile and give it a new name.
     * @param oldProfileName Profile name to be duplicated
     * @param newProfileName New profile name
     * @param python 
     */
    public duplicateProfile(oldProfileName: string, newProfileName: string, python: string = "python") {
        let oldProfilePath = this.getProfileFilePath(oldProfileName, python);

        if (oldProfileName) {
            fs.copyFileSync(oldProfilePath!, path.join(this.getConanProfilesPath(python)!, newProfileName));
        }
        else {
            throw new Error(`Unable to duplicate profile ${oldProfileName}`);
        }
    }

    /**
     * Create a new profile
     * @param profileName Name for the new profile
     * @param python 
     */
    public createNewProfile(profileName: string, python: string = "python") {
        execSync(`${python} -m conans.conan profile new  ${profileName}`);
    }

    /**
     * Method to retrieve recipe general information such as name, version, license and many more.
     * This method uses Conan CLI to get the recipe information and stores it in a JSON file.
     * @param recipeName Recipe name to get the information from
     * @param python 
     * @returns Recipe general information in JSON string format | undefined on error
     */
    public getRecipeInformation(recipeName: string, python: string = "python"): string | undefined {
        let recipeInfo: string | undefined = undefined;

        // Temporary file name to store the result of command execution
        let jsonName: string = "recipeInfo.json";

        let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

        execSync(`${python} -m conans.conan inspect ${recipeName} --json ${jsonPath}`);

        // Check if the file exists
        // With this check it validates if the conan command executed correctly without error
        // No JSON file will be written if the command is not executed correctly
        if (fs.existsSync(jsonPath)) {
            let tempFile = fs.readFileSync(jsonPath, 'utf8');

            // Convert string to json object first then to string again.
            // This convert to JSON object is meant to beautify the json identation
            let recipeInfoJson = JSON.parse(tempFile);
            recipeInfo = JSON.stringify(recipeInfoJson, null, 4);

            // Delete the temporary file after processing
            fs.unlinkSync(jsonPath);
        }

        return recipeInfo;
    }
}