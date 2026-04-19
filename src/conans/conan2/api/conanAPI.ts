import * as fs from "fs";
import * as vscode from "vscode";
import { ConanAPI, ConanExecutionMode } from "../../api/base/conanAPI";
import { RecipeFolderOption } from "../../conan/api/conanAPI";
import { runConan } from "../../cli/runConan";
import { ConanPackage } from "../../model/conanPackage";
import { ConanPackageRevision } from "../../model/conanPackageRevision";
import { ConanRecipe } from "../../model/conanRecipe";
import { ConanRemote } from "../../model/conanRemote";
import path = require("path");

export class Conan2API extends ConanAPI {

    public constructor(pythonInterpreter: string, conanExecutable: string, conanExecutionMode: ConanExecutionMode) {
        super(pythonInterpreter, conanExecutable, conanExecutionMode);
        this.switchExecutionMode(this.conanExecutionMode);
    }

    private getCwd(): string | undefined {
        return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    }

    private runOpts() {
        return { cwd: this.getCwd() };
    }

    public override switchExecutionMode(mode: ConanExecutionMode): void {
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

    public override setPythonInterpreter(python: string): void {
        this.pythonInterpreter = python;
    }

    public override switchToPythonMode(pythonInterpreter: string): void {
        this.setPythonInterpreter(pythonInterpreter);
        this.switchExecutionMode(ConanExecutionMode.python);
    }

    public override setConanExecutable(conanExecutable: string): void {
        this.conanExecutable = conanExecutable;
    }

    public override switchToConanExecutableMode(conanExecutable: string): void {
        this.setConanExecutable(conanExecutable);
        this.switchExecutionMode(ConanExecutionMode.conan);
    }

    public override async getConanHomePath(): Promise<string | undefined> {
        try {
            const { stdout } = await runConan(
                ["config", "home"],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable,
                this.runOpts()
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
        const { stdout } = await runConan(
            ["cache", "path", recipe],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable,
            this.runOpts()
        );
        return stdout.trim();
    }

    public override async getPackagePath(recipe: string, packageId: string): Promise<string | undefined> {
        const { stdout } = await runConan(
            ["cache", "path", `${recipe}:${packageId}`],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable,
            this.runOpts()
        );
        return stdout.trim();
    }

    public override async getRecipes(): Promise<Array<ConanRecipe>> {
        let listOfRecipes: Array<ConanRecipe> = [];

        try {
            const { stdout } = await runConan(
                ["list", "*#*", "--format", "json"],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable,
                this.runOpts()
            );
            const jsonObject = JSON.parse(stdout);
            const localCache = jsonObject["Local Cache"];

            for (const recipe in localCache) {
                for (const rev in localCache[recipe].revisions) {
                    listOfRecipes.push(new ConanRecipe(`${recipe}#${rev}`, false));
                }
            }
        }
        catch (err) {
            console.log((err as Error).message);
            listOfRecipes = [];
        }

        return listOfRecipes;
    }

    public override async getProfiles(): Promise<string[]> {
        try {
            const { stdout } = await runConan(
                ["profile", "list", "--format", "json"],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable,
                this.runOpts()
            );
            return JSON.parse(stdout);
        }
        catch (err) {
            console.log((err as Error).message);
            return [];
        }
    }

    public override async getPackages(recipe: string): Promise<ConanPackage[]> {
        let listOfPackages: Array<ConanPackage> = [];

        try {
            if (recipe) {
                const { stdout } = await runConan(
                    ["list", `${recipe}:*`, "--format", "json"],
                    this.conanExecutionMode,
                    this.pythonInterpreter,
                    this.conanExecutable,
                    this.runOpts()
                );
                const jsonObject = JSON.parse(stdout);
                const recipeRevisionSplit = recipe.split("#");
                const localCache = jsonObject["Local Cache"];
                const packageObjects = localCache[recipeRevisionSplit[0]]["revisions"][recipeRevisionSplit[1]]["packages"];

                for (const packageId in packageObjects) {
                    listOfPackages.push(new ConanPackage(
                        packageId,
                        false,
                        packageObjects[packageId].info.options,
                        false,
                        Object(),
                        packageObjects[packageId].info.settings,
                        ""
                    ));
                }
            }
        }
        catch (err) {
            console.log((err as Error).message);
            listOfPackages = [];
        }

        return listOfPackages;
    }

    public override async getRemoteFilePath(): Promise<string | undefined> {
        const conanHomePath = await this.getConanHomePath();
        if (conanHomePath) {
            return path.join(conanHomePath, "remotes.json");
        }
        return undefined;
    }

    public override async getRemotes(): Promise<ConanRemote[]> {
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
            ["remove", `${recipe}:${packageId}`, "-c"],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable,
            this.runOpts()
        );
    }

    public override async removeRecipe(recipe: string): Promise<void> {
        await runConan(
            ["remove", recipe, "-c"],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable,
            this.runOpts()
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
            this.conanExecutable,
            this.runOpts()
        );
    }

    public override async removeRemote(remote: string): Promise<void> {
        await runConan(
            ["remote", "remove", remote],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable,
            this.runOpts()
        );
    }

    public override async enableRemote(remote: string, enable: boolean): Promise<void> {
        if (enable) {
            await runConan(
                ["remote", "enable", remote],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable,
                this.runOpts()
            );
        }
        else {
            await runConan(
                ["remote", "disable", remote],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable,
                this.runOpts()
            );
        }
    }

    public override async renameRemote(remoteName: string, newName: string): Promise<void> {
        await runConan(
            ["remote", "rename", remoteName, newName],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable,
            this.runOpts()
        );
    }

    public override async updateRemoteURL(remoteName: string, url: string): Promise<void> {
        await runConan(
            ["remote", "update", remoteName, "--url", url],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable,
            this.runOpts()
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
        const conanProfilesPath = await this.getConanProfilesPath();

        if (conanProfilesPath === undefined) {
            throw new Error("Unable to locate Conan profiles folder.");
        }

        const emptyProfileContent = "[settings]\n[options]\n[build_requires]\n[env]\n";
        await fs.promises.writeFile(path.join(conanProfilesPath, profileName), emptyProfileContent);
    }

    public override async getRecipeInformation(_recipeName: string): Promise<string | undefined> {
        throw new Error("Method not implemented.");
    }

    public override async getDirtyPackage(_recipeName: string): Promise<ConanPackage[]> {
        throw new Error("Method not implemented.");
    }

    public override async getEditablePackageRecipes(): Promise<ConanRecipe[]> {
        return [];
    }

    public override async removeEditablePackageRecipe(_recipe: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public override async addEditablePackage(_recipePath: string, _name: string, _user: string, _channel: string, _layout: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public override async getRecipeAttribute(_recipePath: string, _attribute: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public override async getRecipesByRemote(_remote: string): Promise<ConanRecipe[]> {
        return [];
    }

    public override async getFolderPathFromRecipe(_recipe: string, _folderOption: RecipeFolderOption): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public override async getPackagesByRemote(_recipe: string, _remote: string): Promise<ConanPackage[]> {
        throw new Error("Method not implemented.");
    }

    public override async getPackageRevisions(recipe: string, packageId: string): Promise<Array<ConanPackageRevision>> {
        let listOfPackageRevisions: Array<ConanPackageRevision> = [];

        try {
            if (recipe && packageId) {
                const { stdout } = await runConan(
                    ["list", `${recipe}:${packageId}#*`, "--format", "json"],
                    this.conanExecutionMode,
                    this.pythonInterpreter,
                    this.conanExecutable,
                    this.runOpts()
                );
                const jsonObject = JSON.parse(stdout);
                const recipeRevisionSplit = recipe.split("#");
                const localCache = jsonObject["Local Cache"];
                const packageRevisionObjects = localCache[recipeRevisionSplit[0]]["revisions"][recipeRevisionSplit[1]]["packages"][packageId]["revisions"];

                for (const revisionId in packageRevisionObjects) {
                    listOfPackageRevisions.push(
                        new ConanPackageRevision(
                            revisionId,
                            packageRevisionObjects[revisionId]["timestamp"]
                        )
                    );
                }
            }
        }
        catch (err) {
            console.log((err as Error).message);
            listOfPackageRevisions = [];
        }

        return listOfPackageRevisions;
    }

    public override async getPackageRevisionPath(recipe: string, packageId: string, revisionId: string): Promise<string | undefined> {
        try {
            const { stdout } = await runConan(
                ["cache", "path", `${recipe}:${packageId}#${revisionId}`],
                this.conanExecutionMode,
                this.pythonInterpreter,
                this.conanExecutable,
                this.runOpts()
            );
            return stdout.trim();
        }
        catch (err) {
            console.log((err as Error).message);
            return undefined;
        }
    }

    public override async removePackageRevision(recipe: string, packageId: string, revisionId: string): Promise<void> {
        await runConan(
            ["remove", `${recipe}:${packageId}#${revisionId}`, "-c"],
            this.conanExecutionMode,
            this.pythonInterpreter,
            this.conanExecutable,
            this.runOpts()
        );
    }
}
