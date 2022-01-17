import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as os from "os";
import { CommandExecutor } from "./cmd/exec/commandExecutor";
import { ConfigWorkspace, ConfigWorkspaceController } from "./config/configWorkspace";
import * as utils from "./utils/utils";
import { ConanAPI } from "./api/conan/conanAPI";
import { ConanRecipeNodeProvider, ConanRecipeItem } from "./ui/treeview/conanRecipeProvider";
import { ConanProfileItem, ConanProfileNodeProvider } from "./ui/treeview/conanProfileProvider";
import { ConanPackageItem, ConanPackageNodeProvider } from "./ui/treeview/conanPackageProvider";
import { ConanRemoteItem, ConanRemoteNodeProvider } from "./ui/treeview/conanRemoteProvider";
import { ConfigGlobal, ConfigGlobalController } from "./config/configGlobal";

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    // VSConan Workspace Area
    // Variables for workspace area
    var wsPath = utils.getWorkspaceFolder();
    var vsconanPath = utils.getVSConanPath();
    var configWorkspacePath = utils.getWorkspaceConfigPath();
    var configWorkspace = new ConfigWorkspace();
    var controllerConfigWorkspace = new ConfigWorkspaceController(configWorkspace);

    // VSConan Global Area
    // Variables for global area
    var configGlobal = new ConfigGlobal();
    var controllerConfigGlobal = new ConfigGlobalController(configGlobal);

    // Create VSConan extension channel
    // This channel is to show the command line outputs specifically for this extension
    var channelVSConan = vscode.window.createOutputChannel("VSConan");

    var conanApi = new ConanAPI();

    // Global Area - The global area is stored under home folder ($HOME/.vsconan)
    //               This area has lower priority then the workspace area
    // Global Area - To work for the API a extension folder will created in the home directory
    if (!fs.existsSync(utils.getVSConanHomeDir())) {
        fs.mkdirSync(utils.getVSConanHomeDir());
    }

    // Global Area - Check if global config file is available, otherwise create a new one with default parameters
    if (!fs.existsSync(utils.getGlobalConfigPath())) {
        controllerConfigGlobal.generateDefaultConfig();

        let jsonConfig = JSON.stringify(controllerConfigGlobal.getConfig(), null, 4);
        fs.writeFile(utils.getGlobalConfigPath(), jsonConfig, "utf8", function (err) {
            if (err) throw err;
        });
    }

    // Global Area - dditionally the temp folder will created to store temporary files
    if (!fs.existsSync(utils.getVSConanHomeDirTemp())) {
        fs.mkdirSync(utils.getVSConanHomeDirTemp());
    }

    // ========== Registering the treeview for the extension
    const conanRecipeNodeProvider = new ConanRecipeNodeProvider(conanApi);
    let treeViewConanRecipe = vscode.window.createTreeView('vsconan-view-recipe', {
        treeDataProvider: conanRecipeNodeProvider
    });

    const conanProfileNodeProvider = new ConanProfileNodeProvider(conanApi);
    let treeViewConanProfile = vscode.window.createTreeView('vsconan-view-profile', {
        treeDataProvider: conanProfileNodeProvider
    });

    const conanPackageNodeProvider = new ConanPackageNodeProvider(conanApi);
    let treeViewConanPackage = vscode.window.createTreeView('vsconan-view-package', {
        treeDataProvider: conanPackageNodeProvider
    });

    const conanRemoteNodeProvider = new ConanRemoteNodeProvider(conanApi);
    let treeViewConanRemote = vscode.window.createTreeView('vsconan-view-remote', {
        treeDataProvider: conanRemoteNodeProvider
    });

    // Check if it starts with workspace
    // To check whether its workspace or not is to determine if the function "getWorkspaceFolder" returns undefined or a path
    // If user only open anyfile without a folder (as editor) this the workspace path will return "undefined"
    // This condition will be entered if vs code used as a workspace
    if (wsPath != undefined) {

        if (isFolderConanProject(wsPath) && !fs.existsSync(configWorkspacePath!)) {

            vscode.window
                .showInformationMessage("The workspace is detected as a conan project. Do you want to configure this workspace?", ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        // Create .vsconan folder if it doesnt exist
                        if (!fs.existsSync(vsconanPath!))
                            fs.mkdirSync(vsconanPath!);

                        controllerConfigWorkspace.generateDefaultConfig();

                        let jsonConfig = JSON.stringify(controllerConfigWorkspace.getConfig(), null, 4);
                        fs.writeFile(configWorkspacePath!, jsonConfig, "utf8", function (err) {
                            if (err) throw err;
                        });
                    }
                });
        }
    }

    // ========== Extension Commands Registration Section 
    let commandConan = vscode.commands.registerCommand("vsconan.conan", () => {
        CommandExecutor.executeCommandConan(controllerConfigWorkspace, channelVSConan);
    });

    // ========== Conan Workflow Command Registration
    let commandConanNew = vscode.commands.registerCommand("vsconan.conan.new", () => {
        CommandExecutor.executeCommandConanNew(controllerConfigWorkspace, channelVSConan);
    });

    let commandConanCreate = vscode.commands.registerCommand("vsconan.conan.create", () => {
        CommandExecutor.executeCommandConanCreate(controllerConfigWorkspace, channelVSConan);
    });

    let commandConanInstall = vscode.commands.registerCommand("vsconan.conan.install", () => {
        CommandExecutor.executeCommandConanInstall(controllerConfigWorkspace, channelVSConan);
    });

    let commandConanBuild = vscode.commands.registerCommand("vsconan.conan.build", () => {
        CommandExecutor.executeCommandConanBuild(controllerConfigWorkspace, channelVSConan);
    });

    let commandConanSource = vscode.commands.registerCommand("vsconan.conan.source", () => {
        CommandExecutor.executeCommandConanSource(controllerConfigWorkspace, channelVSConan);
    });

    let commandConanPackage = vscode.commands.registerCommand("vsconan.conan.package", () => {
        CommandExecutor.executeCommandConanPackage(controllerConfigWorkspace, channelVSConan);
    });

    let commandConanExportPackage = vscode.commands.registerCommand("vsconan.conan.package.export", () => {
        CommandExecutor.executeCommandConanPackageExport(controllerConfigWorkspace, channelVSConan);
    });

    // ========== Global Configuration Command Registration
    let commandConfigGlobalCreate = vscode.commands.registerCommand("vsconan.config.global.create", () => {
        // TODO: Create default global configuration
    });

    let commandConfigGlobalOpen = vscode.commands.registerCommand("vsconan.config.global.open", () => {
        // TODO: Open global configuration file in the editor
    });

    // ========== Workspace Configuration Command Registration
    let commandConfigWorkspaceCreate = vscode.commands.registerCommand("vsconan.config.workspace.create", () => {
        CommandExecutor.executeCommandConfigCreate(controllerConfigWorkspace, channelVSConan);
    });

    let commandConfigWorkspaceOpen = vscode.commands.registerCommand("vsconan.config.workspace.open", () => {
        // TODO: Open workspace configuration file in the editor
    });

    // ========== Treeview RECIPE Command Registration
    // Command on selecting a recipe. This will show list of the package binary
    let commandRecipeSelected = vscode.commands.registerCommand("vsconan.recipe.selected", () => {
        conanPackageNodeProvider.refresh(treeViewConanRecipe.selection[0].label);
    });

    let commandRecipeInformation = vscode.commands.registerCommand("vsconan.recipe.information", (node: ConanRecipeItem) => {
        // TODO: Show information from the selected recipe
        console.log(`Selected Node is ${node.label}`);
    });

    let commandRecipeOpen = vscode.commands.registerCommand("vsconan.recipe.open", (node: ConanRecipeItem) => {
        // TODO: Open the folder to the recipe
    });

    let commandRecipeRemove = vscode.commands.registerCommand("vsconan.recipe.remove", (node: ConanRecipeItem) => {
        // TODO: Remove the whole recipe
    });

    // ========== Treeview PACKAGE Command Registration
    let commandPackageSelected = vscode.commands.registerCommand("vsconan.package.selected", () => {
        // TODO: ??? Maybe do nothing...
    });

    let commandPackageInformation = vscode.commands.registerCommand("vsconan.package.information", (packageNode: ConanPackageItem) => {
        // TODO: Show information from the selected recipe
        console.log(`Selected Recipe  is ${treeViewConanRecipe.selection[0].label}`);
        console.log(`Selected Package is ${packageNode.label}`);
    });

    let commandPackageOpen = vscode.commands.registerCommand("vsconan.package.open", (node: ConanPackageItem) => {
        // TODO: Open the package folder
    });

    let commandPackageRemove = vscode.commands.registerCommand("vsconan.package.remove", (node: ConanPackageItem) => {
        // TODO: Remove the certain binary package
    });

    // ========== Treeview PROFILE Command Registration
    let commandProfileSelected = vscode.commands.registerCommand("vsconan.profile.selected", (node: ConanProfileItem) => {
        // TODO: Open the profile in the editor
        console.log(`Selected Remote is ${node.label}`);
    });

    let commandProfileRemove = vscode.commands.registerCommand("vsconan.profile.remove", (node: ConanProfileItem) => {
        // TODO: Remove the selected profile
    });

    // ========== Treeview REMOTE Command Registration
    let commandRemoteSelected = vscode.commands.registerCommand("vsconan.remote.selected", (node: ConanRemoteItem) => {
        // TODO: Open the remote in the editor
    });

    let commandRemoteRemove = vscode.commands.registerCommand("vsconan.remote.remove", (node: ConanRemoteItem) => {
        // TODO: Remove the selected remote
    });

    context.subscriptions.push(commandConan);
    context.subscriptions.push(commandConanNew);
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

    // Recipe
    context.subscriptions.push(commandRecipeSelected);
    context.subscriptions.push(commandRecipeInformation);
    context.subscriptions.push(commandRecipeOpen);
    context.subscriptions.push(commandRecipeRemove);

    // Package
    context.subscriptions.push(commandPackageSelected);
    context.subscriptions.push(commandPackageInformation);
    context.subscriptions.push(commandPackageOpen);
    context.subscriptions.push(commandPackageRemove);

    // Profile
    context.subscriptions.push(commandProfileSelected);
    context.subscriptions.push(commandProfileRemove);

    // Remote
    context.subscriptions.push(commandRemoteSelected);
    context.subscriptions.push(commandRemoteRemove);
}

export function isFolderConanProject(ws: string): boolean {
    let ret: boolean = false;

    let conanpy: string = path.join(ws, "conanfile.py");
    let conantxt: string = path.join(ws, "conanfile.txt");

    if (fs.existsSync(conanpy) || fs.existsSync(conantxt)) {
        ret = true;
    }

    return ret;
}

// this method is called when your extension is deactivated
export function deactivate() { }
