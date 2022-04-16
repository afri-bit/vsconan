import * as vscode from 'vscode';
import * as utils from '../utils';
import * as fs from "fs";
import * as path from "path";
import * as globals from "../globals";
import { ConanAPI } from '../api/conan/conanAPI';
import { ExtensionManager } from "./extensionManager";
import { CommandExecutor } from '../command/commandExecutor';
import { ConfigWorkspace } from '../config/configWorkspace';

enum ConanCommand {
    create,
    install,
    build,
    source,
    package,
    packageExport
}

export class VSConanWorkspaceManager extends ExtensionManager {
    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private conanApi: ConanAPI;

    public constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel, conanApi: ConanAPI) {
        super();

        this.context = context;
        this.outputChannel = outputChannel;
        this.conanApi = conanApi;

        this.registerCommand("vsconan.conan.create", () => this.executeConanCommand(ConanCommand.create));
        this.registerCommand("vsconan.conan.install", () => this.executeConanCommand(ConanCommand.install));
        this.registerCommand("vsconan.conan.build", () => this.executeConanCommand(ConanCommand.build));
        this.registerCommand("vsconan.conan.source", () => this.executeConanCommand(ConanCommand.source));
        this.registerCommand("vsconan.conan.package", () => this.executeConanCommand(ConanCommand.package));
        this.registerCommand("vsconan.conan.package.export", () => this.executeConanCommand(ConanCommand.packageExport));
        this.registerCommand("vsconan.config.global.create", () => this.createGlobalConfig());
        this.registerCommand("vsconan.config.global.open", () => this.openGlobalConfig());
        this.registerCommand("vsconan.config.workspace.create", () => this.createWorkspaceConfig());
        this.registerCommand("vsconan.config.workspace.open", () => this.openWorkspaceConfig());
    }

    private createGlobalConfig() {
        if (!fs.existsSync(utils.vsconan.getGlobalConfigPath())) {
            // Initial the global area even it just needs to create the configuration file
            utils.vsconan.initializeGlobalArea();
            vscode.window.showInformationMessage("Global configuration file has been created.");

            // Opening the file after being created
            utils.editor.openFileInEditor(utils.vsconan.getGlobalConfigPath());
        }
        else {
            vscode.window.showInformationMessage("Global configuration file already exists.");
        }
    }

    private openGlobalConfig() {
        if (fs.existsSync(utils.vsconan.getGlobalConfigPath())) {
            utils.editor.openFileInEditor(utils.vsconan.getGlobalConfigPath());
        }
        else {
            vscode.window.showErrorMessage("Unable to find the GLOBAL config file.");
        }
    }

    private createWorkspaceConfig() {
        let ws = utils.workspace.selectWorkspace();

        ws.then(result => {
            let vsconanPath = path.join(String(result), globals.constant.VSCONAN_FOLDER);
            if (!fs.existsSync(vsconanPath)) {
                fs.mkdirSync(vsconanPath);
            }

            let configFilePath = path.join(vsconanPath, globals.constant.CONFIG_FILE);
            if (fs.existsSync(configFilePath)) {
                vscode.window.showInformationMessage("Config file already exists in the workspace.");
            }
            else {
                utils.vsconan.config.createInitialWorkspaceConfig(vsconanPath);

                // Open configuration file after being created
                utils.editor.openFileInEditor(configFilePath);
            }
        }).catch(reject => {
            vscode.window.showInformationMessage("Cannot create config file. No workspace detected.");
        });
    }

    private openWorkspaceConfig() {
        let ws = utils.workspace.selectWorkspace();

        ws.then(async result => {
            if ((result !== undefined) && (result !== "")) {
                utils.editor.openFileInEditor(path.join(result!, globals.constant.VSCONAN_FOLDER, globals.constant.CONFIG_FILE));
            }
            else {
                vscode.window.showErrorMessage("Unable to find the config file.");
            }
        });
    }

    /**
     * Function to execute the selected Conan command
     * Since the flow of conan commands is similar, the flow of execution will be grouped within this function
     * Which command needs to be executed is determined using ENUM ConanCommand
     * 
     * @param cmdType Enumeration type to determine which command to be executed
     * @param channelVSConan VS Code channel to print the output of command
     * @returns <void>
     */
    private executeConanCommand(cmdType: ConanCommand): void {
        // The flow of following commands is the same by selecting the workspace first
        // Check the configuration and executed pre selected command based on this function argument
        let ws = utils.workspace.selectWorkspace();

        ws.then(wsPath => {

            let configPath = path.join(wsPath!, globals.constant.VSCONAN_FOLDER, globals.constant.CONFIG_FILE);

            if (fs.existsSync(configPath)) {
                let configWorkspace = new ConfigWorkspace();
                let configText = fs.readFileSync(configPath, 'utf8');
                configWorkspace = JSON.parse(configText);
                switch (+cmdType) {
                    case ConanCommand.create: {
                        CommandExecutor.executeCommandConanCreate(wsPath!, configWorkspace.python, configWorkspace.commandContainer.create, this.outputChannel);
                        break;
                    }
                    case ConanCommand.install: {
                        CommandExecutor.executeCommandConanInstall(wsPath!, configWorkspace.python, configWorkspace.commandContainer.install, this.outputChannel);
                        break;
                    }
                    case ConanCommand.build: {
                        CommandExecutor.executeCommandConanBuild(wsPath!, configWorkspace.python, configWorkspace.commandContainer.build, this.outputChannel);
                        break;
                    }
                    case ConanCommand.source: {
                        CommandExecutor.executeCommandConanSource(wsPath!, configWorkspace.python, configWorkspace.commandContainer.source, this.outputChannel);
                        break;
                    }
                    case ConanCommand.package: {
                        CommandExecutor.executeCommandConanPackage(wsPath!, configWorkspace.python, configWorkspace.commandContainer.pkg, this.outputChannel);
                        break;
                    }
                    case ConanCommand.packageExport: {
                        CommandExecutor.executeCommandConanPackageExport(wsPath!, configWorkspace.python, configWorkspace.commandContainer.pkgExport, this.outputChannel);
                        break;
                    }
                }
            }
            else {
                vscode.window.showWarningMessage(`Unable to find configuration file in the workspace '${wsPath}'`);
            }
        });
    }
}