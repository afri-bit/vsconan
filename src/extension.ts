// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    let rootPath = vscode.workspace.workspaceFolders

    if (rootPath != undefined) {
        let vscodepath = rootPath + "/.vscode";
    }

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "conan-blade-vscode" is now active!');

    let commandConan = vscode.commands.registerCommand("conanblade.conan", () => {
        vscode.window.showInformationMessage("Conan");
    });

    let commandConanNew = vscode.commands.registerCommand("conanblade.conan.new", () => {
        vscode.window.showInformationMessage("Conan New");
    });

    let commandConanCreate = vscode.commands.registerCommand("conanblade.conan.create", () => {
        vscode.window.showInformationMessage("Conan Create");
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
