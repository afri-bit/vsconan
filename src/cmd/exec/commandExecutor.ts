import { spawn } from "child_process";
import * as vscode from "vscode";
import {
    ConfigCommand, ConfigCommandBuild, ConfigCommandCreate,
    ConfigCommandInstall, ConfigCommandPackage, ConfigCommandPackageExport, ConfigCommandSource
} from "../../config/configCommand";
import { CommandBuilder } from "../builder/commandBuilder";

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
    private static getCommandConfigIndex(configList: Array<ConfigCommand>): Promise<number | undefined> {
        return new Promise<number | undefined>(async (resolve, reject) => {
            if (configList != undefined) {
                const quickPick = vscode.window.createQuickPick<ConfigCommandQuickPickItem>();
                let quickPickItems = []
                for (let i = 0; i < configList!.length; i++) {
                    quickPickItems.push({
                        label: configList[i].name,
                        description: configList[i].description,
                        detail: configList[i].detail,
                        index: i
                    })
                }

                quickPickItems.map(label => ({ label }));
                quickPick.items = quickPickItems;

                const choice = await vscode.window.showQuickPick(quickPickItems);

                if (choice) {
                    // Returning the filesystem path
                    return resolve(choice.index);
                }
                else {
                    return reject(undefined);
                }
            }
            else {
                return reject(undefined);
            }
        });
    }

    public static executeCommandConan(python: string, channel: vscode.OutputChannel) {
        executeCommand(python, channel);
    }

    public static executeCommandConanNew(python: string, channel: vscode.OutputChannel) {
        vscode.window.showInformationMessage("Conan NEW command");
        // TODO: Implement function to insert name and version to creat conan workspace
    }

    public static executeCommandConanCreate(wsPath: string, python: string, configList: Array<ConfigCommandCreate>, channel: vscode.OutputChannel) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index != undefined) {
                let selectedConfig = configList[index];
                let cmd = CommandBuilder.buildCommandCreate(wsPath, python, selectedConfig);

                if (cmd != undefined) {
                    executeCommand(cmd, channel);
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan CREATE command!");
                }
            }
        });
    }

    public static executeCommandConanInstall(wsPath: string, python: string, configList: Array<ConfigCommandInstall>, channel: vscode.OutputChannel) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index != undefined) {
                let selectedConfig = configList[index];
                let cmd = CommandBuilder.buildCommandInstall(wsPath, python, selectedConfig);

                if (cmd != undefined) {
                    executeCommand(cmd, channel);
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan INSTALL command!");
                }
            }
        });
    }

    public static executeCommandConanBuild(wsPath: string, python: string, configList: Array<ConfigCommandBuild>, channel: vscode.OutputChannel) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index != undefined) {
                let selectedConfig = configList[index];
                let cmd = CommandBuilder.buildCommandBuild(wsPath, python, selectedConfig);

                if (cmd != undefined) {
                    executeCommand(cmd, channel);
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan BUILD command!");
                }
            }
        });
    }

    public static executeCommandConanSource(wsPath: string, python: string, configList: Array<ConfigCommandSource>, channel: vscode.OutputChannel) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index != undefined) {
                let selectedConfig = configList[index];
                let cmd = CommandBuilder.buildCommandSource(wsPath, python, selectedConfig);

                if (cmd != undefined) {
                    executeCommand(cmd, channel);
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan SOURCE command!");
                }
            }
        });
    }

    public static executeCommandConanPackage(wsPath: string, python: string, configList: Array<ConfigCommandPackage>, channel: vscode.OutputChannel) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index != undefined) {
                let selectedConfig = configList[index];
                let cmd = CommandBuilder.buildCommandPackage(wsPath, python, selectedConfig);

                if (cmd != undefined) {
                    executeCommand(cmd, channel);
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan PACKAGE command!");
                }
            }
        });
    }

    public static executeCommandConanPackageExport(wsPath: string, python: string, configList: Array<ConfigCommandPackageExport>, channel: vscode.OutputChannel) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index != undefined) {
                let selectedConfig = configList[index];
                let cmd = CommandBuilder.buildCommandPackageExport(wsPath, python, selectedConfig);

                if (cmd != undefined) {
                    executeCommand(cmd, channel);
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan PACKAGE EXPORT command!");
                }
            }
        });
    }
}