import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ConanAPI } from "./api/conan/conanAPI";
import { CommandExecutor } from "./cmd/exec/commandExecutor";
import {
    CommandContainer, ConfigCommandBuild, ConfigCommandCreate,
    ConfigCommandInstall, ConfigCommandPackage, ConfigCommandPackageExport,
    ConfigCommandSource
} from "./config/configCommand";
// import { ConfigDataGlobal, ConfigGlobal } from "./config/configGlobal";
import { ConfigWorkspace } from "./config/configWorkspace";
import { ConanPackageItem, ConanPackageNodeProvider } from "./ui/treeview/conanPackageProvider";
import { ConanProfileItem, ConanProfileNodeProvider } from "./ui/treeview/conanProfileProvider";
import { ConanRecipeItem, ConanRecipeNodeProvider } from "./ui/treeview/conanRecipeProvider";
import { ConanRemoteItem, ConanRemoteNodeProvider } from "./ui/treeview/conanRemoteProvider";
import * as utils from "./utils/utils";
import * as globals from "./globals";
import { ConfigGlobal } from "./config/configGlobal";

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    let configGlobal = new ConfigGlobal();
    utils.json.readFromJSON(utils.vsconan.getGlobalConfigPath(), configGlobal);

    // // VSConan Global Area
    // // Variables for global area
    // var configDataGlobal = new ConfigDataGlobal();
    // var configGlobal = new ConfigGlobal(configDataGlobal);

    // Create VSConan extension channel
    // This channel is to show the command line outputs specifically for this extension
    var channelVSConan = vscode.window.createOutputChannel("VSConan");

    var conanApi = new ConanAPI();

    // Global Area - The global area is stored under home folder ($HOME/.vsconan)
    //               This area has lower priority then the workspace area
    // Global Area - To work for the API a extension folder will created in the home directory
    if (!fs.existsSync(utils.vsconan.getVSConanHomeDir())) {
        fs.mkdirSync(utils.vsconan.getVSConanHomeDir());
    }

    // Global Area - Check if global config file is available, otherwise create a new one with default parameters
    if (!fs.existsSync(utils.vsconan.getGlobalConfigPath())) {
        // configGlobal.writeConfig();
    }

    // Global Area - dditionally the temp folder will created to store temporary files
    if (!fs.existsSync(utils.vsconan.getVSConanHomeDirTemp())) {
        fs.mkdirSync(utils.vsconan.getVSConanHomeDirTemp());
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
    let wsList = vscode.workspace.workspaceFolders;

    if (wsList != undefined) {

        for (let i = 0; i < wsList.length; i++) {

            let wsPath = wsList[i].uri.fsPath;
            let configPath = path.join(wsPath, globals.constant.VSCONAN_FOLDER, globals.constant.CONFIG_FILE)

            if (isFolderConanProject(wsPath) && !fs.existsSync(configPath!)) {

                vscode.window
                    .showInformationMessage(`The workspace '${wsList[i].name}' is detected as a conan project. Do you want to configure this workspace?`, ...["Yes", "Not Now"])
                    .then((answer) => {
                        if (answer === "Yes") {

                            let vsconanPath = path.join(wsPath, globals.constant.VSCONAN_FOLDER);
                            if (!fs.existsSync(vsconanPath)){
                                fs.mkdirSync(vsconanPath!);
                            }

                            // Create a default config file
                            let configWorkspace = new ConfigWorkspace("python", new CommandContainer(
                                [new ConfigCommandCreate()],
                                [new ConfigCommandInstall()],
                                [new ConfigCommandBuild()],
                                [new ConfigCommandSource()],
                                [new ConfigCommandPackage()],
                                [new ConfigCommandPackageExport()]
                                ));

                            utils.json.writeToJson(configWorkspace, configPath);
                        }
                    });
            }
        }
    }

    // ========== Extension Commands Registration Section 
    let commandConan = vscode.commands.registerCommand("vsconan.conan", () => {
        // let python = selectPython(configGlobal.getConfig(), configWorkspace.getConfig());
        // if (python != undefined) {
        //     CommandExecutor.executeCommandConan(python, channelVSConan);
        // }
        // else {
        //     vscode.window.showErrorMessage("Unable to execute CONAN command. Define the Python intepreter.");
        // }
    });

    // ========== Conan Workflow Command Registration
    let commandConanNew = vscode.commands.registerCommand("vsconan.conan.new", () => {
        // CommandExecutor.executeCommandConanNew(controllerConfigWorkspace, channelVSConan);
    });

    let commandConanCreate = vscode.commands.registerCommand("vsconan.conan.create", () => {
        // configGlobal.readConfig();
        // configWorkspace.readConfig();
        // let python = selectPython(configGlobal.getConfig(), configWorkspace.getConfig());
        // if (python != undefined) {
        //     CommandExecutor.executeCommandConanCreate(python, configWorkspace.getConfig().commandContainer.create, channelVSConan);
        // }
        // else {
        //     vscode.window.showErrorMessage("Unable to execute CONAN command. Python Intepreter is not defined!");
        // }

    });

    let commandConanInstall = vscode.commands.registerCommand("vsconan.conan.install", () => {
        // configGlobal.readConfig();
        // configWorkspace.readConfig();
        // let python = selectPython(configGlobal.getConfig(), configWorkspace.getConfig());
        // if (python != undefined) {
        //     CommandExecutor.executeCommandConanInstall(python, configWorkspace.getConfig().commandContainer.install, channelVSConan);
        // }
        // else {
        //     vscode.window.showErrorMessage("Unable to execute CONAN command. Python Intepreter is not defined!");
        // }
    });

    let commandConanBuild = vscode.commands.registerCommand("vsconan.conan.build", () => {
        // configGlobal.readConfig();
        // configWorkspace.readConfig();
        // let python = selectPython(configGlobal.getConfig(), configWorkspace.getConfig());
        // if (python != undefined) {
        //     CommandExecutor.executeCommandConanBuild(python, configWorkspace.getConfig().commandContainer.build, channelVSConan);
        // }
        // else {
        //     vscode.window.showErrorMessage("Unable to execute CONAN command. Python Intepreter is not defined!");
        // }
    });

    let commandConanSource = vscode.commands.registerCommand("vsconan.conan.source", () => {
        // configGlobal.readConfig();
        // configWorkspace.readConfig();
        // let python = selectPython(configGlobal.getConfig(), configWorkspace.getConfig());
        // if (python != undefined) {
        //     CommandExecutor.executeCommandConanSource(python, configWorkspace.getConfig().commandContainer.source, channelVSConan);
        // }
        // else {
        //     vscode.window.showErrorMessage("Unable to execute CONAN command. Python Intepreter is not defined!");
        // }
    });

    let commandConanPackage = vscode.commands.registerCommand("vsconan.conan.package", () => {
        // configGlobal.readConfig();
        // configWorkspace.readConfig();
        // let python = selectPython(configGlobal.getConfig(), configWorkspace.getConfig());
        // if (python != undefined) {
        //     CommandExecutor.executeCommandConanPackage(python, configWorkspace.getConfig().commandContainer.pkg, channelVSConan);
        // }
        // else {
        //     vscode.window.showErrorMessage("Unable to execute CONAN command. Python Intepreter is not defined!");
        // }
    });

    let commandConanExportPackage = vscode.commands.registerCommand("vsconan.conan.package.export", () => {
        // configGlobal.readConfig();
        // configWorkspace.readConfig();
        // let python = selectPython(configGlobal.getConfig(), configWorkspace.getConfig());
        // if (python != undefined) {
        //     CommandExecutor.executeCommandConanPackageExport(python, configWorkspace.getConfig().commandContainer.pkgExport, channelVSConan);
        // }
        // else {
        //     vscode.window.showErrorMessage("Unable to execute CONAN command. Python Intepreter is not defined!");
        // }
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
        // CommandExecutor.executeCommandConfigCreate(controllerConfigWorkspace, channelVSConan);
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

    let commandRecipeOpenFolder = vscode.commands.registerCommand("vsconan.recipe.open.folder", (node: ConanRecipeItem) => {
        // TODO: Open the folder to the recipe
    });

    let commandRecipeOpenVSCode = vscode.commands.registerCommand("vsconan.recipe.open.vscode", (node: ConanRecipeItem) => {
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

    let commandPackageOpenFolder = vscode.commands.registerCommand("vsconan.package.open.folder", (node: ConanPackageItem) => {
        // TODO: Open the package folder
    });

    let commandPackageOpenVSCode = vscode.commands.registerCommand("vsconan.package.open.vscode", (node: ConanPackageItem) => {
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
    context.subscriptions.push(commandRecipeOpenFolder);
    context.subscriptions.push(commandRecipeOpenVSCode);
    context.subscriptions.push(commandRecipeRemove);

    // Package
    context.subscriptions.push(commandPackageSelected);
    context.subscriptions.push(commandPackageInformation);
    context.subscriptions.push(commandPackageOpenFolder);
    context.subscriptions.push(commandPackageOpenVSCode);
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

// /**
//  * Method to select python between global and workspace
//  */
// export function selectPython(configDataGlobal: ConfigDataGlobal, configDataWorkspace: ConfigDataWorkspace): string | undefined {
//     // TODO: Config workspace has priority over the global config
//     // If workspace config is undefined or empty, the global config will be used
//     // With this logic, user can define the python configuration locally in workspace

//     if (configDataWorkspace.python != undefined && configDataWorkspace.python != "") { // Returning workspace python
//         return configDataWorkspace.python;
//     }
//     else if (configDataGlobal.python != undefined && configDataGlobal.python != "") { // Returning global python
//         return configDataGlobal.python;
//     }
//     else { // No other option available
//         return undefined;
//     }

// }

/**
 * Function to show quick pick to get a workspace path.
 * This can list the multiple workspaces and user can select it using a quick pick menu. 
 * 
 * @returns <string | undefined> Selected workspace path or undefined
 */
export async function selectWorkspace(): Promise<string | undefined> {
    let wsList = vscode.workspace.workspaceFolders;

    if (wsList!.length > 1) { // Workspace contains multiple folders
        const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();
        let quickPickItems = []
        for (let i = 0; i < wsList!.length; i++) {
            quickPickItems.push({
                label: wsList![i].name,
                description: wsList![i].uri.fsPath,
                detail: "",
                index: i
            })
        }
        quickPickItems.map(label => ({ label }));
        quickPick.items = quickPickItems;

        const choice = await vscode.window.showQuickPick(quickPickItems);

        if (choice) {
            // Returning the filesystem path
            return choice.description;
        }
        else {
            return undefined;
        }
    }
    else if (wsList!.length == 1) {
        // Choose the only path it has
        return wsList![0].uri.fsPath;
    }
    else if (wsList == undefined) {
        // Do nothing
        return undefined;
    }
}

// this method is called when your extension is deactivated
export function deactivate() { }
