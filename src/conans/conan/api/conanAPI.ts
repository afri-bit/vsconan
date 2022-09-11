import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import * as utils from "../../../utils/utils";
import { ConanPackage } from "../../model/conanPackage";
import { ConanRecipe } from "../../model/conanRecipe";
import { ConanAPI } from "../../api/base/conanAPI";
import { ConanExecutionMode } from "../../api/base/conanAPI";
import { ConanRemote } from "../../model/conanRemote";

export enum RecipeFolderOption {
    build = "build",
    download = "dl",
    export = "export",
    exportSource = "export_source",
    locks = "locks",
    package = "package",
    source = "source",
    scmSource = "scm_source"
}

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
export class Conan1API extends ConanAPI {

    public constructor(pythonInterpreter: string, conanExecutable: string, conanExecutionMode: ConanExecutionMode) {
        super(pythonInterpreter, conanExecutable, conanExecutionMode);
        this.switchExecutionMode(this.conanExecutionMode);
    }

    /**
     * Helper function to get the path inside .conan_link file
     * This .conan_link exists if conan is configured using short path (Windows), 
     * so it will contain a reference to another path
     * @param conanLinkFile Path to .conan_link file
     * @returns Path inside the .conan_link file
     */
    private getPathFromConanLink(conanLinkFile: string): string {
        let pathInConanLink = fs.readFileSync(conanLinkFile).toString('utf8');
        return pathInConanLink.trim();
    }

    public override switchExecutionMode(mode: ConanExecutionMode) {
        switch (this.conanExecutionMode) {
            case ConanExecutionMode.python: {
                this.conanExecutor = this.pythonInterpreter + " -m conans.conan";
                break;
            }
            case ConanExecutionMode.conan: {
                this.conanExecutor = this.conanExecutable;
                break;
            }
        }
    }

    public override setPythonInterpreter(python: string) {
        this.pythonInterpreter = python;
    }

    public override switchToPythonMode(pythonInterpreter: string) {
        this.setPythonInterpreter(pythonInterpreter);
        this.switchExecutionMode(ConanExecutionMode.python);
    }

    public override setConanExecutable(conanExecutable: string) {
        this.conanExecutable = conanExecutable;
    }

    public override switchToConanExecutableMode(conanExecutable: string) {
        this.setConanExecutable(conanExecutable);
        this.switchExecutionMode(ConanExecutionMode.conan);
    }

    public override getConanHomePath(): string | undefined {
        try {
            let homePath = execSync(`${this.conanExecutor} config home`).toString();
            return homePath.trim(); // Remove whitespace and new lines
        }
        catch (err) {
            console.log((err as Error).message);
            return undefined;
        }
    }

    public override getConanProfilesPath(): string | undefined {
        let returnValue: string | undefined = undefined;

        let conanHomePath = this.getConanHomePath();

        if (conanHomePath !== undefined) {
            returnValue = path.join(conanHomePath, "profiles");
        }

        return returnValue;
    }

    public override getProfileFilePath(profileName: string): string | undefined {
        let returnValue: string | undefined = undefined;

        let conanProfilesPath = this.getConanProfilesPath();

        if (conanProfilesPath !== undefined) {
            returnValue = path.join(conanProfilesPath, profileName);
        }

        return returnValue;
    }

    public override getRecipePath(recipe: string): string | undefined {
        let conanHome = this.getConanHomePath();

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

    public override getPackagePath(recipe: string, packageId: string): string | undefined {
        let returnValue: string | undefined = undefined;

        let recipePath = this.getRecipePath(recipe);

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

    public override getRecipes(): Array<ConanRecipe> {
        // Initialize an empty array of string as default return value
        let arrayRecipeList: Array<ConanRecipe> = [];

        // Initialize the temporary json file name
        let jsonName: string = "recipe.json";

        // Create the path where the temporary file will be stored
        // We will use the VSConan home folder under user home folder
        let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

        execSync(`${this.conanExecutor} search --raw --json ${jsonPath}`);

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
                        arrayRecipeList.push(new ConanRecipe(recipe.recipe.id, false, ""));
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

    public override getProfiles(): Array<string> {

        let arrayProfileList: Array<string> = [];

        let jsonName: string = "profile.json";

        let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

        execSync(`${this.conanExecutor} profile list --json ${jsonPath}`);

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

    public override getPackages(recipe: string): Array<ConanPackage> {
        let arrayPackageList: Array<ConanPackage> = [];

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

            execSync(`${this.conanExecutor} search ${recipeName} --json ${jsonPath}`);

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
                            arrayPackageList.push(new ConanPackage(pkg.id, false, pkg.options, pkg.outdated, pkg.requires, pkg.settings));
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

    public override getRemoteFilePath(): string | undefined {
        let conanHomePath = this.getConanHomePath();

        let remotePath = undefined;

        if (conanHomePath) {
            remotePath = path.join(conanHomePath!, "remotes.json");
        }

        return remotePath;
    }

    public override getRemotes(): Array<ConanRemote> {
        let arrayRemoteList: Array<ConanRemote> = [];

        let conanHomePath = this.getConanHomePath();

        if (conanHomePath === undefined) {
            throw new Error("Unable to locate Conan home folder.");
        }

        let jsonPath: string = path.join(conanHomePath!, "remotes.json");

        if (fs.existsSync(jsonPath)) {
            let tempFile = fs.readFileSync(jsonPath, 'utf8');
            let remoteJson = JSON.parse(tempFile);

            let remoteItemList = remoteJson.remotes;

            for (let remote of remoteItemList) {
                arrayRemoteList.push(new ConanRemote(remote.name, remote.url, remote.verify_ssl, remote.disabled ? false : true));
            }
        }

        return arrayRemoteList;
    }

    public override removePackage(recipe: string, packageId: string) {
        execSync(`${this.conanExecutor} remove ${recipe} -p ${packageId} -f`);
    }

    public override removeRecipe(recipe: string) {
        execSync(`${this.conanExecutor} remove ${recipe} -f`);
    }

    public override removeProfile(profile: string) {
        let conanProfilesPath = this.getConanProfilesPath();

        if (conanProfilesPath === undefined) {
            throw new Error("Unable to locate Conan profiles folder.");
        }

        let profileFilePath = path.join(conanProfilesPath, profile);

        fs.unlinkSync(profileFilePath);
    }

    public override addRemote(remote: string, url: string) {
        execSync(`${this.conanExecutor} remote add ${remote} ${url}`);
    }

    public override removeRemote(remote: string) {
        execSync(`${this.conanExecutor} remote remove ${remote}`);
    }

    public override enableRemote(remote: string, enable: boolean) {
        if (enable) {
            execSync(`${this.conanExecutor} remote enable ${remote}`);
        }
        else {
            execSync(`${this.conanExecutor} remote disable ${remote}`);
        }
    }

    public override renameRemote(remoteName: string, newName: string) {
        execSync(`${this.conanExecutor} remote rename ${remoteName} ${newName}`);
    }

    public override updateRemoteURL(remoteName: string, url: string) {
        execSync(`${this.conanExecutor} remote update ${remoteName} ${url}`);
    }

    public override renameProfile(oldProfileName: string, newProfileName: string) {
        // Get the absolute path to the selected profile
        let oldProfilePath = this.getProfileFilePath(oldProfileName);

        if (oldProfilePath) {
            fs.renameSync(oldProfilePath, path.join(this.getConanProfilesPath()!, newProfileName));
        }
        else {
            throw new Error(`Unable to locate profile ${oldProfileName}`);
        }
    }

    public override duplicateProfile(oldProfileName: string, newProfileName: string) {
        let oldProfilePath = this.getProfileFilePath(oldProfileName);

        if (oldProfileName) {
            fs.copyFileSync(oldProfilePath!, path.join(this.getConanProfilesPath()!, newProfileName));
        }
        else {
            throw new Error(`Unable to duplicate profile ${oldProfileName}`);
        }
    }

    public override createNewProfile(profileName: string) {
        execSync(`${this.conanExecutor} profile new  ${profileName}`);
    }

    public override getRecipeInformation(recipeName: string): string | undefined {
        let recipeInfo: string | undefined = undefined;

        // Temporary file name to store the result of command execution
        let jsonName: string = "recipeInfo.json";

        let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

        execSync(`${this.conanExecutor} inspect ${recipeName} --json ${jsonPath}`);

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

    public override getDirtyPackage(recipeName: string): Array<ConanPackage> {
        let dirtyPackageList: Array<ConanPackage> = [];

        // Get the recipePath
        let recipePath = this.getRecipePath(recipeName);

        if (recipePath) {
            let recipePackagePath = path.join(recipePath!, "package");

            let listOfFiles = fs.readdirSync(recipePackagePath, { withFileTypes: true })
                .filter(item => !item.isDirectory())
                .map(item => item.name);

            let dirtyFiles = listOfFiles.filter(el => path.extname(el) === ".dirty");

            for (let f of dirtyFiles) {
                dirtyPackageList.push(new ConanPackage(f, true, {}, false, {}, {}));
            }

            return dirtyPackageList;
        }
        else {
            throw new Error(`Unable to find data path for recipe '${recipeName}'`);
        }
    }

    public override getEditablePackageRecipes(): Array<ConanRecipe> {
        let conanEditableRecipeList: Array<ConanRecipe> = [];

        let jsonName: string = "editable_package.txt";

        let jsonPath: string = path.join(utils.vsconan.getVSConanHomeDirTemp(), jsonName);

        execSync(`${this.conanExecutor} editable list > ${jsonPath}`);
        // let foo = execSync(`${this.conanExecutor} editable list`).toString();

        let tempFile = fs.readFileSync(jsonPath, 'utf8').toString();

        let stringList = [];

        if (tempFile.length > 0) {
            stringList = tempFile.split("\n");

            // Removing unnecessary text from the conan command line output
            // This output is written to the output if the settngs.yaml is updated
            // We need to remove this to start parse the information we need
            if (stringList[0].includes("cacert.pem")) {
                stringList = stringList.splice(-1, 1);
            }

            // Remove empty line in the last element
            stringList.pop();

            // Start parsing the information
            for (let i = 0; i < stringList.length; i++) {
                // Every third item is the header of the data (name of the recipe)
                // Thats why we check it with modulo
                if (i % 3 === 0) {
                    let recipeName = stringList[i].trim();
                    let recipePath = stringList[i + 1].trim().replace("Path: ", "");
                    conanEditableRecipeList.push(new ConanRecipe(recipeName, true, recipePath));
                }
            }
            console.log(tempFile.length)
        }

        return conanEditableRecipeList;
    }

    public override removeEditablePackageRecipe(recipe: string) {
        execSync(`${this.conanExecutor} editable remove ${recipe}`);
    }

    public override addEditablePackage(recipePath: string, name: string, user: string, channel: string, layout: string) {
        let recipeName: string = name;

        if (user != "" && channel != "") {
            recipeName = recipeName + `@${user}/${channel}`;
        }

        execSync(`${this.conanExecutor} editable add ${recipePath} ${recipeName} --layout "${layout}"`);
    }

    public override getRecipeAttribute(recipePath: string, attribute: string) {
        let res = execSync(`${this.conanExecutor} inspect ${recipePath} --raw ${attribute}`).toString();

        let stringList = [];

        stringList = res.split("\n");

        if (stringList[0].includes("cacert.pem")) {
            stringList = stringList.splice(-1, 1);
        }

        return stringList[0];
    }

    public override getRecipesByRemote(remote: string): Array<ConanRecipe> {
        let listOfRecipes: Array<ConanRecipe> = [];

        // Execute the conan remote `list_ref` to get list of recipe with associated remote
        let res = execSync(`${this.conanExecutor} remote list_ref`).toString();

        let stringList = [];

        stringList = res.split(os.EOL);

        if (stringList[0].includes("cacert.pem")) {
            stringList.splice(0, 1);
        }

        // Remove empty line in the last element
        stringList.pop();

        for (let item of stringList) {
            // The output from CLI is string with such format 'boost/1.77.0: conan.io'
            // To get the recipe name we need to split the string using following string
            let remoteRef = item.split(": ");

            // Check if the remote is matched to given one
            if (remoteRef[1] === remote) {
                listOfRecipes.push(new ConanRecipe(remoteRef[0], false, ""));
            }
        }

        return listOfRecipes;
    }

    public override getFolderPathFromRecipe(recipe: string, folderOption: RecipeFolderOption): string {
        let recipePath = this.getRecipePath(recipe);

        let returnValue = ""

        if (recipePath) {
            let buildFolder = path.join(recipePath, folderOption);

            let conanLinkFile = path.join(buildFolder, ".conan_link");

            if (fs.existsSync(buildFolder)) {
                // If .conan_link exists, it means conan only give reference to the real path using content of this file
                if (fs.existsSync(conanLinkFile)) {
                    returnValue = this.getPathFromConanLink(conanLinkFile);
                }
                else {
                    returnValue = buildFolder;
                }
            }
        }

        return returnValue;
    }
    
    public override getPackagesByRemote(recipe: string, remote: string): Array<ConanPackage> {
        let listOfPackages: Array<ConanPackage> = [];

        if (recipe === "") {
            return listOfPackages;
        }
        else {
            // Execute the conan remote `list_ref` to get list of recipe with associated remote
            let res = execSync(`${this.conanExecutor} remote list_pref ${recipe}`).toString();

            let stringList = [];

            stringList = res.split(os.EOL);

            if (stringList[0].includes("cacert.pem")) {
                stringList.splice(0, 1);
            }

            // Remove empty line in the last element
            stringList.pop();

            for (let item of stringList) {
                // The output from CLI is string with such format 'boost/1.77.0: conan.io'
                // To get the recipe name we need to split the string using following string
                let binaryPackageRef = item.replace(`${recipe}:`, "").split(": ");

                // Check if the remote is matched to given one
                if (binaryPackageRef[1] === remote) {
                    listOfPackages.push(new ConanPackage(binaryPackageRef[0], false, {}, false, {}, {}, ""));
                }

            }

            return listOfPackages
        }
    }
}