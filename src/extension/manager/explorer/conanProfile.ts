import * as vscode from 'vscode';
import { ConanAPIManager } from '../../../conans/api/conanAPIManager';
import * as utils from '../../../utils/utils';
import { ConanProfileItem, ConanProfileNodeProvider } from '../../ui/treeview/conanProfileProvider';
import { ExtensionManager } from "../extensionManager";

/**
 * Class to manage the treeview explorer of conan profiles
 */
export class ConanProfileExplorerManager extends ExtensionManager {

    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private conanApiManager: ConanAPIManager;
    private nodeProviderConanProfile: ConanProfileNodeProvider;
    private treeViewConanProfile: vscode.TreeView<any>;

    /**
     * Create conan profile explorer manager
     * @param context The context of the extension
     * @param outputChannel Output channel of the extension
     * @param conanApi Conan API
     * @param nodeProviderConanProfile Treedata provider for conan profile
     */
    public constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel, conanApiManager: ConanAPIManager, nodeProviderConanProfile: ConanProfileNodeProvider) {
        super();
        this.context = context;
        this.outputChannel = outputChannel;
        this.conanApiManager = conanApiManager;
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

    /**
     * Refresh conan profile treeview
     */
    private refreshProfileTreeview() {
        this.nodeProviderConanProfile.refresh();
    }

    /**
     * Edit selected profile in VSCode, open this as file to be edited
     * @param node Selected conan profile node item
     */
    private editProfile(node: ConanProfileItem) {
        // Get the list of the profile from the treeview in string format
        let conanProfileList = this.nodeProviderConanProfile.getChildrenString();

        if (conanProfileList.includes(node.label)) {
            utils.editor.openFileInEditor(this.conanApiManager.conanApi.getProfileFilePath(node.label)!);
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    }

    /**
     * Remove conan profile
     * @param node Selected conan profile node item
     */
    private removeProfile(node: ConanProfileItem) {
        let conanProfileList = this.nodeProviderConanProfile.getChildrenString();

        // Check if the profile still exists in the treeview, since the refresh progress needs to be done manually.
        if (conanProfileList.includes(node.label)) {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the profile '${node.label}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        this.conanApiManager.conanApi.removeProfile(node.label);

                        this.nodeProviderConanProfile.refresh();
                    }
                });
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    }

    /**
     * Open profile in the file explorer
     * @param node Selected conan profile node item
     */
    private openProfileInExplorer(node: ConanProfileItem) {
        let conanProfileList = this.nodeProviderConanProfile.getChildrenString();

        if (conanProfileList.includes(node.label)) {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.conanApiManager.conanApi.getProfileFilePath(node.label)!));
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    }

    /**
     * Rename selected profile
     * @param node Selected conan profile node item
     */
    private async renameProfile(node: ConanProfileItem) {
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
                try {
                    this.conanApiManager.conanApi.renameProfile(node.label, newProfileName);
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

    /**
     * Duplicate selected profile
     * @param node Selected conan profile node item
     */
    private async duplicateProfile(node: ConanProfileItem) {
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
                try {
                    this.conanApiManager.conanApi.duplicateProfile(node.label, newProfileName);

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

    /**
     * Callback method to add a new profile
     */
    private async addProfile() {
        this.refreshProfileTreeview();
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
            try {
                this.conanApiManager.conanApi.createNewProfile(profileName);

                // Refresh the treeview once again
                this.nodeProviderConanProfile.refresh();
            }
            catch (err) {
                vscode.window.showErrorMessage((err as Error).message);
            }
        }
    }
}