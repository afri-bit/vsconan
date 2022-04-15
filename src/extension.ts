import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as utils from "./utils";
import * as globals from "./globals";

import { CommandExecutor } from "./command/commandExecutor";
import { ConfigWorkspace } from "./config/configWorkspace";
import { ConanPackageItem, ConanPackageNodeProvider } from "./ui/treeview/conanPackageProvider";
import { ConanProfileItem, ConanProfileNodeProvider } from "./ui/treeview/conanProfileProvider";
import { ConanRecipeItem, ConanRecipeNodeProvider } from "./ui/treeview/conanRecipeProvider";
import { ConanRemoteItem, ConanRemoteNodeProvider } from "./ui/treeview/conanRemoteProvider";
import { ConanAPI } from "./api/conan/conanAPI";
import { CommandManager } from "./manager/commandManager";
import { ConanCacheExplorerManager } from "./manager/explorer/conanCache";

enum ConanCommand {
    create,
    install,
    build,
    source,
    package,
    packageExport
}

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    // Create VSConan extension channel
    // This channel is to show the command line outputs specifically for this extension
    var channelVSConan = vscode.window.createOutputChannel("VSConan");

    // ----- Global Area Initialization -----
    // Global Area - The global area is stored under home folder ($HOME/.vsconan)
    //               This area has lower priority then the workspace area
    // Global Area - To work for the API a extension folder will created in the home directory
    utils.vsconan.initializeGlobalArea();

    // Initializing the Conan API
    let conanApi = new ConanAPI();

    // ========== Registering the treeview for the extension
    const conanRecipeNodeProvider = new ConanRecipeNodeProvider(conanApi);
    // let treeViewConanRecipe = vscode.window.createTreeView('vsconan-explorer.treeview.recipe', {
    //     treeDataProvider: conanRecipeNodeProvider
    // });

    const conanProfileNodeProvider = new ConanProfileNodeProvider(conanApi);
    // let treeViewConanProfile = vscode.window.createTreeView('vsconan-explorer.treeview.profile', {
    //     treeDataProvider: conanProfileNodeProvider
    // });

    const conanPackageNodeProvider = new ConanPackageNodeProvider(conanApi);
    // let treeViewConanPackage = vscode.window.createTreeView('vsconan-explorer.treeview.package', {
    //     treeDataProvider: conanPackageNodeProvider
    // });

    const conanRemoteNodeProvider = new ConanRemoteNodeProvider(conanApi);
    // let treeViewConanRemote = vscode.window.createTreeView('vsconan-explorer.treeview.remote', {
    //     treeDataProvider: conanRemoteNodeProvider
    // });

    const conanCacheExplorerManager = new ConanCacheExplorerManager (
        context,
        channelVSConan,
        conanApi,
        conanRecipeNodeProvider,
        conanPackageNodeProvider
    )

    // Check if it starts with workspace
    // To check whether its workspace or not is to determine if the function "getWorkspaceFolder" returns undefined or a path
    // If user only open anyfile without a folder (as editor) this the workspace path will return "undefined"
    // This condition will be entered if vs code used as a workspace
    let wsList = vscode.workspace.workspaceFolders;

    // If it starts with workspace, there should be at least one element in the array of workspace folder
    if (wsList !== undefined) {

        for (let i = 0; i < wsList.length; i++) {

            let wsPath = wsList[i].uri.fsPath;
            let configPath = path.join(wsPath, globals.constant.VSCONAN_FOLDER, globals.constant.CONFIG_FILE);

            if (utils.conan.isFolderConanProject(wsPath) && !fs.existsSync(configPath!)) {

                vscode.window
                    .showInformationMessage(`The workspace '${wsList[i].name}' is detected as a conan project. Do you want to configure this workspace?`, ...["Yes", "Not Now"])
                    .then((answer) => {
                        if (answer === "Yes") {

                            // .vsconan path in the workspace
                            let vsconanPath = path.join(wsPath, globals.constant.VSCONAN_FOLDER);
                            if (!fs.existsSync(vsconanPath)) {
                                fs.mkdirSync(vsconanPath!);
                            }

                            // Create a default config file
                            utils.vsconan.config.createInitialWorkspaceConfig(vsconanPath);
                        }
                    });
            }
        }
    }

    // ========== Extension Commands Registration Section 
    // ========== Conan Workflow Command Registration
    let commandConanCreate = vscode.commands.registerCommand("vsconan.conan.create", () => {
        executeConanCommand(ConanCommand.create, channelVSConan);
    });

    let commandConanInstall = vscode.commands.registerCommand("vsconan.conan.install", (cmd) => {
        executeConanCommand(ConanCommand.install, channelVSConan);
    });

    let commandConanBuild = vscode.commands.registerCommand("vsconan.conan.build", () => {
        executeConanCommand(ConanCommand.build, channelVSConan);
    });

    let commandConanSource = vscode.commands.registerCommand("vsconan.conan.source", () => {
        executeConanCommand(ConanCommand.source, channelVSConan);
    });

    let commandConanPackage = vscode.commands.registerCommand("vsconan.conan.package", () => {
        executeConanCommand(ConanCommand.package, channelVSConan);
    });

    let commandConanExportPackage = vscode.commands.registerCommand("vsconan.conan.package.export", () => {
        executeConanCommand(ConanCommand.packageExport, channelVSConan);
    });

    // ========== Global Configuration Command Registration
    let commandConfigGlobalCreate = vscode.commands.registerCommand("vsconan.config.global.create", () => {
        if (!fs.existsSync(utils.vsconan.getGlobalConfigPath())) {
            // Initial the global area even it just needs to create the configuration file
            utils.vsconan.initializeGlobalArea();
            vscode.window.showInformationMessage("Global configuration file has been created.");

            // Opening the file after being created
            utils.editor.openFileInEditor(utils.vsconan.getGlobalConfigPath());
        }
        else {
            vscode.window.showInformationMessage("Global configuration file already exists.");
        }
    });

    let commandConfigGlobalOpen = vscode.commands.registerCommand("vsconan.config.global.open", () => {
        if (fs.existsSync(utils.vsconan.getGlobalConfigPath())) {
            utils.editor.openFileInEditor(utils.vsconan.getGlobalConfigPath());
        }
        else {
            vscode.window.showErrorMessage("Unable to find the GLOBAL config file.");
        }
    });

    // ========== Workspace Configuration Command Registration
    let commandConfigWorkspaceCreate = vscode.commands.registerCommand("vsconan.config.workspace.create", () => {
        let ws = utils.workspace.selectWorkspace();

        ws.then(result => {
            let vsconanPath = path.join(String(result), globals.constant.VSCONAN_FOLDER);
            if (!fs.existsSync(vsconanPath)) {
                fs.mkdirSync(vsconanPath);
            }

            let configFilePath = path.join(vsconanPath, globals.constant.CONFIG_FILE);
            if (fs.existsSync(configFilePath)) {
                vscode.window.showInformationMessage("Config file already exists in the workspace.");
            }
            else {
                utils.vsconan.config.createInitialWorkspaceConfig(vsconanPath);

                // Open configuration file after being created
                utils.editor.openFileInEditor(configFilePath);
            }
        }).catch(reject => {
            vscode.window.showInformationMessage("Cannot create config file. No workspace detected.");
        });
    });

    let commandConfigWorkspaceOpen = vscode.commands.registerCommand("vsconan.config.workspace.open", () => {
        let ws = utils.workspace.selectWorkspace();

        ws.then(async result => {
            if ((result !== undefined) && (result !== "")) {
                utils.editor.openFileInEditor(path.join(result!, globals.constant.VSCONAN_FOLDER, globals.constant.CONFIG_FILE));
            }
            else {
                vscode.window.showErrorMessage("Unable to find the config file.");
            }
        });
    });

    // ========== Treeview RECIPE Command Registration
    // // Command on selecting a recipe. This will show list of the package binary
    // let commandRecipeRefresh = vscode.commands.registerCommand("vsconan-explorer.treeview.recipe.refresh", () => {
    //     conanRecipeNodeProvider.refresh();

    //     // Refreshing the recipe tree explorer will reset the recipe tree explorer and package tree explorer
    //     conanRecipeNodeProvider.setSelectedRecipe(undefined); // Reset the internal selected recipe from the recipeNodeProvider
    //     conanPackageNodeProvider.refresh(""); // Empty the binary package tree explorer
    //     treeViewConanPackage.title = "Conan - Package"; // Reset the title of the treeview
    // });

    // let commandRecipeSelected = vscode.commands.registerCommand("vsconan-explorer.item.recipe.selected", () => {
    //     conanRecipeNodeProvider.setSelectedRecipe(treeViewConanRecipe.selection[0].label);

    //     // Change the title of the treeview for package explorer to match the selected recipe
    //     treeViewConanPackage.title = treeViewConanRecipe.selection[0].label;
    //     conanPackageNodeProvider.refresh(treeViewConanRecipe.selection[0].label);
    // });

    // let commandRecipeInformation = vscode.commands.registerCommand("vsconan-explorer.item.recipe.option.information", (node: ConanRecipeItem) => {
    //     let python = utils.vsconan.config.getExplorerPython();

    //     try {
    //         let recipeInfo = conanApi.getRecipeInformation(node.label, python);

    //         // Create a web view panel
    //         const panel = vscode.window.createWebviewPanel(
    //             node.label,
    //             node.label,
    //             vscode.ViewColumn.One,
    //             {}
    //         );

    //         panel.webview.html = utils.vsconan.getWebviewContent(recipeInfo!);
    //     }
    //     catch (err) {
    //         vscode.window.showErrorMessage((err as Error).message);
    //     }
    // });

    // let commandRecipeOpenFolder = vscode.commands.registerCommand("vsconan-explorer.item.recipe.option.open.explorer", (node: ConanRecipeItem) => {
    //     let python = utils.vsconan.config.getExplorerPython();

    //     try {
    //         vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(conanApi.getRecipePath(node.label, python)!));
    //     }
    //     catch (err) {
    //         vscode.window.showErrorMessage((err as Error).message);
    //     }
    // });

    // let commandRecipeOpenVSCode = vscode.commands.registerCommand("vsconan-explorer.item.recipe.option.open.vscode", (node: ConanRecipeItem) => {
    //     let python = utils.vsconan.config.getExplorerPython();

    //     if (python) {
    //         try {
    //             let packagePath = conanApi.getRecipePath(node.label, python);
    //             vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(packagePath!), true);
    //         }
    //         catch (err) {
    //             vscode.window.showErrorMessage((err as Error).message);
    //         }
    //     }
    //     else {
    //         vscode.window.showErrorMessage("Python Interpreter not defined.");
    //     }
    // });

    // let commandRecipeRemove = vscode.commands.registerCommand("vsconan-explorer.item.recipe.option.remove", (node: ConanRecipeItem) => {
    //     try {
    //         vscode.window
    //             .showWarningMessage(`Are you sure you want to remove the recipe '${node.label}'?`, ...["Yes", "No"])
    //             .then((answer) => {
    //                 if (answer === "Yes") {
    //                     let python = utils.vsconan.config.getExplorerPython();

    //                     conanApi.removeRecipe(node.label, python);
    //                     conanRecipeNodeProvider.refresh();

    //                     conanPackageNodeProvider.refresh(""); // Empty the binary package treeview
    //                     treeViewConanPackage.title = "Conan - Package"; // Reset the title of the binary package treeview panel
    //                 }
    //             });
    //     }
    //     catch (err) {
    //         vscode.window.showErrorMessage((err as Error).message);
    //     }
    // });

    // ========== Treeview PACKAGE Command Registration
    // let commandPackageRefresh = vscode.commands.registerCommand("vsconan-explorer.treeview.package.refresh", () => {
    //     conanPackageNodeProvider.refresh(conanRecipeNodeProvider.getSelectedRecipe());
    // });

    // let commandPackageInformation = vscode.commands.registerCommand("vsconan-explorer.item.package.option.information", (packageNode: ConanPackageItem) => {
    //     // TODO: Show information from the selected recipe
    // });

    // let commandPackageOpenFolder = vscode.commands.registerCommand("vsconan-explorer.item.package.option.open.explorer", (node: ConanPackageItem) => {
    //     let python = utils.vsconan.config.getExplorerPython();

    //     try {
    //         vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(conanApi.getPackagePath(conanRecipeNodeProvider.getSelectedRecipe(), node.label, python)!));
    //     }
    //     catch (err) {
    //         vscode.window.showErrorMessage((err as Error).message);
    //     }
    // });

    // let commandPackageOpenVSCode = vscode.commands.registerCommand("vsconan-explorer.item.package.option.open.vscode", (node: ConanPackageItem) => {
    //     let python = utils.vsconan.config.getExplorerPython();

    //     if (python !== undefined) {
    //         try {
    //             let packagePath = conanApi.getPackagePath(conanRecipeNodeProvider.getSelectedRecipe(), node.label, python);
    //             vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(packagePath!), true);
    //         }
    //         catch (err) {
    //             vscode.window.showErrorMessage((err as Error).message);
    //         }
    //     }
    //     else {
    //         vscode.window.showErrorMessage("Python Interpreter not defined.");
    //     }
    // });

    // let commandPackageRemove = vscode.commands.registerCommand("vsconan-explorer.item.package.option.remove", (node: ConanPackageItem) => {
    //     try {
    //         vscode.window
    //             .showWarningMessage(`Are you sure you want to remove the binary package '${node.label}' from '${treeViewConanPackage.title!}'?`, ...["Yes", "No"])
    //             .then((answer) => {
    //                 if (answer === "Yes") {
    //                     let python = utils.vsconan.config.getExplorerPython();

    //                     conanApi.removePackage(conanRecipeNodeProvider.getSelectedRecipe(), node.label, python);

    //                     conanPackageNodeProvider.refresh(treeViewConanRecipe.selection[0].label);
    //                 }
    //             });
    //     }
    //     catch (err) {
    //         vscode.window.showErrorMessage((err as Error).message);
    //     }
    // });

    // ========== Treeview PROFILE Command Registration
    let commandProfileRefresh = vscode.commands.registerCommand("vsconan-explorer.treeview.profile.refresh", () => {
        conanProfileNodeProvider.refresh();
    });

    let commandProfileEdit = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.edit", (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

        if (conanProfileList.includes(node.label)) {
            let python = utils.vsconan.config.getExplorerPython();
            utils.editor.openFileInEditor(conanApi.getProfileFilePath(node.label, python)!);
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    });

    let commandProfileRemove = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.remove", (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

        if (conanProfileList.includes(node.label)) {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the profile '${node.label}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        let python = utils.vsconan.config.getExplorerPython();

                        conanApi.removeProfile(node.label, python);

                        conanProfileNodeProvider.refresh();
                    }
                });
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    });

    let commandProfileOpenExplorer = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.open.explorer", (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

        if (conanProfileList.includes(node.label)) {

            let python = utils.vsconan.config.getExplorerPython();

            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(conanApi.getProfileFilePath(node.label, python)!));
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    });

    let commandProfileRename = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.rename", async (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

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
                    conanApi.renameProfile(node.label, newProfileName, python);
                    conanProfileNodeProvider.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    });

    let commandProfileDuplicate = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.duplicate", async (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

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
                    conanApi.duplicateProfile(node.label, newProfileName, python);

                    // Refresh the treeview once again
                    conanProfileNodeProvider.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`);
        }
    });

    let commandProfileAdd = vscode.commands.registerCommand("vsconan-explorer.treeview.profile.add", async () => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

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
                conanApi.createNewProfile(profileName, python);

                // Refresh the treeview once again
                conanProfileNodeProvider.refresh();
            }
            catch (err) {
                vscode.window.showErrorMessage((err as Error).message);
            }
        }
    });

    // ========== Treeview REMOTE Command Registration
    let commandRemoteRefresh = vscode.commands.registerCommand("vsconan-explorer.treeview.remote.refresh", () => {
        conanRemoteNodeProvider.refresh();
    });

    let commandRemoteEdit = vscode.commands.registerCommand("vsconan-explorer.treeview.remote.edit", () => {
        let python = utils.vsconan.config.getExplorerPython();

        let remoteFile = conanApi.getRemoteFilePath(python);

        if (remoteFile) {
            utils.editor.openFileInEditor(remoteFile);
        }
        else {
            vscode.window.showErrorMessage("Unable to find the file 'remotes.json'");
        }
    });

    let commandRemoteRemove = vscode.commands.registerCommand("vsconan-explorer.item.remote.option.remove", (node: ConanRemoteItem) => {
        conanRemoteNodeProvider.refresh();
        let conanRemoteList = conanRemoteNodeProvider.getChildrenString();

        if (conanRemoteList.includes(node.label)) {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the remote '${node.label}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        let python = utils.vsconan.config.getExplorerPython();

                        conanApi.removeRemote(node.label, python);

                        conanRemoteNodeProvider.refresh();
                    }
                });
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the remote with name '${node.label}'.`);
        }
    });

    let commandRemoteAdd = vscode.commands.registerCommand("vsconan-explorer.treeview.remote.add", async () => {
        conanRemoteNodeProvider.refresh();
        let conanRemoteList = conanRemoteNodeProvider.getChildrenString();

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
                    conanApi.addRemote(remoteName, remoteURL, python);

                    // Refresh the treeview once again
                    conanRemoteNodeProvider.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
    });

    let commandRemoteEnable = vscode.commands.registerCommand("vsconan-explorer.item.remote.option.enable", (node: ConanRemoteItem) => {
        try {
            let python = utils.vsconan.config.getExplorerPython();

            conanApi.enableRemote(node.label, true, python);

            conanRemoteNodeProvider.refresh();
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    });

    let commandRemoteDisable = vscode.commands.registerCommand("vsconan-explorer.item.remote.option.disable", (node: ConanRemoteItem) => {
        try {
            let python = utils.vsconan.config.getExplorerPython();

            conanApi.enableRemote(node.label, false, python);

            conanRemoteNodeProvider.refresh();
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    });

    let commandRemoteRename = vscode.commands.registerCommand("vsconan-explorer.item.remote.option.rename", async (node: ConanRemoteItem) => {
        let conanRemoteList = conanRemoteNodeProvider.getChildrenString();

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
                    conanApi.renameRemote(node.label, newRemoteName, python);
                    conanRemoteNodeProvider.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the remote with name '${node.label}'.`);
        }
    });

    let commandRemoteUpdateURL = vscode.commands.registerCommand("vsconan-explorer.item.remote.option.update-url", async (node: ConanRemoteItem) => {
        let conanRemoteList = conanRemoteNodeProvider.getChildrenString();

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
                    conanApi.updateRemoteURL(node.label, newURL, python);
                    conanRemoteNodeProvider.refresh();
                }
                catch (err) {
                    vscode.window.showErrorMessage((err as Error).message);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the remote with name '${node.label}'.`);
        }
    });

    context.subscriptions.push(commandConanCreate);
    context.subscriptions.push(commandConanInstall);
    context.subscriptions.push(commandConanBuild);
    context.subscriptions.push(commandConanSource);
    context.subscriptions.push(commandConanPackage);
    context.subscriptions.push(commandConanExportPackage);
    context.subscriptions.push(commandConfigGlobalCreate);
    context.subscriptions.push(commandConfigGlobalOpen);
    context.subscriptions.push(commandConfigWorkspaceCreate);
    context.subscriptions.push(commandConfigWorkspaceOpen);

    context.subscriptions.push(conanCacheExplorerManager);

    // // Recipe
    // context.subscriptions.push(commandRecipeRefresh);
    // context.subscriptions.push(commandRecipeSelected);
    // context.subscriptions.push(commandRecipeInformation);
    // context.subscriptions.push(commandRecipeOpenFolder);
    // context.subscriptions.push(commandRecipeOpenVSCode);
    // context.subscriptions.push(commandRecipeRemove);

    // // Package
    // context.subscriptions.push(commandPackageRefresh);
    // context.subscriptions.push(commandPackageInformation);
    // context.subscriptions.push(commandPackageOpenFolder);
    // context.subscriptions.push(commandPackageOpenVSCode);
    // context.subscriptions.push(commandPackageRemove);

    // Profile
    context.subscriptions.push(commandProfileRefresh);
    context.subscriptions.push(commandProfileEdit);
    context.subscriptions.push(commandProfileRemove);
    context.subscriptions.push(commandProfileDuplicate);
    context.subscriptions.push(commandProfileAdd);
    context.subscriptions.push(commandProfileRename);
    context.subscriptions.push(commandProfileOpenExplorer);

    // Remote
    context.subscriptions.push(commandRemoteRefresh);
    context.subscriptions.push(commandRemoteRemove);
    context.subscriptions.push(commandRemoteAdd);
    context.subscriptions.push(commandRemoteEdit);
    context.subscriptions.push(commandRemoteEnable);
    context.subscriptions.push(commandRemoteDisable);
    context.subscriptions.push(commandRemoteRename);
    context.subscriptions.push(commandRemoteUpdateURL);
}

// this method is called when your extension is deactivated
export function deactivate() { }

/**
 * Function to execute the selected Conan command
 * Since the flow of conan commands is similar, the flow of execution will be grouped within this function
 * Which command needs to be executed is determined using ENUM ConanCommand
 * 
 * @param cmdType Enumeration type to determine which command to be executed
 * @param channelVSConan VS Code channel to print the output of command
 * @returns <void>
 */
function executeConanCommand(cmdType: ConanCommand, channelVSConan: any): void {
    // The flow of following commands is the same by selecting the workspace first
    // Check the configuration and executed pre selected command based on this function argument
    let ws = utils.workspace.selectWorkspace();

    ws.then(wsPath => {

        let configPath = path.join(wsPath!, globals.constant.VSCONAN_FOLDER, globals.constant.CONFIG_FILE);

        if (fs.existsSync(configPath)) {
            let configWorkspace = new ConfigWorkspace();
            let configText = fs.readFileSync(configPath, 'utf8');
            configWorkspace = JSON.parse(configText);
            switch (+cmdType) {
                case ConanCommand.create: {
                    CommandExecutor.executeCommandConanCreate(wsPath!, configWorkspace.python, configWorkspace.commandContainer.create, channelVSConan);
                    break;
                }
                case ConanCommand.install: {
                    CommandExecutor.executeCommandConanInstall(wsPath!, configWorkspace.python, configWorkspace.commandContainer.install, channelVSConan);
                    break;
                }
                case ConanCommand.build: {
                    CommandExecutor.executeCommandConanBuild(wsPath!, configWorkspace.python, configWorkspace.commandContainer.build, channelVSConan);
                    break;
                }
                case ConanCommand.source: {
                    CommandExecutor.executeCommandConanSource(wsPath!, configWorkspace.python, configWorkspace.commandContainer.source, channelVSConan);
                    break;
                }
                case ConanCommand.package: {
                    CommandExecutor.executeCommandConanPackage(wsPath!, configWorkspace.python, configWorkspace.commandContainer.pkg, channelVSConan);
                    break;
                }
                case ConanCommand.packageExport: {
                    CommandExecutor.executeCommandConanPackageExport(wsPath!, configWorkspace.python, configWorkspace.commandContainer.pkgExport, channelVSConan);
                    break;
                }
            }
        }
        else {
            vscode.window.showWarningMessage(`Unable to find configuration file in the workspace '${wsPath}'`);
        }
    });
}
