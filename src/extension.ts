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

    var channelVSConan = vscode.window.createOutputChannel("VSConan");

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

