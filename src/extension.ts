import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as utils from "./utils/utils";
import * as constants from "./utils/constants";

import { ConanPackageNodeProvider } from "./extension/ui/treeview/conanPackageProvider";
import { ConanProfileNodeProvider } from "./extension/ui/treeview/conanProfileProvider";
import { ConanRecipeNodeProvider } from "./extension/ui/treeview/conanRecipeProvider";
import { ConanRemoteNodeProvider } from "./extension/ui/treeview/conanRemoteProvider";
import { ConanCacheExplorerManager } from "./extension/manager/explorer/conanCache";
import { ConanProfileExplorerManager } from "./extension/manager/explorer/conanProfile";
import { ConanRemoteExplorerManager } from "./extension/manager/explorer/conanRemote";
import { VSConanWorkspaceManager } from "./extension/manager/vsconanWorkspace";
import { configChangeListener } from "./extension/config/configChangeListener";
import { ConfigurationManager } from "./extension/config/configManager";
import { ConanAPI, ConanExecutionMode} from "./conans/api/base/conanAPI";
import { Conan1API } from "./conans/conan/api/conanAPI";

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
    // Create Configuration Manager object to store and get some configuration
    let configManager = new ConfigurationManager(context);

    // Set the environment conan user home path in the config manager
    // With this approach, we can get back to the environment variable that is set when the VS Code is started
    // Undefined means no specific path is set, so conan default home folder will be used.
    configManager.setEnvConanUserHome(process.env.CONAN_USER_HOME)

    // Get the configuration from 'settings.json' for this matter
    let conanUserHome: string | null | undefined = vscode.workspace.getConfiguration("vsconan").get("general.conanUserHome");
    // If this is defined, the the environment variable will be overwritten, using the configuration in settings.json
    if (conanUserHome != null) {
        process.env.CONAN_USER_HOME = conanUserHome;
    }

    vscode.commands.executeCommand('setContext', 'show-dirty', vscode.workspace.getConfiguration("vsconan").get("explorer.treeview.package.showDirtyPackage"));
    context.workspaceState.update('show-dirty', vscode.workspace.getConfiguration("vsconan").get("explorer.treeview.package.showDirtyPackage"));

    // ========== Initializing the Conan API
    // Getting the setting for execution mode as requirements for ConanAPI
    let mode = vscode.workspace.getConfiguration("vsconan").get("general.conanExecutionMode");

    // Set default mode, in case undefined mode is written in the config
    let conanExecutionMode: ConanExecutionMode = ConanExecutionMode.conan;

    if (mode === "pythonInterpreter") {
        conanExecutionMode = ConanExecutionMode.python;
    }
    else if (mode === "conanExecutable") {
        conanExecutionMode = ConanExecutionMode.conan;
    }

    let conanApi: ConanAPI = new Conan1API(
        vscode.workspace.getConfiguration("vsconan").get("general.pythonInterpreter")!,
        vscode.workspace.getConfiguration("vsconan").get("general.conanExecutable")!,
        conanExecutionMode);

    // ========== Registering the treeview for the extension
    const conanRecipeNodeProvider = new ConanRecipeNodeProvider(conanApi);
    const conanProfileNodeProvider = new ConanProfileNodeProvider(conanApi);
    const conanPackageNodeProvider = new ConanPackageNodeProvider(conanApi);
    const conanRemoteNodeProvider = new ConanRemoteNodeProvider(conanApi);

    const conanCacheExplorerManager = new ConanCacheExplorerManager(context, channelVSConan, conanApi, conanRecipeNodeProvider, conanPackageNodeProvider);
    const conanProfileExplorerManager = new ConanProfileExplorerManager(context, channelVSConan, conanApi, conanProfileNodeProvider);
    const conanRemoteExplorerManager = new ConanRemoteExplorerManager(context, channelVSConan, conanApi, conanRemoteNodeProvider);
    const conanWorkspaceManager = new VSConanWorkspaceManager(context, channelVSConan, conanApi);

    const configListener = vscode.workspace.onDidChangeConfiguration((event) => configChangeListener(event, conanApi, configManager));

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
