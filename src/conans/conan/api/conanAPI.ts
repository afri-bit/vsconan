import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ConanAPI, ConanExecutionMode } from "../../api/base/conanAPI";
import { newConanTempPath, runConan } from "../../cli/runConan";
import { ConanPackage } from "../../model/conanPackage";
import { ConanPackageRevision } from "../../model/conanPackageRevision";
import { ConanRecipe } from "../../model/conanRecipe";
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
 * the extension will read the configuration file, where the user stores the python interpreter.
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
        const pathInConanLink = fs.readFileSync(conanLinkFile).toString("utf8");
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

    public override async getConanHomePath(): Promise<string | undefined> {
        try {
            const { stdout } = await runConan(
                ["config", "home"],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable
            );
            return stdout.trim();
        }
        catch (err) {
            console.log((err as Error).message);
            return undefined;
        }
    }

    public override async getConanProfilesPath(): Promise<string | undefined> {
        const conanHomePath = await this.getConanHomePath();
        if (conanHomePath !== undefined) {
            return path.join(conanHomePath, "profiles");
        }
        return undefined;
    }

    public override async getProfileFilePath(profileName: string): Promise<string | undefined> {
        const conanProfilesPath = await this.getConanProfilesPath();
        if (conanProfilesPath !== undefined) {
            return path.join(conanProfilesPath, profileName);
        }
        return undefined;
    }

    public override async getRecipePath(recipe: string): Promise<string | undefined> {
        const conanHome = await this.getConanHomePath();
        let returnValue: string | undefined = undefined;

        if (conanHome !== undefined) {
            const conanDataPath = path.join(conanHome, "data");
            let recipeName: string = "";
            let recipeVersion: string = "";
            let recipeUser: string = "_";
            let recipeChannel: string = "_";

            if (recipe.includes("@")) {
                recipeName = recipe.split("@")[0].split("/")[0];
                recipeVersion = recipe.split("@")[0].split("/")[1];
                recipeUser = recipe.split("@")[1].split("/")[0];
                recipeChannel = recipe.split("@")[1].split("/")[1];
            }
            else {
                recipeName = recipe.split("/")[0];
                recipeVersion = recipe.split("/")[1];
            }

            const recipePath = path.join(conanDataPath, recipeName, recipeVersion, recipeUser, recipeChannel);

            if (fs.existsSync(recipePath)) {
                returnValue = recipePath;
            }
        }

        return returnValue;
    }

    public override async getPackagePath(recipe: string, packageId: string): Promise<string | undefined> {
        let returnValue: string | undefined = undefined;
        const recipePath = await this.getRecipePath(recipe);

        if (recipePath !== undefined) {
            const packageFolder = path.join(recipePath, "package", packageId);
            const conanLinkFile = path.join(packageFolder, ".conan_link");

            if (fs.existsSync(conanLinkFile)) {
                const realPackagePath = fs.readFileSync(conanLinkFile).toString("utf8");
                returnValue = realPackagePath.trim();
            }
            else {
                returnValue = packageFolder;
            }
        }

        return returnValue;
    }

    public override async getRecipes(): Promise<Array<ConanRecipe>> {
        const arrayRecipeList: Array<ConanRecipe> = [];
        const jsonPath = newConanTempPath("recipe", ".json");

        try {
            await runConan(
                ["search", "--raw", "--json", jsonPath],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable
            );

            if (fs.existsSync(jsonPath)) {
                const tempFile = await fs.promises.readFile(jsonPath, "utf8");
                const recipeJson = JSON.parse(tempFile);

                if (!recipeJson.error) {
                    if (recipeJson.results.length > 0) {
                        const recipeItems = recipeJson.results[0].items;
                        for (const recipe of recipeItems) {
                            arrayRecipeList.push(new ConanRecipe(recipe.recipe.id, false, ""));
                        }
                    }
                }
                else {
                    throw new Error("Unable to process JSON File of Conan recipe list.");
                }
            }
        }
        finally {
            try {
                if (fs.existsSync(jsonPath)) {
                    await fs.promises.unlink(jsonPath);
                }
            }
            catch {
                /* ignore */
            }
        }

        return arrayRecipeList;
    }

    public override async getProfiles(): Promise<Array<string>> {
        const arrayProfileList: Array<string> = [];
        const jsonPath = newConanTempPath("profile", ".json");

        try {
            await runConan(
                ["profile", "list", "--json", jsonPath],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable
            );

            if (fs.existsSync(jsonPath)) {
                const tempFile = await fs.promises.readFile(jsonPath, "utf8");
                const jsonData = JSON.parse(tempFile);
                for (const profile of jsonData) {
                    arrayProfileList.push(profile);
                }
            }
        }
        finally {
            try {
                if (fs.existsSync(jsonPath)) {
                    await fs.promises.unlink(jsonPath);
                }
            }
            catch {
                /* ignore */
            }
        }

        return arrayProfileList;
    }

    public override async getPackages(recipe: string): Promise<Array<ConanPackage>> {
        const arrayPackageList: Array<ConanPackage> = [];

        if (recipe === "") {
            return arrayPackageList;
        }

        const jsonPath = newConanTempPath("package", ".json");
        const recipeName = !recipe.includes("@") ? recipe + "@" : recipe;

        try {
            await runConan(
                ["search", recipeName, "--json", jsonPath],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable
            );

            if (fs.existsSync(jsonPath)) {
                const tempFile = await fs.promises.readFile(jsonPath, "utf8");
                const recipeJson = JSON.parse(tempFile);

                if (!recipeJson.error) {
                    if (recipeJson.results.length > 0) {
                        const packageItems = recipeJson.results[0].items[0].packages;
                        for (const pkg of packageItems) {
                            arrayPackageList.push(new ConanPackage(pkg.id, false, pkg.options, pkg.outdated, pkg.requires, pkg.settings));
                        }
                    }
                }
                else {
                    throw new Error("Unable to process JSON File of Conan binary package list.");
                }
            }
        }
        finally {
            try {
                if (fs.existsSync(jsonPath)) {
                    await fs.promises.unlink(jsonPath);
                }
            }
            catch {
                /* ignore */
            }
        }

        return arrayPackageList;
    }

    public override async getRemoteFilePath(): Promise<string | undefined> {
        const conanHomePath = await this.getConanHomePath();
        if (conanHomePath) {
            return path.join(conanHomePath, "remotes.json");
        }
        return undefined;
    }

    public override async getRemotes(): Promise<Array<ConanRemote>> {
        const arrayRemoteList: Array<ConanRemote> = [];
        const conanHomePath = await this.getConanHomePath();

        if (conanHomePath === undefined) {
            throw new Error("Unable to locate Conan home folder.");
        }

        const jsonPath: string = path.join(conanHomePath, "remotes.json");

        if (fs.existsSync(jsonPath)) {
            const tempFile = await fs.promises.readFile(jsonPath, "utf8");
            const remoteJson = JSON.parse(tempFile);
            const remoteItemList = remoteJson.remotes;

            for (const remote of remoteItemList) {
                arrayRemoteList.push(new ConanRemote(remote.name, remote.url, remote.verify_ssl, remote.disabled ? false : true));
            }
        }

        return arrayRemoteList;
    }

    public override async removePackage(recipe: string, packageId: string): Promise<void> {
        await runConan(
            ["remove", recipe, "-p", packageId, "-f"],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );
    }

    public override async removeRecipe(recipe: string): Promise<void> {
        await runConan(
            ["remove", recipe, "-f"],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );
    }

    public override async removeProfile(profile: string): Promise<void> {
        const conanProfilesPath = await this.getConanProfilesPath();
        if (conanProfilesPath === undefined) {
            throw new Error("Unable to locate Conan profiles folder.");
        }
        const profileFilePath = path.join(conanProfilesPath, profile);
        await fs.promises.unlink(profileFilePath);
    }

    public override async addRemote(remote: string, url: string): Promise<void> {
        await runConan(
            ["remote", "add", remote, url],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );
    }

    public override async removeRemote(remote: string): Promise<void> {
        await runConan(
            ["remote", "remove", remote],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );
    }

    public override async enableRemote(remote: string, enable: boolean): Promise<void> {
        if (enable) {
            await runConan(
                ["remote", "enable", remote],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable
            );
        }
        else {
            await runConan(
                ["remote", "disable", remote],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable
            );
        }
    }

    public override async renameRemote(remoteName: string, newName: string): Promise<void> {
        await runConan(
            ["remote", "rename", remoteName, newName],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );
    }

    public override async updateRemoteURL(remoteName: string, url: string): Promise<void> {
        await runConan(
            ["remote", "update", remoteName, url],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );
    }

    public override async renameProfile(oldProfileName: string, newProfileName: string): Promise<void> {
        const oldProfilePath = await this.getProfileFilePath(oldProfileName);
        const profilesPath = await this.getConanProfilesPath();

        if (oldProfilePath && profilesPath) {
            await fs.promises.rename(oldProfilePath, path.join(profilesPath, newProfileName));
        }
        else {
            throw new Error(`Unable to locate profile ${oldProfileName}`);
        }
    }

    public override async duplicateProfile(oldProfileName: string, newProfileName: string): Promise<void> {
        const oldProfilePath = await this.getProfileFilePath(oldProfileName);
        const profilesPath = await this.getConanProfilesPath();

        if (oldProfilePath && profilesPath) {
            await fs.promises.copyFile(oldProfilePath, path.join(profilesPath, newProfileName));
        }
        else {
            throw new Error(`Unable to duplicate profile ${oldProfileName}`);
        }
    }

    public override async createNewProfile(profileName: string): Promise<void> {
        await runConan(
            ["profile", "new", profileName],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );
    }

    public override async getRecipeInformation(recipeName: string): Promise<string | undefined> {
        let recipeInfo: string | undefined = undefined;
        const jsonPath = newConanTempPath("recipeInfo", ".json");

        try {
            await runConan(
                ["inspect", recipeName, "--json", jsonPath],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable
            );

            if (fs.existsSync(jsonPath)) {
                const tempFile = await fs.promises.readFile(jsonPath, "utf8");
                const recipeInfoJson = JSON.parse(tempFile);
                recipeInfo = JSON.stringify(recipeInfoJson, null, 4);
            }
        }
        finally {
            try {
                if (fs.existsSync(jsonPath)) {
                    await fs.promises.unlink(jsonPath);
                }
            }
            catch {
                /* ignore */
            }
        }

        return recipeInfo;
    }

    public override async getDirtyPackage(recipeName: string): Promise<Array<ConanPackage>> {
        const dirtyPackageList: Array<ConanPackage> = [];
        const recipePath = await this.getRecipePath(recipeName);

        if (recipePath) {
            const recipePackagePath = path.join(recipePath, "package");
            const listOfFiles = fs.readdirSync(recipePackagePath, { withFileTypes: true })
                .filter(item => !item.isDirectory())
                .map(item => item.name);
            const dirtyFiles = listOfFiles.filter(el => path.extname(el) === ".dirty");

            for (const f of dirtyFiles) {
                dirtyPackageList.push(new ConanPackage(f, true, {}, false, {}, {}));
            }

            return dirtyPackageList;
        }

        throw new Error(`Unable to find data path for recipe '${recipeName}'`);
    }

    public override async getEditablePackageRecipes(): Promise<Array<ConanRecipe>> {
        const conanEditableRecipeList: Array<ConanRecipe> = [];

        const { stdout } = await runConan(
            ["editable", "list"],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );

        const tempFile = stdout;
        let stringList: string[] = [];

        if (tempFile.length > 0) {
            stringList = tempFile.split("\n");

            if (stringList[0].includes("cacert.pem")) {
                stringList = stringList.splice(-1, 1);
            }

            stringList.pop();

            for (let i = 0; i < stringList.length; i++) {
                if (i % 3 === 0) {
                    const recipeName = stringList[i].trim();
                    const recipePath = stringList[i + 1].trim().replace("Path: ", "");
                    conanEditableRecipeList.push(new ConanRecipe(recipeName, true, recipePath));
                }
            }
        }

        return conanEditableRecipeList;
    }

    public override async removeEditablePackageRecipe(recipe: string): Promise<void> {
        await runConan(
            ["editable", "remove", recipe],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );
    }

    public override async addEditablePackage(recipePath: string, name: string, user: string, channel: string, layout: string): Promise<void> {
        let recipeName: string = name;
        if (user !== "" && channel !== "") {
            recipeName = recipeName + `@${user}/${channel}`;
        }

        await runConan(
            ["editable", "add", recipePath, recipeName, "--layout", layout],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );
    }

    public override async getRecipeAttribute(recipePath: string, attribute: string): Promise<string> {
        const { stdout } = await runConan(
            ["inspect", recipePath, "--raw", attribute],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );

        let stringList = stdout.split("\n");

        if (stringList[0].includes("cacert.pem")) {
            stringList = stringList.splice(-1, 1);
        }

        return stringList[0];
    }

    public override async getRecipesByRemote(remote: string): Promise<Array<ConanRecipe>> {
        const listOfRecipes: Array<ConanRecipe> = [];
        const { stdout } = await runConan(
            ["remote", "list_ref"],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );

        let stringList = stdout.split(os.EOL);

        if (stringList[0].includes("cacert.pem")) {
            stringList.splice(0, 1);
        }

        stringList.pop();

        for (const item of stringList) {
            const remoteRef = item.split(": ");
            if (remoteRef[1] === remote) {
                listOfRecipes.push(new ConanRecipe(remoteRef[0], false, ""));
            }
        }

        return listOfRecipes;
    }

    public override async getFolderPathFromRecipe(recipe: string, folderOption: RecipeFolderOption): Promise<string> {
        const recipePath = await this.getRecipePath(recipe);
        let returnValue = "";

        if (recipePath) {
            const buildFolder = path.join(recipePath, folderOption);
            const conanLinkFile = path.join(buildFolder, ".conan_link");

            if (fs.existsSync(buildFolder)) {
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

    public override async getPackagesByRemote(recipe: string, remote: string): Promise<Array<ConanPackage>> {
        const listOfPackages: Array<ConanPackage> = [];

        if (recipe === "") {
            return listOfPackages;
        }

        const { stdout } = await runConan(
            ["remote", "list_pref", recipe],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable
        );

        let stringList = stdout.split(os.EOL);

        if (stringList[0].includes("cacert.pem")) {
            stringList.splice(0, 1);
        }

        stringList.pop();

        for (const item of stringList) {
            const binaryPackageRef = item.replace(`${recipe}:`, "").split(": ");
            if (binaryPackageRef[1] === remote) {
                listOfPackages.push(new ConanPackage(binaryPackageRef[0], false, {}, false, {}, {}, ""));
            }
        }

        return listOfPackages;
    }

    public override async getPackageRevisions(_recipe: string, _packageId: string): Promise<Array<ConanPackageRevision>> {
        return [];
    }

    public override async getPackageRevisionPath(_recipe: string, _packageId: string, _revisionId: string): Promise<string | undefined> {
        return undefined;
    }

    public override async removePackageRevision(_recipe: string, _packageId: string, _revisionId: string): Promise<void> {
        /* Conan 1: no-op */
    }
}
