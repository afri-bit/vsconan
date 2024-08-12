import { execSync } from "child_process";
import * as fs from "fs";
import * as vscode from 'vscode';
import { ConanAPI, ConanExecutionMode } from "../../api/base/conanAPI";
import { RecipeFolderOption } from "../../conan/api/conanAPI";
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

    public override getConanHomePath(): string | undefined {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        try {
            let homePath = execSync(`${this.conanExecutor} config home`, options).toString();
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
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        let recipePath = execSync(`${this.conanExecutor} cache path ${recipe}`, options).toString().trim();

        return recipePath;
    }

    public override getPackagePath(recipe: string, packageId: string): string | undefined {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        let packagePath = execSync(`${this.conanExecutor} cache path ${recipe}:${packageId}`, options).toString().trim();

        return packagePath;
    }

    public override getRecipes(): Array<ConanRecipe> {
        let listOfRecipes: Array<ConanRecipe> = [];

        try {
            const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
            let jsonStdout = execSync(`${this.conanExecutor} list *#* --format json`, options);
            let jsonObject = JSON.parse(jsonStdout.toString());

            let localCache = jsonObject["Local Cache"];

            for (let recipe in localCache) {
                for (let rev in localCache[recipe].revisions) {
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

    public override getProfiles(): string[] {

        try {
            const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
            let stdout = execSync(`${this.conanExecutor} profile list --format json`, options);
            let jsonObject = JSON.parse(stdout.toString());
            return jsonObject;
        }
        catch (err) {
            console.log((err as Error).message);
            return [];
        }
    }

    public override getPackages(recipe: string): ConanPackage[] {
        let listOfPackages: Array<ConanPackage> = [];

        try {
            if (recipe) {
                const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
                let jsonStdout = execSync(`${this.conanExecutor} list ${recipe}:* --format json`, options);
                let jsonObject = JSON.parse(jsonStdout.toString());

                let recipeRevisionSplit = recipe.split("#");

                let localCache = jsonObject["Local Cache"];

                let packageObjects = localCache[recipeRevisionSplit[0]]["revisions"][recipeRevisionSplit[1]]["packages"];

                for (let packageId in packageObjects) {

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

    public override getRemoteFilePath(): string | undefined {
        let conanHomePath = this.getConanHomePath();

        let remotePath = undefined;

        if (conanHomePath) {
            remotePath = path.join(conanHomePath!, "remotes.json");
        }

        return remotePath;
    }

    public override getRemotes(): ConanRemote[] {
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

    public override removePackage(recipe: string, packageId: string): void {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        execSync(`${this.conanExecutor} remove ${recipe}:${packageId} -c`, options);
    }

    public override removeRecipe(recipe: string): void {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        execSync(`${this.conanExecutor} remove ${recipe} -c`, options);
    }

    public override removeProfile(profile: string): void {
        let conanProfilesPath = this.getConanProfilesPath();

        if (conanProfilesPath === undefined) {
            throw new Error("Unable to locate Conan profiles folder.");
        }

        let profileFilePath = path.join(conanProfilesPath, profile);

        fs.unlinkSync(profileFilePath);
    }

    public override addRemote(remote: string, url: string): void {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        execSync(`${this.conanExecutor} remote add ${remote} ${url}`, options);
    }

    public override removeRemote(remote: string): void {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        execSync(`${this.conanExecutor} remote remove ${remote}`, options);
    }

    public override enableRemote(remote: string, enable: boolean): void {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        if (enable) {
            execSync(`${this.conanExecutor} remote enable ${remote}`, options);
        }
        else {
            execSync(`${this.conanExecutor} remote disable ${remote}`, options);
        }
    }

    public override renameRemote(remoteName: string, newName: string): void {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        execSync(`${this.conanExecutor} remote rename ${remoteName} ${newName}`, options);
    }

    public override updateRemoteURL(remoteName: string, url: string): void {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        execSync(`${this.conanExecutor} remote update ${remoteName} --url ${url}`, options);
    }

    public override renameProfile(oldProfileName: string, newProfileName: string): void {
        // Get the absolute path to the selected profile
        let oldProfilePath = this.getProfileFilePath(oldProfileName);

        if (oldProfilePath) {
            fs.renameSync(oldProfilePath, path.join(this.getConanProfilesPath()!, newProfileName));
        }
        else {
            throw new Error(`Unable to locate profile ${oldProfileName}`);
        }
    }

    public override duplicateProfile(oldProfileName: string, newProfileName: string): void {
        let oldProfilePath = this.getProfileFilePath(oldProfileName);

        if (oldProfileName) {
            fs.copyFileSync(oldProfilePath!, path.join(this.getConanProfilesPath()!, newProfileName));
        }
        else {
            throw new Error(`Unable to duplicate profile ${oldProfileName}`);
        }
    }

    public override createNewProfile(profileName: string): void {
        let conanProfilesPath = this.getConanProfilesPath();

        if (conanProfilesPath === undefined) {
            throw new Error("Unable to locate Conan profiles folder.");
        }

        let emptyProfileContent = "[settings]\n[options]\n[build_requires]\n[env]\n";

        fs.writeFileSync(path.join(conanProfilesPath, profileName), emptyProfileContent);
    }

    public override getRecipeInformation(recipeName: string): string | undefined {
        throw new Error("Method not implemented.");
    }

    public override getDirtyPackage(recipeName: string): ConanPackage[] {
        throw new Error("Method not implemented.");
    }

    public override getEditablePackageRecipes(): ConanRecipe[] {
        // TODO: Implementation
        return [];
    }

    public override removeEditablePackageRecipe(recipe: string): void {
        throw new Error("Method not implemented.");
    }

    public override addEditablePackage(recipePath: string, name: string, user: string, channel: string, layout: string): void {
        throw new Error("Method not implemented.");
    }

    public override getRecipeAttribute(recipePath: string, attribute: string): string {
        throw new Error("Method not implemented.");
    }

    public override getRecipesByRemote(remote: string): ConanRecipe[] {
        // TODO: Implementation
        return [];
    }

    public override getFolderPathFromRecipe(recipe: string, folderOption: RecipeFolderOption): string {
        throw new Error("Method not implemented.");
    }

    public override getPackagesByRemote(recipe: string, remote: string): ConanPackage[] {
        throw new Error("Method not implemented.");
    }

    public override getPackageRevisions(recipe: string, packageId: string): Array<ConanPackageRevision> {
        let listOfPackageRevisions: Array<ConanPackageRevision> = [];

        try {
            if (recipe && packageId) {
                const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
                let jsonStdout = execSync(`${this.conanExecutor} list ${recipe}:${packageId}#* --format json`, options);
                let jsonObject = JSON.parse(jsonStdout.toString());

                let recipeRevisionSplit = recipe.split("#");

                let localCache = jsonObject["Local Cache"];

                let packageRevisionObjects = localCache[recipeRevisionSplit[0]]["revisions"][recipeRevisionSplit[1]]["packages"][packageId]["revisions"];

                for (let revisionId in packageRevisionObjects) {
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

    public override getPackageRevisionPath(recipe: string, packageId: string, revisionId: string): string | undefined {
        let packageRevisionPath: string | undefined = undefined;

        try {
            const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
            packageRevisionPath = execSync(`${this.conanExecutor} cache path ${recipe}:${packageId}#${revisionId}`, options).toString().trim();
        }
        catch (err) {
            console.log((err as Error).message);
        }

        return packageRevisionPath;
    }

    public removePackageRevision(recipe: string, packageId: string, revisionId: string): void {
        const options = { 'cwd': vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined };
        execSync(`${this.conanExecutor} remove ${recipe}:${packageId}#${revisionId} -c`, options);
    }
}
