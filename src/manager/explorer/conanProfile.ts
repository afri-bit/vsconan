import * as vscode from 'vscode';
import * as utils from '../../utils';
import { ConanAPI } from '../../api/conan/conanAPI';
import { ConanProfileItem, ConanProfileNodeProvider } from '../../ui/treeview/conanProfileProvider';
import {  ExtensionManager } from "../extensionManager";

export class ConanProfileExplorerManager extends ExtensionManager {

    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private conanApi: ConanAPI;
    private nodeProviderConanProfile: ConanProfileNodeProvider;
    private treeViewConanProfile: vscode.TreeView<any>;

    public constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel, conanApi: ConanAPI, nodeProviderConanProfile: ConanProfileNodeProvider) {
        super();
        this.context = context;
        this.outputChannel = outputChannel;
        this.conanApi = conanApi;
        this.nodeProviderConanProfile = nodeProviderConanProfile;

        this.treeViewConanProfile = vscode.window.createTreeView("vsconan-explorer.treeview.profile", {
            treeDataProvider: this.nodeProviderConanProfile
        });

        this.registerCommand("vsconan.explorer.treeview.profile.refresh", () => this.refreshProfileTreeview());
        this.registerCommand("vsconan.explorer.treeview.profile.add", () => this.addProfile());
        this.registerCommand("vsconan.explorer.treeview.profile.item.edit", (node: ConanProfileItem) => this.editProfile(node));
        this.registerCommand("vsconan.explorer.treeview.profile.item.remove", (node: ConanProfileItem) => this.removeProfile(node));
        this.registerCommand("vsconan.explorer.treeview.profile.item.open-explorer", (node: ConanProfileItem) => this.openProfileInExplorer(node));
        this.registerCommand("vsconan.explorer.treeview.profile.item.rename", (node: ConanProfileItem) => this.renameProfile(node));
        this.registerCommand("vsconan.explorer.treeview.profile.item.duplicate", (node: ConanProfileItem) => this.duplicateProfile(node));
    }

    private refreshProfileTreeview() {
        this.nodeProviderConanProfile.refresh();
    }

    private editProfile(node: ConanProfileItem) {
        this.nodeProviderConanProfile.refresh();
        let conanProfileList = this.nodeProviderConanProfile.getChildrenString();

        if (conanProfileList.includes(node.label)) {
            let python = utils.vsconan.config.getExplorerPython();
            utils.editor.openFileInEditor(this.conanApi.getProfileFilePath(node.label, python)!);
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    }

    private removeProfile(node: ConanProfileItem) {
        this.nodeProviderConanProfile.refresh();
        let conanProfileList = this.nodeProviderConanProfile.getChildrenString();

        if (conanProfileList.includes(node.label)) {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the profile '${node.label}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        let python = utils.vsconan.config.getExplorerPython();

                        this.conanApi.removeProfile(node.label, python);

                        this.nodeProviderConanProfile.refresh();
                    }
                });
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    }

    private openProfileInExplorer(node: ConanProfileItem) {
        this.nodeProviderConanProfile.refresh();
        let conanProfileList = this.nodeProviderConanProfile.getChildrenString();

        if (conanProfileList.includes(node.label)) {

            let python = utils.vsconan.config.getExplorerPython();

            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.conanApi.getProfileFilePath(node.label, python)!));
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    }

    private async renameProfile(node: ConanProfileItem) {
        this.nodeProviderConanProfile.refresh();
        let conanProfileList = this.nodeProviderConanProfile.getChildrenString();

        if (conanProfileList.includes(node.label)) {

            const newProfileName = await vscode.window.showInputBox({
                title: `Renaming profile ${node.label}. Enter a new name for the profile...`,
                placeHolder: node.label,
                validateInput: text => {
                    if ((text === node.label || conanProfileList.includes(text)) && text !== "") {
                        return 'Enter a different name';
                    }
                    else if (text === "") {
                        return "Enter a new name";
                    }
                    else {
                        return null;
                    }
                }
            });

            if (newProfileName) {
                let python = utils.vsconan.config.getExplorerPython();

                try {
                    this.conanApi.renameProfile(node.label, newProfileName, python);
                    this.nodeProviderConanProfile.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    }

    private async duplicateProfile(node: ConanProfileItem) {
        this.nodeProviderConanProfile.refresh();
        let conanProfileList = this.nodeProviderConanProfile.getChildrenString();

        if (conanProfileList.includes(node.label)) {

            const newProfileName = await vscode.window.showInputBox({
                title: `Duplicating profile ${node.label}. Enter a new name for the profile...`,
                placeHolder: node.label,
                validateInput: text => {
                    if ((text === node.label || conanProfileList.includes(text)) && text !== "") {
                        return 'Enter a different name';
                    }
                    else if (text === "") {
                        return "Enter a new name";
                    }
                    else {
                        return null;
                    }
                }
            });

            if (newProfileName) {
                let python = utils.vsconan.config.getExplorerPython();

                try {
                    this.conanApi.duplicateProfile(node.label, newProfileName, python);

                    // Refresh the treeview once again
                    this.nodeProviderConanProfile.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    }

    private async addProfile() {
        this.nodeProviderConanProfile.refresh();
        let conanProfileList = this.nodeProviderConanProfile.getChildrenString();

        const profileName = await vscode.window.showInputBox({
            title: "Create a new Profile. Enter the name of the profile...",
            validateInput: text => {
                if (conanProfileList.includes(text) && text !== "") {
                    return 'Profile with this name already exists.';
                }
                else if (text === "") {
                    return "Enter a name for the profile...";
                }
                else {
                    return null;
                }
            }
        });

        if (profileName) {
            let python = utils.vsconan.config.getExplorerPython();

            try {
                this.conanApi.createNewProfile(profileName, python);

                // Refresh the treeview once again
                this.nodeProviderConanProfile.refresh();
            }
            catch (err) {
                vscode.window.showErrorMessage((err as Error).message);
            }
        }
    }
}