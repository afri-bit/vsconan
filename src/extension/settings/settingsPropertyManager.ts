import * as vscode from "vscode";

import { existsSync } from "fs";
import { general, python } from "../../utils/utils";
import { ConanProfileConfiguration } from "./model";
import path = require("path");

/**
 * Class to manage the extension configuration
 * This class actually only abstracts the usage of VS Code configuration API
 */
export class SettingsPropertyManager {
    private context: vscode.ExtensionContext;

    // This variable is used to store the original path from the environment
    // If there is no environment variable defined the path will be an empty string.
    private envConanUserHome: string | undefined = undefined; // CONAN 1
    private envConanHome: string | undefined = undefined; // CONAN 2
    private outputChannel: vscode.OutputChannel | undefined = undefined;

    public constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
        this.context = context;
        this.outputChannel = outputChannel;
    }

    public setEnvConanUserHome(envConanUserHome: string | undefined) {
        this.envConanUserHome = envConanUserHome;
    }

    public getEnvConanUserHome(): string | undefined {
        return this.envConanUserHome;
    }

    public setEnvConanHome(envConanHome: string | undefined) {
        this.envConanHome = envConanHome;
    }

    public getEnvConanHome(): string | undefined {
        return this.envConanHome;
    }

    public showDirtyPackage(): boolean | undefined {
        return vscode.workspace.getConfiguration("vsconan").get("explorer.treeview.package.showDirtyPackage");
    }

    public isRecipeFiltered(): boolean {
        return this.context.workspaceState.get('recipe-filtered')!;
    }

    public setRecipeFilter(filterKey: string) {
        vscode.commands.executeCommand('setContext', 'recipe-filtered', true);
        this.context.workspaceState.update('recipe-filtered', true);
        this.context.workspaceState.update("recipe-filter-key", filterKey);
    }

    public clearRecipeFilter() {
        vscode.commands.executeCommand('setContext', 'recipe-filtered', false);
        this.context.workspaceState.update('recipe-filtered', false);
        this.context.workspaceState.update('recipe-filter-key', "");
    }

    public getRecipeFilterKey(): string | undefined {
        return this.context.workspaceState.get('recipe-filter-key');
    }

    public isPackageFiltered(): boolean {
        return this.context.workspaceState.get('package-filtered')!;
    }

    public setPackageFilter(filterKey: string) {
        vscode.commands.executeCommand('setContext', 'package-filtered', true);
        this.context.workspaceState.update('package-filtered', true);
        this.context.workspaceState.update("package-filter-key", filterKey);
    }

    public clearPackageFilter() {
        vscode.commands.executeCommand('setContext', 'package-filtered', false);
        this.context.workspaceState.update('package-filtered', false);
        this.context.workspaceState.update('package-filter-key', "");
    }

    public getPackageFilterKey(): string | undefined {
        return this.context.workspaceState.get('package-filter-key');
    }

    public getListOfConanProfiles(): Array<string> {
        let listOfConanProfile: Array<string> = [];

        // Get the object list with key value maps of the proxy objects
        let profileConfigurations = vscode.workspace.getConfiguration("vsconan.conan.profile").get("configurations");

        // Convert to generic objects
        let profileConfigurationsObjectList: Object = Object.assign({}, profileConfigurations);

        listOfConanProfile = Object.keys(profileConfigurationsObjectList);

        return listOfConanProfile;
    }

    public async getConanProfileObject(profileName: string): Promise<ConanProfileConfiguration | undefined> {

        let profileObject: ConanProfileConfiguration | undefined = undefined;

        let profileConfigurations = vscode.workspace.getConfiguration("vsconan.conan.profile").get("configurations");

        let profileConfigurationsObject: Object = Object.assign({}, profileConfigurations);

        if (profileConfigurationsObject.hasOwnProperty(profileName!)) {
            let selectedProfileObject: Object = Object.assign({}, profileConfigurationsObject[profileName as keyof typeof profileConfigurationsObject]);

            profileObject = general.plainObjectToClass(ConanProfileConfiguration, selectedProfileObject);
            profileObject.escapeWhitespace();
        }

        if (profileObject) {
            let pythonInterpreter = await python.getCurrentPythonInterpreter();
            if (pythonInterpreter !== undefined) {
                if (!profileObject.conanPythonInterpreter) {
                    profileObject.conanPythonInterpreter = pythonInterpreter;
                }
                if (!profileObject.conanExecutable) {
                    const conanExecutable = path.join(path.dirname(pythonInterpreter), "conan" + (process.platform === "win32" ? ".exe" : ""));
                    if (existsSync(conanExecutable)) {
                        profileObject.conanExecutable = conanExecutable;
                    }
                }
                this.outputChannel?.append(`Using Python interpreter: ${profileObject.conanPythonInterpreter}\n`);
                this.outputChannel?.append(`Using Conan executable: ${profileObject.conanExecutable}\n`);
            }
        }

        return profileObject;
    }

    public getSelectedConanProfile(): string | undefined {
        return vscode.workspace.getConfiguration("vsconan.conan.profile").get("default");
    }

    public async isProfileValid(profileName: string): Promise<boolean> {
        let valid: boolean = false;

        let profileObject: ConanProfileConfiguration | undefined = await this.getConanProfileObject(profileName);

        if ((profileObject) && (profileObject.isValid())) {
            valid = true;
        }

        return valid;
    }

    public async getConanVersionOfProfile(profileName: string): Promise<string | null> {

        let conanVersion: string | null = null;

        let profileObject: ConanProfileConfiguration | undefined = await this.getConanProfileObject(profileName);

        if ((profileObject) && (profileObject.isValid())) {
            conanVersion = profileObject.conanVersion;
        }

        return conanVersion;
    }

    public updateConanProfile(profileName: string | undefined) {
        vscode.workspace.getConfiguration("vsconan.conan.profile").update("default", profileName);
    }

    public isProfileAvailable(profileName: string): boolean {
        let isAvailable: boolean = false;

        let conanProfileList: Array<string> = this.getListOfConanProfiles();

        if (conanProfileList.includes(profileName)) {
            isAvailable = true;
        }

        return isAvailable;
    }
}
