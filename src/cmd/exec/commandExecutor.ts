import { spawn } from "child_process";
import * as fs from "fs";
import * as vscode from "vscode";
import { CommandBuilder } from "../builder/commandBuilder";
import { ConfigWorkspace } from "../../config/configWorkspace";
import * as utils from "../../utils/utils";
import { ConfigCommandBuild, ConfigCommandCreate, ConfigCommandInstall, ConfigCommandPackage, ConfigCommandPackageExport, ConfigCommandSource } from "../../config/configCommand";

interface ConfigCommandQuickPickItem extends vscode.QuickPickItem {
    index: number;
}

async function executeCommand(cmd: string, channel: vscode.OutputChannel) {
    // const exec = util.promisify(require('child_process').exec);
    // const { stdout, stderr } = await spawn(cmd);
    channel.show();

    const ls = spawn(cmd, [], { shell: true });

    ls.stdout.on("data", data => {
        channel.append(`${data}`);
    });

    ls.stderr.on("data", data => {
        channel.append(`${data}`);
    });

    ls.on('error', (error) => {
        channel.append(`ERROR: ${error.message}`);
    });

    ls.on("close", code => {
        channel.append(`\nProcess exited with code ${code}\n`);
    });
}

export class CommandExecutor {
    public static executeCommandConan(python: string, channel: vscode.OutputChannel) {
        executeCommand(python, channel);
    }

    public static executeCommandConanNew(python: string, channel: vscode.OutputChannel) {
        vscode.window.showInformationMessage("Conan NEW command");
        // TODO: Implement function to insert name and version to creat conan workspace
    }

    public static executeCommandConanCreate(python: string, configCreateList: Array<ConfigCommandCreate>, channel: vscode.OutputChannel) {
        if (configCreateList != undefined) {
            const quickPick = vscode.window.createQuickPick<ConfigCommandQuickPickItem>();
            let quickPickItems = []
            for (let i = 0; i < configCreateList!.length; i++) {
                quickPickItems.push({
                    label: configCreateList[i].name,
                    description: configCreateList[i].description,
                    detail: configCreateList[i].detail,
                    index: i
                })
            }
            quickPickItems.map(label => ({ label }));
            quickPick.items = quickPickItems;

            quickPick.onDidChangeSelection(([{ label }]) => {

                let cfg = configCreateList[quickPick.selectedItems[0].index]
                let cmd = CommandBuilder.buildCommandCreate(python, cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan CREATE command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanInstall(python: string, configInstallList: Array<ConfigCommandInstall>, channel: vscode.OutputChannel) {
        if (configInstallList != undefined) {
            const quickPick = vscode.window.createQuickPick<ConfigCommandQuickPickItem>();
            let quickPickItems = []
            for (let i = 0; i < configInstallList!.length; i++) {
                quickPickItems.push({
                    label: configInstallList[i].name,
                    description: configInstallList[i].description,
                    detail: configInstallList[i].detail,
                    index: i
                })
            }
            quickPickItems.map(label => ({ label }));
            quickPick.items = quickPickItems;

            quickPick.onDidChangeSelection(([{ label }]) => {

                let cfg = configInstallList[quickPick.selectedItems[0].index];
                let cmd = CommandBuilder.buildCommandInstall(python, cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan INSTALL command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanBuild(python: string, configBuildList: Array<ConfigCommandBuild>, channel: vscode.OutputChannel) {
        if (configBuildList != undefined) {
            const quickPick = vscode.window.createQuickPick<ConfigCommandQuickPickItem>();
            let quickPickItems = []
            for (let i = 0; i < configBuildList!.length; i++) {
                quickPickItems.push({
                    label: configBuildList[i].name,
                    description: configBuildList[i].description,
                    detail: configBuildList[i].detail,
                    index: i
                })
            }
            quickPickItems.map(label => ({ label }));
            quickPick.items = quickPickItems;

            quickPick.onDidChangeSelection(([{ label }]) => {

                let cfg = configBuildList[quickPick.selectedItems[0].index];
                let cmd = CommandBuilder.buildCommandBuild(python, cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan BUILD command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanSource(python: string, configSourceList: Array<ConfigCommandSource>, channel: vscode.OutputChannel) {
        if (configSourceList != undefined) {
            const quickPick = vscode.window.createQuickPick<ConfigCommandQuickPickItem>();
            let quickPickItems = []
            for (let i = 0; i < configSourceList!.length; i++) {
                quickPickItems.push({
                    label: configSourceList[i].name,
                    description: configSourceList[i].description,
                    detail: configSourceList[i].detail,
                    index: i
                })
            }
            quickPickItems.map(label => ({ label }));
            quickPick.items = quickPickItems;

            quickPick.onDidChangeSelection(([{ label }]) => {

                let cfg = configSourceList[quickPick.selectedItems[0].index];
                let cmd = CommandBuilder.buildCommandSource(python, cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan SOURCE command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanPackage(python: string, configPackageList: Array<ConfigCommandPackage>, channel: vscode.OutputChannel) {
        if (configPackageList != undefined) {
            const quickPick = vscode.window.createQuickPick<ConfigCommandQuickPickItem>();
            let quickPickItems = []
            for (let i = 0; i < configPackageList!.length; i++) {
                quickPickItems.push({
                    label: configPackageList[i].name,
                    description: configPackageList[i].description,
                    detail: configPackageList[i].detail,
                    index: i
                })
            }
            quickPickItems.map(label => ({ label }));
            quickPick.items = quickPickItems;

            quickPick.onDidChangeSelection(([{ label }]) => {

                let cfg = configPackageList[quickPick.selectedItems[0].index];
                let cmd = CommandBuilder.buildCommandPackage(python, cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan PACKAGE command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanPackageExport(python: string, configPackageExpList: Array<ConfigCommandPackageExport>, channel: vscode.OutputChannel) {
        if (configPackageExpList != undefined) {
            const quickPick = vscode.window.createQuickPick<ConfigCommandQuickPickItem>();
            let quickPickItems = []
            for (let i = 0; i < configPackageExpList!.length; i++) {
                quickPickItems.push({
                    label: configPackageExpList[i].name,
                    description: configPackageExpList[i].description,
                    detail: configPackageExpList[i].detail,
                    index: i
                })
            }
            quickPickItems.map(label => ({ label }));
            quickPick.items = quickPickItems;

            quickPick.onDidChangeSelection(([{ label }]) => {

                let cfg = configPackageExpList[quickPick.selectedItems[0].index];
                let cmd = CommandBuilder.buildCommandPackageExport(python, cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan PACKAGE EXPORT command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    // public static executeCommandConfigCreate(configController: ConfigWorkspaceController, channel: vscode.OutputChannel) {
    //     if (!fs.existsSync(utils.getWorkspaceConfigPath()!)) {
    //         // Create .vscode folder if it doesnt exist
    //         if (!fs.existsSync(utils.getVSCodePath()!))
    //             fs.mkdirSync(utils.getVSCodePath()!);

    //         if (!fs.existsSync(utils.getVSConanPath()!))
    //             fs.mkdirSync(utils.getVSConanPath()!);

    //         configController.generateDefaultConfig();

    //         let jsonConfig = JSON.stringify(configController.getConfig(), null, 4);
    //         fs.writeFile(utils.getWorkspaceConfigPath()!, jsonConfig, "utf8", function (err) {
    //             if (err) throw err;
    //         });
    //     }
    //     else {
    //         vscode.window.showInformationMessage("Config file already exists.");
    //     }
    // }
}