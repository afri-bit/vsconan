import { spawn } from "child_process";
import * as fs from "fs";
import * as vscode from "vscode";
import { CommandBuilder } from "../builder/commandBuilder";
import { ConfigController } from "../../config/conanConfig";
import * as utils from "../../utils/utils";

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
    public static executeCommandConan(configController: ConfigController, channel: vscode.OutputChannel) {
        let cmd = CommandBuilder.buildCommandConan(configController.getPython());

        if (cmd != undefined)
            executeCommand(cmd, channel);
        else
            vscode.window.showErrorMessage("Unable to execute CONAN command");
    }

    public static executeCommandConanNew(configController: ConfigController, channel: vscode.OutputChannel) {
        vscode.window.showInformationMessage("Conan NEW command");
        // TODO: Implement function to insert name and version to creat conan workspace
    }

    public static executeCommandConanCreate(configController: ConfigController, channel: vscode.OutputChannel) {
        let cmdList = configController.getListCommandCreate();

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

                let cfg = configController.getConfigCommandCreate(quickPick.selectedItems[0].index);
                let cmd = CommandBuilder.buildCommandCreate(configController.getPython(), cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan CREATE command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanInstall(configController: ConfigController, channel: vscode.OutputChannel) {
        let cmdList = configController.getListCommandInstall();

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

                let cfg = configController.getConfigCommandInstall(quickPick.selectedItems[0].index);
                let cmd = CommandBuilder.buildCommandInstall(configController.getPython(), cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan INSTALL command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanBuild(configController: ConfigController, channel: vscode.OutputChannel) {
        let cmdList = configController.getListCommandBuild();

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

                let cfg = configController.getConfigCommandBuild(quickPick.selectedItems[0].index);
                let cmd = CommandBuilder.buildCommandBuild(configController.getPython(), cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan BUILD command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanSource(configController: ConfigController, channel: vscode.OutputChannel) {
        let cmdList = configController.getListCommandSource();

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

                let cfg = configController.getConfigCommandSource(quickPick.selectedItems[0].index);
                let cmd = CommandBuilder.buildCommandSource(configController.getPython(), cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan SOURCE command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanPackage(configController: ConfigController, channel: vscode.OutputChannel) {
        let cmdList = configController.getListCommandPackage();

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

                let cfg = configController.getConfigCommandPackage(quickPick.selectedItems[0].index);
                let cmd = CommandBuilder.buildCommandPackage(configController.getPython(), cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan PACKAGE command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConanPackageExport(configController: ConfigController, channel: vscode.OutputChannel) {
        let cmdList = configController.getListCommandPackageExport();

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

                let cfg = configController.getConfigCommandPackageExport(quickPick.selectedItems[0].index);
                let cmd = CommandBuilder.buildCommandPackageExport(configController.getPython(), cfg);

                if (cmd != undefined)
                    executeCommand(cmd, channel);
                else
                    vscode.window.showErrorMessage("Unable to execute conan PACKAGE EXPORT command!");

                quickPick.hide();
            });

            quickPick.show();
        }
    }

    public static executeCommandConfigCreate(configController: ConfigController, channel: vscode.OutputChannel) {
        if (!fs.existsSync(utils.getWorkspaceConfigPath()!)) {
            // Create .vscode folder if it doesnt exist
            if (!fs.existsSync(utils.getVSCodePath()!))
                fs.mkdirSync(utils.getVSCodePath()!);

            configController.generateDefaultConfig();

            let jsonConfig = JSON.stringify(configController.getConfig(), null, 4);
            fs.writeFile(utils.getWorkspaceConfigPath()!, jsonConfig, "utf8", function (err) {
                if (err) throw err;
            });
        }
        else {
            vscode.window.showInformationMessage("Config file already exists.");
        }
    }
}