import * as vscode from "vscode";

import { ConanProfileConfiguration } from "./model";
import { plainToInstance } from "class-transformer";


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

    public constructor(context: vscode.ExtensionContext) {
        this.context = context;
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
        let listOfConanProfile: Array<string> = []

        // Get the object list with key value maps of the proxy objects
        let profileConfigurations = vscode.workspace.getConfiguration("vsconan.conan.profile").get("configurations");

        // Convert to generic objects
        let profileConfigurationsObjectList: Object = Object.assign({}, profileConfigurations);

        listOfConanProfile = Object.keys(profileConfigurationsObjectList);

        return listOfConanProfile;
    }

    public getConanProfileObject(profileName: string): ConanProfileConfiguration | undefined {

        let profileObject: ConanProfileConfiguration | undefined = undefined
        
        let profileConfigurations = vscode.workspace.getConfiguration("vsconan.conan.profile").get("configurations");

        let profileConfigurationsObject: Object = Object.assign({}, profileConfigurations);

        if (profileConfigurationsObject.hasOwnProperty(profileName!)) {
            let selectedProfileObject: Object = Object.assign({}, profileConfigurationsObject[profileName as keyof typeof profileConfigurationsObject]);
            
            profileObject = plainToInstance(ConanProfileConfiguration, selectedProfileObject);
        }

        return profileObject;
    }

    public getSelectedConanProfile(): string | undefined {
         return vscode.workspace.getConfiguration("vsconan.conan.profile").get("default");
    }

    public isProfileValid(profileName: string): boolean {
        let valid: boolean = false;

        let profileObject: ConanProfileConfiguration | undefined = this.getConanProfileObject(profileName);

        if ((profileObject) && (profileObject.isValid())) {
            valid = true;
        }

        return valid;
    }

    public getConanVersionOfProfile(profileName: string): string | null {

        let conanVersion: string | null = null;

        let profileObject: ConanProfileConfiguration | undefined = this.getConanProfileObject(profileName);

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