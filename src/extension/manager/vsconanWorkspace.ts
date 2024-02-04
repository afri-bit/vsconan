import * as fs from "fs";
import * as path from "path";
import * as vscode from 'vscode';
import { ConanAPIManager } from '../../conans/api/conanAPIManager';
import { CommandBuilder } from "../../conans/command/commandBuilder";
import { CommandBuilderFactory } from "../../conans/command/commandBuilderFactory";
import { ConfigCommand, ConfigCommandBuild, ConfigCommandCreate, ConfigCommandInstall, ConfigCommandPackage, ConfigCommandPackageExport, ConfigCommandSource } from '../../conans/command/configCommand';
import { ConfigWorkspace } from '../../conans/workspace/configWorkspace';
import * as constants from "../../utils/constants";
import * as utils from '../../utils/utils';
import { ConanProfileConfiguration } from "../settings/model";
import { SettingsPropertyManager } from "../settings/settingsPropertyManager";
import { ExtensionManager } from "./extensionManager";


enum ConanCommand {
    create,
    install,
    build,
    source,
    package,
    packageExport
}

interface ConfigCommandQuickPickItem extends vscode.QuickPickItem {
    index: number;
}

/**
 * Class to manage conan workspace extension
 */
export class VSConanWorkspaceManager extends ExtensionManager {
    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private conanApiManager: ConanAPIManager;
    private settingsPropertyManager: SettingsPropertyManager;

    private statusBarConanVersion: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    /**
     * Create the conan workspace manager
     * @param context The context of the extension
     * @param outputChannel Output channel of the extension
     * @param conanApi Conan API
     */
    public constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel,
        conanApiManager: ConanAPIManager,
        settingsPropertyManager: SettingsPropertyManager) {

        super();

        this.context = context;
        this.outputChannel = outputChannel;
        this.conanApiManager = conanApiManager;
        this.settingsPropertyManager = settingsPropertyManager;

        this.registerCommand("vsconan.conan.create", () => this.executeConanCommand(ConanCommand.create));
        this.registerCommand("vsconan.conan.install", () => this.executeConanCommand(ConanCommand.install));
        this.registerCommand("vsconan.conan.build", () => this.executeConanCommand(ConanCommand.build));
        this.registerCommand("vsconan.conan.source", () => this.executeConanCommand(ConanCommand.source));
        this.registerCommand("vsconan.conan.package", () => this.executeConanCommand(ConanCommand.package));
        this.registerCommand("vsconan.conan.package.export", () => this.executeConanCommand(ConanCommand.packageExport));
        this.registerCommand("vsconan.conan.editable.add", () => this.addEditablePackage());
        this.registerCommand("vsconan.conan.editable.remove", () => this.removeEditablePackage());
        this.registerCommand("vsconan.config.workspace.create", () => this.createWorkspaceConfig());
        this.registerCommand("vsconan.config.workspace.open", () => this.openWorkspaceConfig());
        this.registerCommand("vsconan.conan.profile.switch", () => this.switchConanProfile());

        this.initStatusBarConanVersion();

    }

    public refresh() {
        this.updateStatusBar();
    }

    private initStatusBarConanVersion() {
        this.updateStatusBar();

        this.statusBarConanVersion.command = "vsconan.conan.profile.switch";
        this.statusBarConanVersion.show();
        this.context.subscriptions.push(this.statusBarConanVersion);
    }

    private updateStatusBar() {
        let selectedProfile: string | undefined = this.settingsPropertyManager.getSelectedConanProfile();
        let selectedProfileObject: ConanProfileConfiguration | undefined = this.settingsPropertyManager.getConanProfileObject(selectedProfile!);

        if (selectedProfileObject && selectedProfileObject.isValid()) {
            this.statusBarConanVersion.text = `$(extensions) VSConan | conan${selectedProfileObject.conanVersion} - ${selectedProfile}`;
            this.statusBarConanVersion.color = "";
        }
        else {
            this.statusBarConanVersion.text = `$(extensions) VSConan | -`;
            this.statusBarConanVersion.color = "#FF3333";
        }
    }

    /**
     * Method to switch conan profile
     */
    private switchConanProfile() {
        // Create drop down menu for switch conan version
        // This function will change the conan version, which means it will change the entire

        // Picking the conan workspace after filtering the workspace into conan workspace
        const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();

        let profileList: Array<string> = this.settingsPropertyManager.getListOfConanProfiles();

        let quickPickItems = [];

        for (let i = 0; i < profileList.length; i++) {

            let profileObject: ConanProfileConfiguration | undefined = this.settingsPropertyManager.getConanProfileObject(profileList[i]);

            quickPickItems.push({
                label: profileList[i],
                description: `Conan Version ${profileObject?.conanVersion}`,
                detail: profileObject?.conanExecutionMode,
                index: i,
                conanVersion: profileObject?.conanVersion,
            });
        }

        quickPickItems.map(label => ({ label }));
        quickPick.items = quickPickItems;

        const wsChoice = vscode.window.showQuickPick(quickPickItems);

        wsChoice.then(result => {
            if (result) {
                this.settingsPropertyManager.updateConanProfile(result?.label);
            }
        });
    }

    /**
     * Create a config file in the selected workspace
     */
    private createWorkspaceConfig() {
        let ws = utils.workspace.selectWorkspace();

        ws.then(result => {
            let vsconanPath = path.join(String(result), constants.VSCONAN_FOLDER);
            if (!fs.existsSync(vsconanPath)) {
                fs.mkdirSync(vsconanPath);
            }

            let configFilePath = path.join(vsconanPath, constants.CONFIG_FILE);
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

    /**
     * Open configuration file for selected workspace in the VS Code
     */
    private openWorkspaceConfig() {
        let ws = utils.workspace.selectWorkspace();

        ws.then(async result => {
            if ((result !== undefined) && (result !== "")) {
                utils.editor.openFileInEditor(path.join(result!, constants.VSCONAN_FOLDER, constants.CONFIG_FILE));
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
     */
    private executeConanCommand(cmdType: ConanCommand): void {
        // The flow of following commands is the same by selecting the workspace first
        // Check the configuration and executed pre selected command based on this function argument
        let ws = utils.workspace.selectWorkspace();

        ws.then(wsPath => {

            let configPath = path.join(wsPath!, constants.VSCONAN_FOLDER, constants.CONFIG_FILE);

            if (fs.existsSync(configPath)) {
                let configWorkspace = new ConfigWorkspace();
                let configText = fs.readFileSync(configPath, 'utf8');
                configWorkspace = JSON.parse(configText);

                let conanCommand = "";
                let commandBuilder: CommandBuilder | undefined;
                let conanVersion: string | null = "";

                // Get current profile
                let currentConanProfile = this.settingsPropertyManager.getSelectedConanProfile();

                if (currentConanProfile && this.settingsPropertyManager.isProfileValid(currentConanProfile!)) {
                    conanVersion = this.settingsPropertyManager.getConanVersionOfProfile(currentConanProfile!);
                    commandBuilder = CommandBuilderFactory.getCommandBuilder(conanVersion!);

                    let conanProfileObject: ConanProfileConfiguration | undefined = this.settingsPropertyManager.getConanProfileObject(currentConanProfile!);

                    if (conanProfileObject?.conanExecutionMode === "pythonInterpreter" && conanProfileObject.conanPythonInterpreter) {
                        conanCommand = `${conanProfileObject.conanPythonInterpreter} -m conans.conan`;
                    }
                    else if (conanProfileObject?.conanExecutionMode === "conanExecutable" && conanProfileObject.conanExecutable) {
                        conanCommand = `${conanProfileObject.conanExecutable}`;
                    }
                    else {
                        vscode.window.showErrorMessage("Empty Conan Command");
                        return;
                    }
                }
                else {
                    vscode.window.showErrorMessage("");
                    return;
                }

                switch (+cmdType) {
                    case ConanCommand.create: {
                        this.executeCommandConanCreate(wsPath!, conanCommand, commandBuilder!, configWorkspace.commandContainer.create);
                        break;
                    }
                    case ConanCommand.install: {
                        this.executeCommandConanInstall(wsPath!, conanCommand, commandBuilder!, configWorkspace.commandContainer.install);
                        break;
                    }
                    case ConanCommand.build: {
                        this.executeCommandConanBuild(wsPath!, conanCommand, commandBuilder!, configWorkspace.commandContainer.build);
                        break;
                    }
                    case ConanCommand.source: {
                        this.executeCommandConanSource(wsPath!, conanCommand, commandBuilder!, configWorkspace.commandContainer.source);
                        break;
                    }
                    case ConanCommand.package: {
                        if (conanVersion === "2") {
                            vscode.window.showErrorMessage("This command doesn't work on Conan 2");
                            break;
                        }

                        this.executeCommandConanPackage(wsPath!, conanCommand, commandBuilder!, configWorkspace.commandContainer.pkg);
                        break;
                    }
                    case ConanCommand.packageExport: {
                        this.executeCommandConanPackageExport(wsPath!, conanCommand, commandBuilder!, configWorkspace.commandContainer.pkgExport);
                        break;
                    }
                }
            }
            else {
                vscode.window.showWarningMessage(`Unable to find configuration file in the workspace '${wsPath}'`);
            }
        });
    }

    /**
     * Helper method to get the index of selected command.
     * This method basically will pop up quick pick window to select configuration where the user has to choose.
     * @param configList List of configuration 
     * @returns Index of selected configuration | undefined on error or no selection
     */
    private getCommandConfigIndex(configList: Array<ConfigCommand>): Promise<number | undefined> {
        return new Promise<number | undefined>(async (resolve, reject) => {
            if (configList !== undefined) {
                const quickPick = vscode.window.createQuickPick<ConfigCommandQuickPickItem>();
                let quickPickItems = [];
                for (let i = 0; i < configList!.length; i++) {
                    quickPickItems.push({
                        label: configList[i].name,
                        description: configList[i].description,
                        detail: configList[i].detail,
                        index: i
                    });
                }

                quickPickItems.map(label => ({ label }));
                quickPick.items = quickPickItems;

                const choice = await vscode.window.showQuickPick(quickPickItems);

                if (choice) {
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

    /**
     * Execute the 'conan create' command
     * @param wsPath Absolute path of the workspace
     * @param python Python interpreter (absolute path or predefined in the environment variables)
     * @param configList List of possible configurations
     */
    private executeCommandConanCreate(wsPath: string, conanCommand: string, commandBuilder: CommandBuilder, configList: Array<ConfigCommandCreate>) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index !== undefined) {
                let selectedConfig = configList[index];

                let cmd = commandBuilder.buildCommandCreate(wsPath, selectedConfig);

                if (cmd) {
                    try {
                        utils.vsconan.cmd.executeCommand(`${conanCommand} ${cmd}`, this.outputChannel);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage((err as Error).message);
                    }
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan CREATE command!");
                }
            }
        });
    }

    /**
     * Execute the 'conan install' command
     * @param wsPath Absolute path of the workspace
     * @param python Python interpreter (absolute path or predefined in the environment variables)
     * @param configList List of possible configurations
     */
    private executeCommandConanInstall(wsPath: string, conanCommand: string, commandBuilder: CommandBuilder, configList: Array<ConfigCommandInstall>) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index !== undefined) {
                let selectedConfig = configList[index];
                let cmd = commandBuilder.buildCommandInstall(wsPath, selectedConfig);

                if (cmd !== undefined) {
                    try {
                        utils.vsconan.cmd.executeCommand(`${conanCommand} ${cmd}`, this.outputChannel);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage((err as Error).message);
                    }
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan INSTALL command!");
                }
            }
        });
    }

    /**
     * Execute the 'conan build' command
     * @param wsPath Absolute path of the workspace
     * @param python Python interpreter (absolute path or predefined in the environment variables)
     * @param configList List of possible configurations
     */
    private executeCommandConanBuild(wsPath: string, conanCommand: string, commandBuilder: CommandBuilder, configList: Array<ConfigCommandBuild>) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index !== undefined) {
                let selectedConfig = configList[index];
                let cmd = commandBuilder.buildCommandBuild(wsPath, selectedConfig);

                if (cmd !== undefined) {
                    try {
                        utils.vsconan.cmd.executeCommand(`${conanCommand} ${cmd}`, this.outputChannel);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage((err as Error).message);
                    }
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan BUILD command!");
                }
            }
        });
    }

    /**
     * Execute the 'conan source' command
     * @param wsPath Absolute path of the workspace
     * @param python Python interpreter (absolute path or predefined in the environment variables)
     * @param configList List of possible configurations
     */
    private executeCommandConanSource(wsPath: string, conanCommand: string, commandBuilder: CommandBuilder, configList: Array<ConfigCommandSource>) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index !== undefined) {
                let selectedConfig = configList[index];
                let cmd = commandBuilder.buildCommandSource(wsPath, selectedConfig);

                if (cmd !== undefined) {
                    try {
                        utils.vsconan.cmd.executeCommand(`${conanCommand} ${cmd}`, this.outputChannel);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage((err as Error).message);
                    }
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan SOURCE command!");
                }
            }
        });
    }

    /**
     * Execute the 'conan package' command
     * @param wsPath Absolute path of the workspace
     * @param python Python interpreter (absolute path or predefined in the environment variables)
     * @param configList List of possible configurations
     */
    private executeCommandConanPackage(wsPath: string, conanCommand: string, commandBuilder: CommandBuilder, configList: Array<ConfigCommandPackage>) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index !== undefined) {
                let selectedConfig = configList[index];
                let cmd = commandBuilder.buildCommandPackage(wsPath, selectedConfig);

                if (cmd !== undefined) {
                    try {
                        utils.vsconan.cmd.executeCommand(`${conanCommand} ${cmd}`, this.outputChannel);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage((err as Error).message);
                    }
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan PACKAGE command!");
                }
            }
        });
    }

    /**
     * Execute the 'conan export-pkg' command
     * @param wsPath Absolute path of the workspace
     * @param python Python interpreter (absolute path or predefined in the environment variables)
     * @param configList List of possible configurations
     */
    private executeCommandConanPackageExport(wsPath: string, conanCommand: string, commandBuilder: CommandBuilder, configList: Array<ConfigCommandPackageExport>) {
        let promiseIndex = this.getCommandConfigIndex(configList);

        promiseIndex.then(index => {
            if (index !== undefined) {
                let selectedConfig = configList[index];
                let cmd = commandBuilder.buildCommandPackageExport(wsPath, selectedConfig);

                if (cmd !== undefined) {
                    try {
                        utils.vsconan.cmd.executeCommand(`${conanCommand} ${cmd}`, this.outputChannel);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage((err as Error).message);
                    }
                }
                else {
                    vscode.window.showErrorMessage("Unable to execute conan PACKAGE EXPORT command!");
                }
            }
        });
    }

    private async addEditablePackage() {
        // List of workspace
        let wsList = vscode.workspace.workspaceFolders;

        let conanWorkspaceList: Array<string> = [];

        if (wsList !== undefined) {
            try {
                // Filtering workspace into conan workspace
                // Minimize options for the quickpick
                for (let ws of wsList!) {
                    if (utils.conan.isFolderConanProject(ws.uri.fsPath)) {
                        conanWorkspaceList.push(ws.uri.fsPath);
                    }
                }

                // Picking the conan workspace after filtering the workspace into conan workspace
                const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();
                let quickPickItems = [];
                for (let i = 0; i < conanWorkspaceList.length; i++) {
                    quickPickItems.push({
                        label: conanWorkspaceList[i],
                        description: "",
                        detail: "",
                        index: i
                    });
                }
                quickPickItems.map(label => ({ label }));
                quickPick.items = quickPickItems;

                const wsChoice = await vscode.window.showQuickPick(quickPickItems);

                if (wsChoice) {
                    // Get the name and version in the recipe
                    let name = this.conanApiManager.conanApi.getRecipeAttribute(wsChoice!.label, "name");
                    let version = this.conanApiManager.conanApi.getRecipeAttribute(wsChoice!.label, "version");
                    let packageInformation = `${name}/${version}`;

                    // Input for 'user' and 'channel'
                    // Initial value is defined as 'undefined' to put the logic at the end.
                    // Even there is no user and channel it should be at least an empty string, not 'undefined'
                    let user = undefined;
                    let channel = undefined;

                    const userInput = await vscode.window.showInputBox({
                        title: `Editable - Select 'user' for package '${packageInformation}'`,
                        validateInput: text => {
                            if (text.includes(" ")) {
                                return 'Whitespace is not allowed.';
                            }
                            else {
                                return null;
                            }
                        }
                    });

                    user = userInput;

                    // Checking if user cancel the process
                    // Undefined means that user cancels the process
                    if (user !== "" && user !== undefined) {
                        const channelInput = await vscode.window.showInputBox({
                            title: `Editable - Select 'channel' for package '${packageInformation}'`,
                            validateInput: text => {
                                if (text.includes(" ")) {
                                    return 'Whitespace is not allowed.';
                                }
                                else if (text === "") {
                                    return "Enter a name for the channel";
                                }
                                else {
                                    return null;
                                }
                            }
                        });

                        channel = channelInput!;
                    }
                    // Put channel to empty string if the user is not defined. Both of them have to be existing.
                    else if (user === "" && user !== undefined) {
                        channel = "";
                    }

                    // Last step is to put the selected package to editable mode with all the given information
                    // Make sure that user and channel are string, not 'undefined', and then we can execute the conan API command to add the editable package
                    if (user !== undefined && channel !== undefined) {

                        const layout = await vscode.window.showInputBox({
                            title: `Editable - Select 'layout' for package '${packageInformation}'`
                        });

                        if (layout !== undefined) {
                            this.conanApiManager.conanApi.addEditablePackage(wsChoice.label, packageInformation, user, channel, layout);
                            vscode.window.showInformationMessage(`Editable package '${packageInformation}' with user '${user}' and channel '${channel}' has been added.`);
                        }

                    }
                }
            }
            catch (err) {
                vscode.window.showErrorMessage((err as Error).message);
            }
        }
    }

    private async removeEditablePackage() {
        try {
            let editablePackageRecipes = this.conanApiManager.conanApi.getEditablePackageRecipes();

            const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();
            let quickPickItems = [];
            for (let i = 0; i < editablePackageRecipes.length; i++) {
                quickPickItems.push({
                    label: editablePackageRecipes![i].name,
                    description: "",
                    detail: editablePackageRecipes![i].path,
                    index: i
                });
            }
            quickPickItems.map(label => ({ label }));
            quickPick.items = quickPickItems;

            const choice = await vscode.window.showQuickPick(quickPickItems);

            if (choice) {
                this.conanApiManager.conanApi.removeEditablePackageRecipe(choice.label);
                vscode.window.showInformationMessage(`Editable package ${choice?.label} has been removed.`);
            }
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }
}