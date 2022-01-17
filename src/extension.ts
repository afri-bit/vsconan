import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as os from "os";
import { CommandExecutor } from "./cmd/exec/commandExecutor";
import { ConfigWorkspace, ConfigWorkspaceController } from "./config/configWorkspace";
import * as utils from "./utils/utils";
import { ConanAPI } from "./api/conan/conanAPI";
import { ConanRecipeNodeProvider, ConanRecipeItem } from "./ui/treeview/conanRecipeProvider";
import { ConanProfileNodeProvider } from "./ui/treeview/conanProfileProvider";
import { ConanPackageNodeProvider } from "./ui/treeview/conanPackageProvider";
import { ConanRemoteNodeProvider } from "./ui/treeview/conanRemoteProvider";
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
    if (!fs.existsSync(utils.getVSConanHomeDirTemp()))
    {
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

    let commandConfigCreate = vscode.commands.registerCommand("vsconan.config.create", () => {
        CommandExecutor.executeCommandConfigCreate(controllerConfigWorkspace, channelVSConan);
    });

    let commandRecipeSelected = vscode.commands.registerCommand("vsconan.recipe.selected", () => {
        conanPackageNodeProvider.refresh(treeViewConanRecipe.selection[0].label);
    });

    let commandRecipeInformation = vscode.commands.registerCommand("vsconan.recipe.information", (node: ConanRecipeItem) => {
        // TODO: Show information from the selected recipe
        console.log(`Selected Node is ${node.label}`);
    });

    context.subscriptions.push(commandConan);
    context.subscriptions.push(commandConanNew);
    context.subscriptions.push(commandConanCreate);
    context.subscriptions.push(commandConanInstall);
    context.subscriptions.push(commandConanBuild);
    context.subscriptions.push(commandConanSource);
    context.subscriptions.push(commandConanPackage);
    context.subscriptions.push(commandConanExportPackage);
    context.subscriptions.push(commandConfigCreate);
    context.subscriptions.push(commandRecipeSelected);
}

export function isFolderConanProject(ws: string): boolean {
    let ret: boolean = false;

    let conanpy: string = path.join(ws, "conanfile.py");
    let conantxt: string = path.join(ws, "conanfile.txt");

    if (fs.existsSync(conanpy) || fs.existsSync(conantxt)){
        ret = true;
    }

    return ret;

}

// this method is called when your extension is deactivated
export function deactivate() { }

