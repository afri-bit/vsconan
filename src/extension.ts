import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as utils from "./utils";
import * as constants from "./constants";

import { ConanPackageNodeProvider } from "./ui/treeview/conanPackageProvider";
import { ConanProfileNodeProvider } from "./ui/treeview/conanProfileProvider";
import { ConanRecipeNodeProvider } from "./ui/treeview/conanRecipeProvider";
import { ConanRemoteNodeProvider } from "./ui/treeview/conanRemoteProvider";
import { ConanAPI } from "./api/conan/conanAPI";
import { ConanCacheExplorerManager } from "./manager/explorer/conanCache";
import { ConanProfileExplorerManager } from "./manager/explorer/conanProfile";
import { ConanRemoteExplorerManager } from "./manager/explorer/conanRemote";
import { VSConanWorkspaceManager } from "./manager/vsconanWorkspace";
import { configChangeListener } from "./configChangeListener";

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    // Create VSConan extension channel
    // This channel is to show the command line outputs specifically for this extension
    var channelVSConan = vscode.window.createOutputChannel("VSConan");

    // ----- Global Area Initialization -----
    // Global Area - The global area is stored under home folder ($HOME/.vsconan)
    //               This area has lower priority then the workspace area
    // Global Area - To work for the API a extension folder will created in the home directory
    utils.vsconan.initializeGlobalArea();

    vscode.commands.executeCommand('setContext', 'show-dirty', vscode.workspace.getConfiguration("vsconan").get("explorer.treeview.package.showDirtyPackage"));
    context.workspaceState.update('show-dirty', vscode.workspace.getConfiguration("vsconan").get("explorer.treeview.package.showDirtyPackage"));

    // Initializing the Conan API
    let conanApi = new ConanAPI(vscode.workspace.getConfiguration("vsconan").get("explorer.pythonInterpreter")!);

    // ========== Registering the treeview for the extension
    const conanRecipeNodeProvider = new ConanRecipeNodeProvider(conanApi);
    const conanProfileNodeProvider = new ConanProfileNodeProvider(conanApi);
    const conanPackageNodeProvider = new ConanPackageNodeProvider(conanApi);
    const conanRemoteNodeProvider = new ConanRemoteNodeProvider(conanApi);

    const conanCacheExplorerManager = new ConanCacheExplorerManager(context, channelVSConan, conanApi, conanRecipeNodeProvider, conanPackageNodeProvider);
    const conanProfileExplorerManager = new ConanProfileExplorerManager(context, channelVSConan, conanApi, conanProfileNodeProvider);
    const conanRemoteExplorerManager = new ConanRemoteExplorerManager(context, channelVSConan, conanApi, conanRemoteNodeProvider);
    const conanWorkspaceManager = new VSConanWorkspaceManager(context, channelVSConan, conanApi);

    const configListener = vscode.workspace.onDidChangeConfiguration((event) => configChangeListener(event, conanApi));

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
