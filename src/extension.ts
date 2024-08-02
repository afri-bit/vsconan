import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as constants from "./utils/constants";
import * as utils from "./utils/utils";

import { ConanAPIManager } from "./conans/api/conanAPIManager";
import { ConanCacheExplorerManager } from "./extension/manager/explorer/conanCache";
import { ConanProfileExplorerManager } from "./extension/manager/explorer/conanProfile";
import { ConanRemoteExplorerManager } from "./extension/manager/explorer/conanRemote";
import { VSConanWorkspaceManager } from "./extension/manager/vsconanWorkspace";
import { SettingsManager } from "./extension/settings/settingsManager";
import { SettingsPropertyManager } from "./extension/settings/settingsPropertyManager";
import { ConanPackageNodeProvider } from "./extension/ui/treeview/conanPackageProvider";
import { ConanPackageRevisionNodeProvider } from "./extension/ui/treeview/conanPackageRevisionProvider";
import { ConanProfileNodeProvider } from "./extension/ui/treeview/conanProfileProvider";
import { ConanRecipeNodeProvider } from "./extension/ui/treeview/conanRecipeProvider";
import { ConanRemoteNodeProvider } from "./extension/ui/treeview/conanRemoteProvider";

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    // Create VSConan extension channel
    // This channel is to show the command line outputs specifically for this extension
    var channelVSConan = vscode.window.createOutputChannel("VSConan");

    // ========== Global Area Initialization
    // Global Area - The global area is stored under home folder ($HOME/.vsconan)
    //               This area has lower priority then the workspace area
    // Global Area - To work for the API a extension folder will created in the home directory
    utils.vsconan.initializeGlobalArea();

    // ========== Managing configuration
    initContextState(context);

    // Create Configuration Manager object to store and get some configuration
    let settingsPropertyManager = new SettingsPropertyManager(context, channelVSConan);

    let conanApiManager: ConanAPIManager = new ConanAPIManager();

    // ========== Registering the treeview for the extension
    const conanRecipeNodeProvider = new ConanRecipeNodeProvider(conanApiManager, settingsPropertyManager);
    const conanProfileNodeProvider = new ConanProfileNodeProvider(conanApiManager);
    const conanPackageNodeProvider = new ConanPackageNodeProvider(conanApiManager, settingsPropertyManager);
    const conanPackageRevisionNodeProvider = new ConanPackageRevisionNodeProvider(conanApiManager, settingsPropertyManager);
    const conanRemoteNodeProvider = new ConanRemoteNodeProvider(conanApiManager);

    const conanCacheExplorerManager = new ConanCacheExplorerManager(context, channelVSConan, conanApiManager, settingsPropertyManager, conanRecipeNodeProvider, conanPackageNodeProvider, conanPackageRevisionNodeProvider);
    const conanProfileExplorerManager = new ConanProfileExplorerManager(context, channelVSConan, conanApiManager, conanProfileNodeProvider);
    const conanRemoteExplorerManager = new ConanRemoteExplorerManager(context, channelVSConan, conanApiManager, conanRemoteNodeProvider);
    const conanWorkspaceManager = new VSConanWorkspaceManager(context, channelVSConan, conanApiManager, settingsPropertyManager);

    const settingsManager = new SettingsManager(conanApiManager,
        conanCacheExplorerManager,
        conanProfileExplorerManager,
        conanRemoteExplorerManager,
        conanWorkspaceManager,
        settingsPropertyManager);

    settingsManager.init();

    const configListener = vscode.workspace.onDidChangeConfiguration((event) => settingsManager.listen(event));

    // Check if it starts with workspace
    // To check whether its workspace or not is to determine if the function "getWorkspaceFolder" returns undefined or a path
    // If user only open anyfile without a folder (as editor) this the workspace path will return "undefined"
    // This condition will be entered if vs code used as a workspace
    let wsList = vscode.workspace.workspaceFolders;

    // If it starts with workspace, there should be at least one element in the array of workspace folder
    if (wsList !== undefined) {

        for (let i = 0; i < wsList.length; i++) {

            let wsPath = wsList[i].uri.fsPath;
            let configPath = path.join(wsPath, constants.VSCONAN_FOLDER, constants.CONFIG_FILE);

            if (utils.conan.isFolderConanProject(wsPath) && !fs.existsSync(configPath!)) {

                vscode.window
                    .showInformationMessage(`The workspace '${wsList[i].name}' is detected as a conan project. Do you want to configure this workspace?`, ...["Yes", "Not Now"])
                    .then((answer) => {
                        if (answer === "Yes") {

                            // .vsconan path in the workspace
                            let vsconanPath = path.join(wsPath, constants.VSCONAN_FOLDER);
                            if (!fs.existsSync(vsconanPath)) {
                                fs.mkdirSync(vsconanPath!);
                            }

                            // Create a default config file
                            utils.vsconan.config.createInitialWorkspaceConfig(vsconanPath);
                        }
                    });
            }
        }
    }

    context.subscriptions.push(
        conanCacheExplorerManager,
        conanProfileExplorerManager,
        conanRemoteExplorerManager,
        conanWorkspaceManager,
        configListener
    );
}

// this method is called when your extension is deactivated
export function deactivate() { }

/**
 * Function to initialize all the context state
 * @param context VS Code extension context
 */
function initContextState(context: vscode.ExtensionContext) {
    vscode.commands.executeCommand('setContext', 'show-dirty', vscode.workspace.getConfiguration("vsconan").get("explorer.treeview.package.showDirtyPackage"));
    context.workspaceState.update('show-dirty', vscode.workspace.getConfiguration("vsconan").get("explorer.treeview.package.showDirtyPackage"));

    vscode.commands.executeCommand('setContext', 'recipe-filtered', false);
    context.workspaceState.update('recipe-filtered', false);
    context.workspaceState.update('recipe-filter-key', "");

    vscode.commands.executeCommand('setContext', 'package-filtered', false);
    context.workspaceState.update('package-filtered', false);
    context.workspaceState.update('package-filter-key', "");
}
