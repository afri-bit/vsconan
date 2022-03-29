import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as utils from "./utils/utils";
import * as globals from "./globals";
import { CommandExecutor } from "./cmd/exec/commandExecutor";
import {
    CommandContainer, ConfigCommand, ConfigCommandBuild, ConfigCommandCreate,
    ConfigCommandInstall, ConfigCommandPackage, ConfigCommandPackageExport,
    ConfigCommandSource
} from "./config/configCommand";
import { ConfigWorkspace } from "./config/configWorkspace";
import { ConanPackageItem, ConanPackageNodeProvider } from "./ui/treeview/conanPackageProvider";
import { ConanProfileItem, ConanProfileNodeProvider } from "./ui/treeview/conanProfileProvider";
import { ConanRecipeItem, ConanRecipeNodeProvider } from "./ui/treeview/conanRecipeProvider";
import { ConanRemoteItem, ConanRemoteNodeProvider } from "./ui/treeview/conanRemoteProvider";
import { ConfigGlobal, ConfigGlobalExplorer, ConfigGlobalGeneral } from "./config/configGlobal";
import { ConanAPI } from "./api/conan/conanAPI";

enum ConanCommand {
    CREATE,
    INSTALL,
    BUILD,
    SOURCE,
    PACKAGE,
    PACKAGE_EXPORT
}

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    // Create VSConan extension channel
    // This channel is to show the command line outputs specifically for this extension
    var channelVSConan = vscode.window.createOutputChannel("VSConan");

    // ----- Global Area Initialization -----
    // Global Area - The global area is stored under home folder ($HOME/.vsconan)
    //               This area has lower priority then the workspace area
    // Global Area - To work for the API a extension folder will created in the home directory
    initializeGlobalArea();

    // ========== Registering the treeview for the extension
    const conanRecipeNodeProvider = new ConanRecipeNodeProvider();
    let treeViewConanRecipe = vscode.window.createTreeView('vsconan-explorer.treeview.recipe', {
        treeDataProvider: conanRecipeNodeProvider
    });

    const conanProfileNodeProvider = new ConanProfileNodeProvider();
    let treeViewConanProfile = vscode.window.createTreeView('vsconan-explorer.treeview.profile', {
        treeDataProvider: conanProfileNodeProvider
    });

    const conanPackageNodeProvider = new ConanPackageNodeProvider();
    let treeViewConanPackage = vscode.window.createTreeView('vsconan-explorer.treeview.package', {
        treeDataProvider: conanPackageNodeProvider
    });

    const conanRemoteNodeProvider = new ConanRemoteNodeProvider();
    let treeViewConanRemote = vscode.window.createTreeView('vsconan-explorer.treeview.remote', {
        treeDataProvider: conanRemoteNodeProvider
    });

    // Check if it starts with workspace
    // To check whether its workspace or not is to determine if the function "getWorkspaceFolder" returns undefined or a path
    // If user only open anyfile without a folder (as editor) this the workspace path will return "undefined"
    // This condition will be entered if vs code used as a workspace
    let wsList = vscode.workspace.workspaceFolders;

    // If it starts with workspace, there should be at least one element in the array of workspace folder
    if (wsList != undefined) {

        for (let i = 0; i < wsList.length; i++) {

            let wsPath = wsList[i].uri.fsPath;
            let configPath = path.join(wsPath, globals.constant.VSCONAN_FOLDER, globals.constant.CONFIG_FILE)

            if (isFolderConanProject(wsPath) && !fs.existsSync(configPath!)) {

                vscode.window
                    .showInformationMessage(`The workspace '${wsList[i].name}' is detected as a conan project. Do you want to configure this workspace?`, ...["Yes", "Not Now"])
                    .then((answer) => {
                        if (answer === "Yes") {

                            // .vsconan path in the workspace
                            let vsconanPath = path.join(wsPath, globals.constant.VSCONAN_FOLDER);
                            if (!fs.existsSync(vsconanPath)) {
                                fs.mkdirSync(vsconanPath!);
                            }

                            // Create a default config file
                            createInitialWorkspaceConfig(vsconanPath);
                        }
                    });
            }
        }
    }

    // ========== Extension Commands Registration Section 
    // ========== Conan Workflow Command Registration
    let commandConanCreate = vscode.commands.registerCommand("vsconan.conan.create", () => {
        executeConanCommand(ConanCommand.CREATE, channelVSConan);
    });

    let commandConanInstall = vscode.commands.registerCommand("vsconan.conan.install", (cmd) => {
        executeConanCommand(ConanCommand.INSTALL, channelVSConan);
    });

    let commandConanBuild = vscode.commands.registerCommand("vsconan.conan.build", () => {
        executeConanCommand(ConanCommand.BUILD, channelVSConan);
    });

    let commandConanSource = vscode.commands.registerCommand("vsconan.conan.source", () => {
        executeConanCommand(ConanCommand.SOURCE, channelVSConan);
    });

    let commandConanPackage = vscode.commands.registerCommand("vsconan.conan.package", () => {
        executeConanCommand(ConanCommand.PACKAGE, channelVSConan);
    });

    let commandConanExportPackage = vscode.commands.registerCommand("vsconan.conan.package.export", () => {
        executeConanCommand(ConanCommand.PACKAGE_EXPORT, channelVSConan);
    });

    // ========== Global Configuration Command Registration
    let commandConfigGlobalCreate = vscode.commands.registerCommand("vsconan.config.global.create", () => {
        if (!fs.existsSync(utils.vsconan.getGlobalConfigPath())) {
            // Initial the global area even it just needs to create the configuration file
            initializeGlobalArea();
            vscode.window.showInformationMessage("Global configuration file has been created.");

            // Opening the file after being created
            utils.editor.openFileInEditor(utils.vsconan.getGlobalConfigPath());
        }
        else {
            vscode.window.showInformationMessage("Global configuration file already exists.");
        }
    });

    let commandConfigGlobalOpen = vscode.commands.registerCommand("vsconan.config.global.open", () => {
        if (fs.existsSync(utils.vsconan.getGlobalConfigPath())) {
            utils.editor.openFileInEditor(utils.vsconan.getGlobalConfigPath());
        }
        else {
            vscode.window.showErrorMessage("Unable to find the GLOBAL config file.");
        }
    });

    // ========== Workspace Configuration Command Registration
    let commandConfigWorkspaceCreate = vscode.commands.registerCommand("vsconan.config.workspace.create", () => {
        let ws = selectWorkspace();

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
                createInitialWorkspaceConfig(vsconanPath);

                // Open configuration file after being created
                utils.editor.openFileInEditor(configFilePath);
            }
        }).catch(reject => {
            vscode.window.showInformationMessage("Cannot create config file. No workspace detected.");
        });
    });

    let commandConfigWorkspaceOpen = vscode.commands.registerCommand("vsconan.config.workspace.open", () => {
        let ws = selectWorkspace();

        ws.then(async result => {
            if ((result != undefined) && (result != "")) {
                utils.editor.openFileInEditor(path.join(result!, globals.constant.VSCONAN_FOLDER, globals.constant.CONFIG_FILE));
            }
            else {
                vscode.window.showErrorMessage("Unable to find the config file.");
            }
        });
    });

    // ========== Treeview RECIPE Command Registration
    // Command on selecting a recipe. This will show list of the package binary
    let commandRecipeRefresh = vscode.commands.registerCommand("vsconan-explorer.treeview.recipe.refresh", () => {
        conanRecipeNodeProvider.refresh();
        conanPackageNodeProvider.refresh(treeViewConanRecipe.selection[0].label);
    });

    let commandRecipeSelected = vscode.commands.registerCommand("vsconan-explorer.item.recipe.selected", () => {
        conanPackageNodeProvider.refresh(treeViewConanRecipe.selection[0].label);
    });

    let commandRecipeInformation = vscode.commands.registerCommand("vsconan-explorer.item.recipe.option.information", (node: ConanRecipeItem) => {
        // TODO: Show information from the selected recipe
    });

    let commandRecipeOpenFolder = vscode.commands.registerCommand("vsconan-explorer.item.recipe.option.open.explorer", (node: ConanRecipeItem) => {
        let python = utils.config.getExplorerPython();

        try {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(ConanAPI.getRecipePath(node.label, python)!))
        }
        catch (err: any) {
            vscode.window.showErrorMessage(err);
        }
    });

    let commandRecipeOpenVSCode = vscode.commands.registerCommand("vsconan-explorer.item.recipe.option.open.vscode", (node: ConanRecipeItem) => {
        let python = utils.config.getExplorerPython();

        if (python != undefined) {
            try {
                let packagePath = ConanAPI.getRecipePath(node.label, python);
                vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(packagePath!), true);
            }
            catch (err: any) {
                vscode.window.showErrorMessage("Error on opening folder in VS Code. Check the configuration file.");
            }
        }
        else {
            vscode.window.showErrorMessage("Python Interpreter not defined.");
        }
    });

    let commandRecipeRemove = vscode.commands.registerCommand("vsconan-explorer.item.recipe.option.remove", (node: ConanRecipeItem) => {
        let python = utils.config.getExplorerPython();

        try {
            ConanAPI.removeRecipe(node.label, python);
            conanRecipeNodeProvider.refresh()
            conanPackageNodeProvider.refresh("");
        }
        catch (err: any) {
            vscode.window.showErrorMessage(err);
        }
    });

    // ========== Treeview PACKAGE Command Registration
    let commandPackageRefresh = vscode.commands.registerCommand("vsconan-explorer.treeview.package.refresh", () => {
        conanPackageNodeProvider.refresh(treeViewConanRecipe.selection[0].label);
    });

    let commandPackageInformation = vscode.commands.registerCommand("vsconan-explorer.item.package.option.information", (packageNode: ConanPackageItem) => {
        // TODO: Show information from the selected recipe
    });

    let commandPackageOpenFolder = vscode.commands.registerCommand("vsconan-explorer.item.package.option.open.explorer", (node: ConanPackageItem) => {
        let python = utils.config.getExplorerPython();

        try {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(ConanAPI.getPackagePath(treeViewConanRecipe.selection[0].label, node.label, python)!));
        }
        catch (err: any) {
            vscode.window.showErrorMessage(err);
        }
    });

    let commandPackageOpenVSCode = vscode.commands.registerCommand("vsconan-explorer.item.package.option.open.vscode", (node: ConanPackageItem) => {
        let python = utils.config.getExplorerPython();

        if (python != undefined) {
            try {
                let packagePath = ConanAPI.getPackagePath(treeViewConanRecipe.selection[0].label, node.label, python);
                vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(packagePath!), true);
            }
            catch (err: any) {
                vscode.window.showErrorMessage("Error on opening folder in VS Code. Check the configuration file.");
            }
        }
        else {
            vscode.window.showErrorMessage("Python Interpreter not defined.");
        }
    });

    let commandPackageRemove = vscode.commands.registerCommand("vsconan-explorer.item.package.option.remove", (node: ConanPackageItem) => {
        let python = utils.config.getExplorerPython();

        try {
            ConanAPI.removePackage(treeViewConanRecipe.selection[0].label, node.label, python);

            conanPackageNodeProvider.refresh(treeViewConanRecipe.selection[0].label);
        }
        catch (err: any) {
            vscode.window.showErrorMessage(err);
        }
    });

    // ========== Treeview PROFILE Command Registration
    let commandProfileRefresh = vscode.commands.registerCommand("vsconan-explorer.treeview.profile.refresh", () => {
        conanProfileNodeProvider.refresh();
    });

    let commandProfileEdit = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.edit", (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

        if (conanProfileList.includes(node.label)) {
            let python = utils.config.getExplorerPython();
            utils.editor.openFileInEditor(ConanAPI.getProfileFilePath(node.label, python)!);
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`)
        }
    });

    let commandProfileRemove = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.remove", (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

        if (conanProfileList.includes(node.label)) {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the profile '${node.label}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        let python = utils.config.getExplorerPython();

                        ConanAPI.removeProfile(node.label, python);

                        conanProfileNodeProvider.refresh();
                    }
                });
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`)
        }
    });

    let commandProfileOpenExplorer = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.open.explorer", (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

        if (conanProfileList.includes(node.label)) {

            let python = utils.config.getExplorerPython();

            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(ConanAPI.getProfileFilePath(node.label, python)!));
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`)
        }
    });

    let commandProfileRename = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.rename", async (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

        if (conanProfileList.includes(node.label)) {

            const newProfileName = await vscode.window.showInputBox({
                title: `Renaming profile ${node.label}. Enter a new name for the profile...`,
                placeHolder: node.label,
                validateInput: text => {
                    if ((text === node.label || conanProfileList.includes(text)) && text != "") {
                        return 'Enter a different name';
                    }
                    else if (text === "") {
                        return "Enter a new name";
                    }
                    else {
                        return null;
                    }
                }
            });

            if (newProfileName) {
                let python = utils.config.getExplorerPython();

                try {
                    ConanAPI.renameProfile(node.label, newProfileName, python);
                    conanProfileNodeProvider.refresh();
                }
                catch (err: any) {
                    vscode.window.showErrorMessage(err);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`)
        }
    });

    let commandProfileDuplicate = vscode.commands.registerCommand("vsconan-explorer.item.profile.option.duplicate", async (node: ConanProfileItem) => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

        if (conanProfileList.includes(node.label)) {

            const newProfileName = await vscode.window.showInputBox({
                title: `Duplicating profile ${node.label}. Enter a new name for the profile...`,
                placeHolder: node.label,
                validateInput: text => {
                    if ((text === node.label || conanProfileList.includes(text)) && text != "") {
                        return 'Enter a different name';
                    }
                    else if (text === "") {
                        return "Enter a new name";
                    }
                    else {
                        return null;
                    }
                }
            });

            if (newProfileName) {
                let python = utils.config.getExplorerPython();

                try {
                    ConanAPI.duplicateProfile(node.label, newProfileName, python);

                    // Refresh the treeview once again
                    conanProfileNodeProvider.refresh();
                }
                catch (err: any) {
                    vscode.window.showErrorMessage(err);
                }
            }
        }
        else {
            vscode.window.showErrorMessage(`Unable to find the profile with name '${node.label}'.`)
        }
    });

    let commandProfileAdd = vscode.commands.registerCommand("vsconan-explorer.treeview.profile.add", async () => {
        conanProfileNodeProvider.refresh();
        let conanProfileList = conanProfileNodeProvider.getChildrenString();

        const profileName = await vscode.window.showInputBox({
            title: "Create a new Profile. Enter the name of the profile...",
            validateInput: text => {
                if (conanProfileList.includes(text) && text != "") {
                    return 'Profile with this name already exists.';
                }
                else if (text === "") {
                    return "Enter a name for the profile...";
                }
                else {
                    return null;
                }
            }
        });

        if (profileName) {
            let python = utils.config.getExplorerPython();

            try {
                ConanAPI.createNewProfile(profileName, python);

                // Refresh the treeview once again
                conanProfileNodeProvider.refresh();
            }
            catch (err: any) {
                vscode.window.showErrorMessage(err);
            }
        }
    });

    // ========== Treeview REMOTE Command Registration
    let commandRemoteRefresh = vscode.commands.registerCommand("vsconan-explorer.treeview.remote.refresh", () => {
        conanRemoteNodeProvider.refresh();
    })

    let commandRemoteSelected = vscode.commands.registerCommand("vsconan.remote.selected", (node: ConanRemoteItem) => {
        // TODO: Open the remote JSON file in the editor
    });

    let commandRemoteRemove = vscode.commands.registerCommand("vsconan-explorer.item.remote.option.remove", (node: ConanRemoteItem) => {
        let python = utils.config.getExplorerPython();

        try {
            ConanAPI.removeRemote(node.label, python);

            conanRemoteNodeProvider.refresh();
        }
        catch (err: any) {
            vscode.window.showErrorMessage(err);
        }
    });

    context.subscriptions.push(commandConanCreate);
    context.subscriptions.push(commandConanInstall);
    context.subscriptions.push(commandConanBuild);
    context.subscriptions.push(commandConanSource);
    context.subscriptions.push(commandConanPackage);
    context.subscriptions.push(commandConanExportPackage);
    context.subscriptions.push(commandConfigGlobalCreate);
    context.subscriptions.push(commandConfigGlobalOpen);
    context.subscriptions.push(commandConfigWorkspaceCreate);
    context.subscriptions.push(commandConfigWorkspaceOpen);

    // Recipe
    context.subscriptions.push(commandRecipeRefresh);
    context.subscriptions.push(commandRecipeSelected);
    context.subscriptions.push(commandRecipeInformation);
    context.subscriptions.push(commandRecipeOpenFolder);
    context.subscriptions.push(commandRecipeOpenVSCode);
    context.subscriptions.push(commandRecipeRemove);

    // Package
    context.subscriptions.push(commandPackageRefresh);
    context.subscriptions.push(commandPackageInformation);
    context.subscriptions.push(commandPackageOpenFolder);
    context.subscriptions.push(commandPackageOpenVSCode);
    context.subscriptions.push(commandPackageRemove);

    // Profile
    context.subscriptions.push(commandProfileRefresh);
    context.subscriptions.push(commandProfileEdit);
    context.subscriptions.push(commandProfileRemove);
    context.subscriptions.push(commandProfileDuplicate);
    context.subscriptions.push(commandProfileAdd);
    context.subscriptions.push(commandProfileRename);
    context.subscriptions.push(commandProfileOpenExplorer);

    // Remote
    context.subscriptions.push(commandRemoteRefresh);
    context.subscriptions.push(commandRemoteSelected);
    context.subscriptions.push(commandRemoteRemove);
}

// this method is called when your extension is deactivated
export function deactivate() { }

/**
 * Function to execute the selected Conan command
 * Since the flow of conan commands is similar, the flow of execution will be grouped within this function
 * Which command needs to be executed is determined using ENUM ConanCommand
 * 
 * @param cmdType Enumeration type to determine which command to be executed
 * @param channelVSConan VS Code channel to print the output of command
 * @returns <void>
 */
function executeConanCommand(cmdType: ConanCommand, channelVSConan: any): void {
    // The flow of following commands is the same by selecting the workspace first
    // Check the configuration and executed pre selected command based on this function argument
    let ws = selectWorkspace();

    ws.then(wsPath => {

        let configPath = path.join(wsPath!, globals.constant.VSCONAN_FOLDER, globals.constant.CONFIG_FILE);

        if (fs.existsSync(configPath)) {
            let configWorkspace = new ConfigWorkspace();
            let configText = fs.readFileSync(configPath, 'utf8');
            configWorkspace = JSON.parse(configText);
            switch (+cmdType) {
                case ConanCommand.CREATE: {
                    CommandExecutor.executeCommandConanCreate(wsPath!, configWorkspace.python, configWorkspace.commandContainer.create, channelVSConan);
                    break;
                }
                case ConanCommand.INSTALL: {
                    CommandExecutor.executeCommandConanInstall(wsPath!, configWorkspace.python, configWorkspace.commandContainer.install, channelVSConan);
                    break;
                }
                case ConanCommand.BUILD: {
                    CommandExecutor.executeCommandConanBuild(wsPath!, configWorkspace.python, configWorkspace.commandContainer.build, channelVSConan);
                    break;
                }
                case ConanCommand.SOURCE: {
                    CommandExecutor.executeCommandConanSource(wsPath!, configWorkspace.python, configWorkspace.commandContainer.source, channelVSConan);
                    break;
                }
                case ConanCommand.PACKAGE: {
                    CommandExecutor.executeCommandConanPackage(wsPath!, configWorkspace.python, configWorkspace.commandContainer.pkg, channelVSConan);
                    break;
                }
                case ConanCommand.PACKAGE_EXPORT: {
                    CommandExecutor.executeCommandConanPackageExport(wsPath!, configWorkspace.python, configWorkspace.commandContainer.pkgExport, channelVSConan);
                    break;
                }
            }
        }
    });
}

/**
 * Function to create initial global configuration file at the home folder of VSConan
 * VSConan home folder is located at ~/.vsconan
 */
function createInitialGlobalConfig() {
    let configGlobal = new ConfigGlobal(new ConfigGlobalGeneral("python"), new ConfigGlobalExplorer("python"));
    configGlobal.writeToFile(utils.vsconan.getGlobalConfigPath());
}

/**
 * Function to create initial workspace configuration file with all conan commands
 * registered in the config files
 * 
 * @param configPath Path where the config file is to be stored
 * 
 */
function createInitialWorkspaceConfig(configPath: string) {
    let configWorkspace = new ConfigWorkspace("python", new CommandContainer(
        [new ConfigCommandCreate()],
        [new ConfigCommandInstall()],
        [new ConfigCommandBuild()],
        [new ConfigCommandSource()],
        [new ConfigCommandPackage()],
        [new ConfigCommandPackageExport()]
    ));

    configWorkspace.writeToFile(path.join(configPath, globals.constant.CONFIG_FILE));
}

function isFolderConanProject(ws: string): boolean {
    let ret: boolean = false;

    let conanpy: string = path.join(ws, "conanfile.py");
    let conantxt: string = path.join(ws, "conanfile.txt");

    if (fs.existsSync(conanpy) || fs.existsSync(conantxt)) {
        ret = true;
    }

    return ret;
}

/**
 * Function to show quick pick to get a workspace path.
 * This can list the multiple workspaces and user can select it using a quick pick menu. 
 * 
 * @returns Promise<string | undefined> Selected workspace path or undefined
 */
async function selectWorkspace(): Promise<string | undefined> {
    let wsList = vscode.workspace.workspaceFolders;

    return new Promise<string | undefined>(async (resolve, reject) => {
        if (wsList != undefined) {
            if (wsList!.length > 1) { // Workspace contains multiple folders
                const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();
                let quickPickItems = []
                for (let i = 0; i < wsList!.length; i++) {
                    quickPickItems.push({
                        label: wsList![i].name,
                        description: wsList![i].uri.fsPath,
                        detail: "",
                        index: i
                    })
                }
                quickPickItems.map(label => ({ label }));
                quickPick.items = quickPickItems;

                const choice = await vscode.window.showQuickPick(quickPickItems);

                if (choice) {
                    // Returning the filesystem path
                    return resolve(choice.description);
                }
                else {
                    return resolve(undefined);
                }
            }
            else if (wsList!.length == 1) {
                // Choose the only path it has
                return resolve(wsList![0].uri.fsPath);
            }
        }
        else {
            return reject(undefined);
        }
    });
}

/**
 * Function to initialize the global area such as creating .vsconan folder
 * in the HOME folder, creating a temporary folder and creating a default global
 * config file
 */
function initializeGlobalArea() {
    if (!fs.existsSync(utils.vsconan.getVSConanHomeDir())) {
        fs.mkdirSync(utils.vsconan.getVSConanHomeDir());
    }

    // Check if global config file is available, otherwise create a new one with default parameters
    if (!fs.existsSync(utils.vsconan.getGlobalConfigPath())) {
        let configGlobal = new ConfigGlobal(new ConfigGlobalGeneral("python"), new ConfigGlobalExplorer("python"));
        configGlobal.writeToFile(utils.vsconan.getGlobalConfigPath());
    }

    //  Additionally the temp folder will created to store temporary files
    if (!fs.existsSync(utils.vsconan.getVSConanHomeDirTemp())) {
        fs.mkdirSync(utils.vsconan.getVSConanHomeDirTemp());
    }
}
