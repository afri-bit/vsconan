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

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    // To work for the API a extension folder will created in the home directory
    if (!fs.existsSync(utils.getVSConanHomeDir())) {
        fs.mkdirSync(utils.getVSConanHomeDir());
    }
    
    // TODO: Check if global config file is available, otherwise create a new one with default parameters

    // Additionally the temp folder will created to store temporary files
    if (!fs.existsSync(utils.getVSConanHomeDirTemp()))
    {
        fs.mkdirSync(utils.getVSConanHomeDirTemp());
    }

    // Check if it starts with workspace
    // To check whether its workspace or not is to determine if the function "getWorkspaceFolder" returns undefined or a path
    // If user only open anyfile without a folder (as editor) this the workspace path will return "undefined"
    var wsPath = utils.getWorkspaceFolder();
    var vsconanPath = utils.getVSConanPath();
    var configPath = utils.getWorkspaceConfigPath();

    var configConan = new ConfigWorkspace();
    var configController = new ConfigWorkspaceController(configConan);

    var channelVSConan = vscode.window.createOutputChannel("VSConan");

    var conanApi = new ConanAPI();

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

    // This condition will be entered if vs code used as a workspace
    if (wsPath != undefined) {

        if (isFolderConanProject(wsPath) && !fs.existsSync(configPath!)) {

            vscode.window
                .showInformationMessage("The workspace is detected as a conan project. Do you want to configure this workspace?", ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        // Create .vsconan folder if it doesnt exist
                        if (!fs.existsSync(vsconanPath!))
                            fs.mkdirSync(vsconanPath!);

                        configController.generateDefaultConfig();

                        let jsonConfig = JSON.stringify(configController.getConfig(), null, 4);
                        fs.writeFile(configPath!, jsonConfig, "utf8", function (err) {
                            if (err) throw err;
                        });
                    }
                });
        }
    }

    let commandConan = vscode.commands.registerCommand("vsconan.conan", () => {
        CommandExecutor.executeCommandConan(configController, channelVSConan);
    });

    let commandConanNew = vscode.commands.registerCommand("vsconan.conan.new", () => {
        CommandExecutor.executeCommandConanNew(configController, channelVSConan);
    });

    let commandConanCreate = vscode.commands.registerCommand("vsconan.conan.create", () => {
        CommandExecutor.executeCommandConanCreate(configController, channelVSConan);
    });

    let commandConanInstall = vscode.commands.registerCommand("vsconan.conan.install", () => {
        CommandExecutor.executeCommandConanInstall(configController, channelVSConan);
    });

    let commandConanBuild = vscode.commands.registerCommand("vsconan.conan.build", () => {
        CommandExecutor.executeCommandConanBuild(configController, channelVSConan);
    });

    let commandConanSource = vscode.commands.registerCommand("vsconan.conan.source", () => {
        CommandExecutor.executeCommandConanSource(configController, channelVSConan);
    });

    let commandConanPackage = vscode.commands.registerCommand("vsconan.conan.package", () => {
        CommandExecutor.executeCommandConanPackage(configController, channelVSConan);
    });

    let commandConanExportPackage = vscode.commands.registerCommand("vsconan.conan.package.export", () => {
        CommandExecutor.executeCommandConanPackageExport(configController, channelVSConan);
    });

    let commandConfigCreate = vscode.commands.registerCommand("vsconan.config.create", () => {
        CommandExecutor.executeCommandConfigCreate(configController, channelVSConan);
    });

    let commandRecipeSelected = vscode.commands.registerCommand("vsconan.recipe.selected", () => {
        conanPackageNodeProvider.refresh(treeViewConanRecipe.selection[0].label);
    });

    let bla = vscode.commands.registerCommand("vsconan.recipe.information", (node: ConanRecipeItem) => {
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

