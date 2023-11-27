import { execSync } from "child_process";
import { ConanAPI, ConanExecutionMode } from "../../api/base/conanAPI";
import { RecipeFolderOption } from "../../conan/api/conanAPI";
import { ConanPackage } from "../../model/conanPackage";
import { ConanRecipe } from "../../model/conanRecipe";
import { ConanRemote } from "../../model/conanRemote";
import path = require("path");


export class Conan2API extends ConanAPI {
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
        throw new Error("Method not implemented.");
    }

    public override getPackagePath(recipe: string, packageId: string): string | undefined {
        throw new Error("Method not implemented.");
    }

    public override getRecipes(): ConanRecipe[] {
        throw new Error("Method not implemented.");
    }

    public override getProfiles(): string[] {

        try {
            let stdout = execSync(`${this.conanExecutor} profile list --format json`);
            let jsonObject = JSON.parse(stdout.toString());
            return jsonObject;
        }
        catch (err) {
            console.log((err as Error).message);
            return [];
        }
    }

    public override getPackages(recipe: string): ConanPackage[] {
        throw new Error("Method not implemented.");
    }

    public override getRemoteFilePath(): string | undefined {
        throw new Error("Method not implemented.");
    }

    public override getRemotes(): ConanRemote[] {
        throw new Error("Method not implemented.");
    }

    public override removePackage(recipe: string, packageId: string): void {
        throw new Error("Method not implemented.");
    }

    public override removeRecipe(recipe: string): void {
        throw new Error("Method not implemented.");
    }

    public override removeProfile(profile: string): void {
        throw new Error("Method not implemented.");
    }

    public override addRemote(remote: string, url: string): void {
        throw new Error("Method not implemented.");
    }

    public override removeRemote(remote: string): void {
        throw new Error("Method not implemented.");
    }

    public override enableRemote(remote: string, enable: boolean): void {
        throw new Error("Method not implemented.");
    }

    public override renameRemote(remoteName: string, newName: string): void {
        throw new Error("Method not implemented.");
    }

    public override updateRemoteURL(remoteName: string, url: string): void {
        throw new Error("Method not implemented.");
    }

    public override renameProfile(oldProfileName: string, newProfileName: string): void {
        throw new Error("Method not implemented.");
    }

    public override duplicateProfile(oldProfileName: string, newProfileName: string): void {
        throw new Error("Method not implemented.");
    }

    public override createNewProfile(profileName: string): void {
        throw new Error("Method not implemented.");
    }

    public override getRecipeInformation(recipeName: string): string | undefined {
        throw new Error("Method not implemented.");
    }

    public override getDirtyPackage(recipeName: string): ConanPackage[] {
        throw new Error("Method not implemented.");
    }

    public override getEditablePackageRecipes(): ConanRecipe[] {
        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
    }

    public override getFolderPathFromRecipe(recipe: string, folderOption: RecipeFolderOption): string {
        throw new Error("Method not implemented.");
    }

    public override getPackagesByRemote(recipe: string, remote: string): ConanPackage[] {
        throw new Error("Method not implemented.");
    }

}