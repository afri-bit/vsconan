// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as utils from "./utils";

import { ConanConfig, ConfigController } from "./conanConfig";

interface ConfigCommandQuickPickItem extends vscode.QuickPickItem {
	index: number;
}

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    // Check if it starts with workspace
    var wsPath = utils.getWorkspaceFolder();
    var vscodePath = utils.getVSCodePath();
    var configPath = utils.getWorkspaceConfigPath();

    var configConan = new ConanConfig();
    var configContoller = new ConfigController(configConan);

    /**
     * USE CASES: 
     * 1. Opening but no workspace
     * 2. Opening with workspace but no conan file
     * 3. Opening with workspace with conanfile / txt
     */
    if (wsPath != undefined) {

        // Create .vscode folder if it doesnt exist
        if (!fs.existsSync(vscodePath!)) {
            fs.mkdirSync(vscodePath!);
        }

        // Check if the conan file at under .vscode exist
        if (!fs.existsSync(configPath!)) {
            configContoller.generateDefaultConfig();

            let jsonConfig = JSON.stringify(configContoller.getConfig(), null, 4);
            fs.writeFile(configPath!, jsonConfig, "utf8", function (err) {
                if (err) throw err;
            });
        }
    }

    let commandConan = vscode.commands.registerCommand("conanblade.conan", () => {
        vscode.window.showInformationMessage("Conan");
    });

    let commandConanNew = vscode.commands.registerCommand("conanblade.conan.new", () => {
        vscode.window.showInformationMessage("Conan New");
    });

    let commandConanCreate = vscode.commands.registerCommand("conanblade.conan.create", async () => {
        let cmdList = configContoller.getListCommandCreate();

        if (cmdList != undefined) {
            const quickPick = vscode.window.createQuickPick<ConfigCommandQuickPickItem>();
            let quickPickItems = []
            for (let i = 0; i < cmdList!.length; i++) {
                quickPickItems.push({ 
                    label: cmdList[i].name, 
                    description: cmdList[i].description, 
                    detail: cmdList[i].detail, 
                    index: i
                })
            }
            quickPickItems.map(label => ({ label }));
            quickPick.items = quickPickItems;

            quickPick.onDidChangeSelection(([{ label }]) => {
                let a = quickPick.selectedItems[0];

                vscode.window.showInformationMessage(quickPick.selectedItems.toString());

                quickPick.hide();
            });

            quickPick.show();
        }
    });

    let commandConanInstall = vscode.commands.registerCommand("conanblade.conan.install", () => {
        vscode.window.showInformationMessage("Conan Install");
    });

    let commandConanBuild = vscode.commands.registerCommand("conanblade.conan.build", () => {
        vscode.window.showInformationMessage("Conan Build");
    });

    let commandConanSource = vscode.commands.registerCommand("conanblade.conan.source", () => {
        vscode.window.showInformationMessage("Conan Source");
    });

    let commandConanPackage = vscode.commands.registerCommand("conanblade.conan.package", () => {
        vscode.window.showInformationMessage("Conan Package");
    });

    let commandConanExportPackage = vscode.commands.registerCommand("conanblade.conan.package.export", () => {
        vscode.window.showInformationMessage("Conan Export Package");
    });

    context.subscriptions.push(commandConan);
    context.subscriptions.push(commandConanNew);
    context.subscriptions.push(commandConanCreate);
    context.subscriptions.push(commandConanInstall);
    context.subscriptions.push(commandConanBuild);
    context.subscriptions.push(commandConanSource);
    context.subscriptions.push(commandConanPackage);
    context.subscriptions.push(commandConanExportPackage);
}

// this method is called when your extension is deactivated
export function deactivate() { }

