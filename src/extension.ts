import * as fs from "fs";
import * as vscode from "vscode";
import { CommandExecutor } from "./commandExecutor";
import { ConanConfig, ConfigController } from "./conanConfig";
import * as utils from "./utils";

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    // Check if it starts with workspace
    var wsPath = utils.getWorkspaceFolder();
    var vscodePath = utils.getVSCodePath();
    var configPath = utils.getWorkspaceConfigPath();

    var configConan = new ConanConfig();
    var configController = new ConfigController(configConan);

    var channelConanBlade = vscode.window.createOutputChannel("Conan Blade");

    if (wsPath != undefined) {
        if (!fs.existsSync(configPath!)) {
            // Create .vscode folder if it doesnt exist
            if (!fs.existsSync(vscodePath!))
                fs.mkdirSync(vscodePath!);

            configController.generateDefaultConfig();

            let jsonConfig = JSON.stringify(configController.getConfig(), null, 4);
            fs.writeFile(configPath!, jsonConfig, "utf8", function (err) {
                if (err) throw err;
            });
        }
    }
    let commandConan = vscode.commands.registerCommand("conanblade.conan", () => {
        CommandExecutor.executeCommandConan(configController, channelConanBlade);
    });

    let commandConanNew = vscode.commands.registerCommand("conanblade.conan.new", () => {
        CommandExecutor.executeCommandConanNew(configController, channelConanBlade);
    });

    let commandConanCreate = vscode.commands.registerCommand("conanblade.conan.create", () => {
        CommandExecutor.executeCommandConanCreate(configController, channelConanBlade);
    });

    let commandConanInstall = vscode.commands.registerCommand("conanblade.conan.install", () => {
        CommandExecutor.executeCommandConanInstall(configController, channelConanBlade);
    });

    let commandConanBuild = vscode.commands.registerCommand("conanblade.conan.build", () => {
        CommandExecutor.executeCommandConanBuild(configController, channelConanBlade);
    });

    let commandConanSource = vscode.commands.registerCommand("conanblade.conan.source", () => {
        CommandExecutor.executeCommandConanSource(configController, channelConanBlade);

    });

    let commandConanPackage = vscode.commands.registerCommand("conanblade.conan.package", () => {
        CommandExecutor.executeCommandConanPackage(configController, channelConanBlade);
    });

    let commandConanExportPackage = vscode.commands.registerCommand("conanblade.conan.package.export", () => {
        CommandExecutor.executeCommandConanPackageExport(configController, channelConanBlade);
    });

    let commandConfigCreate = vscode.commands.registerCommand("conanblade.config.create", () => {
        CommandExecutor.executeCommandConfigCreate(configController, channelConanBlade);
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
}

// this method is called when your extension is deactivated
export function deactivate() { }

