import * as vscode from 'vscode';
import { ConanAPI } from '../../api/conan/conanAPI';
import { ConanRemoteItem, ConanRemoteNodeProvider } from '../../ui/treeview/conanRemoteProvider';
import * as utils from '../../utils'
import { ExtensionManager } from "../extensionManager";

export class ConanRemoteExplorerManager extends ExtensionManager {

    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private conanApi: ConanAPI;
    private nodeProviderConanRemote: ConanRemoteNodeProvider;
    private treeViewConanRemote: vscode.TreeView<any>;


    public constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel, conanApi: ConanAPI, nodeProviderConanRemote: ConanRemoteNodeProvider) {
        super();

        this.context = context;
        this.outputChannel = outputChannel;
        this.conanApi = conanApi;
        this.nodeProviderConanRemote = nodeProviderConanRemote;

        this.treeViewConanRemote = vscode.window.createTreeView("vsconan-explorer.treeview.remote", {
            treeDataProvider: this.nodeProviderConanRemote
        });

        this.registerCommand("vsconan.explorer.treeview.remote.refresh", () => this.refreshRemoteTreeview());
        this.registerCommand("vsconan.explorer.treeview.remote.edit", () => this.editRemote());
        this.registerCommand("vsconan.explorer.treeview.remote.add", () => this.addRemote());
        this.registerCommand("vsconan.explorer.treeview.remote.item.remove", (node: ConanRemoteItem) => this.removeRemote(node));
        this.registerCommand("vsconan.explorer.treeview.remote.item.enable", (node: ConanRemoteItem) => this.enableRemote(node));
        this.registerCommand("vsconan.explorer.treeview.remote.item.disable", (node: ConanRemoteItem) => this.disableRemote(node));
        this.registerCommand("vsconan.explorer.treeview.remote.item.rename", (node: ConanRemoteItem) => this.renameRemote(node));
        this.registerCommand("vsconan.explorer.treeview.remote.item.update-url", (node: ConanRemoteItem) => this.updateRemoteURL(node));
    }

    private refreshRemoteTreeview() {
        this.nodeProviderConanRemote.refresh();
    }

    private editRemote() {
        let python = utils.vsconan.config.getExplorerPython();

        let remoteFile = this.conanApi.getRemoteFilePath(python);

        if (remoteFile) {
            utils.editor.openFileInEditor(remoteFile);
        }
        else {
            vscode.window.showErrorMessage("Unable to find the file 'remotes.json'");
        }
    }

    private removeRemote(node: ConanRemoteItem) {
        this.nodeProviderConanRemote.refresh();
        let conanRemoteList = this.nodeProviderConanRemote.getChildrenString();

        if (conanRemoteList.includes(node.label)) {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the remote '${node.label}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        let python = utils.vsconan.config.getExplorerPython();

                        this.conanApi.removeRemote(node.label, python);

                        this.nodeProviderConanRemote.refresh();
                    }
                });
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the remote with name '${node.label}'.`);
        }
    }

    private async addRemote() {
        this.nodeProviderConanRemote.refresh();
        let conanRemoteList = this.nodeProviderConanRemote.getChildrenString();

        const remoteName = await vscode.window.showInputBox({
            title: "Add a new remote. Enter the name of the remote...",
            validateInput: text => {
                if (conanRemoteList.includes(text) && text !== "") {
                    return 'Remote with this name already exists.';
                }
                else if (text === "") {
                    return "Enter a name for the remote...";
                }
                else {
                    return null;
                }
            }
        });

        if (remoteName) {

            const remoteURL = await vscode.window.showInputBox({
                title: `Add a new remote. Enter the URL for remote '${remoteName}'...`,
                validateInput: text => {
                    if (text === "") {
                        return "Enter a url for the remote...";
                    }
                    else {
                        return null;
                    }
                }
            });

            if (remoteURL) {
                let python = utils.vsconan.config.getExplorerPython();

                try {
                    this.conanApi.addRemote(remoteName, remoteURL, python);

                    // Refresh the treeview once again
                    this.nodeProviderConanRemote.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
    }

    private enableRemote(node: ConanRemoteItem) {
        try {
            let python = utils.vsconan.config.getExplorerPython();

            this.conanApi.enableRemote(node.label, true, python);

            this.nodeProviderConanRemote.refresh();
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    private disableRemote(node: ConanRemoteItem) {
        try {
            let python = utils.vsconan.config.getExplorerPython();

            this.conanApi.enableRemote(node.label, false, python);

            this.nodeProviderConanRemote.refresh();
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    private async renameRemote(node: ConanRemoteItem) {
        let conanRemoteList = this.nodeProviderConanRemote.getChildrenString();

        if (conanRemoteList.includes(node.label)) {

            const newRemoteName = await vscode.window.showInputBox({
                title: `Renaming remote ${node.label}. Enter a new name for the remote...`,
                placeHolder: node.label,
                validateInput: text => {
                    if ((text === node.label || conanRemoteList.includes(text)) && text !== "") {
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

            if (newRemoteName) {
                let python = utils.vsconan.config.getExplorerPython();

                try {
                    this.conanApi.renameRemote(node.label, newRemoteName, python);
                    this.nodeProviderConanRemote.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the remote with name '${node.label}'.`);
        }
    }

    private async updateRemoteURL(node: ConanRemoteItem) {
        let conanRemoteList = this.nodeProviderConanRemote.getChildrenString();

        if (conanRemoteList.includes(node.label)) {

            let remoteDetailInfo = JSON.parse(node.detailInfo);

            const newURL = await vscode.window.showInputBox({
                title: `Update URL for remote ${node.label}. Enter a new URL for the remote...`,
                placeHolder: remoteDetailInfo.url,
                validateInput: text => {
                    if (text === remoteDetailInfo.url && text !== "") {
                        return 'Enter a differet URL';
                    }
                    else if (text === "") {
                        return "Enter a URL";
                    }
                    else {
                        return null;
                    }
                }
            });

            if (newURL) {
                let python = utils.vsconan.config.getExplorerPython();

                try {
                    this.conanApi.updateRemoteURL(node.label, newURL, python);
                    this.nodeProviderConanRemote.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the remote with name '${node.label}'.`);
        }
    }
}