import * as vscode from "vscode";
import { ConanExecutionMode } from "../../conans/api/base/conanAPI";
import { ConanAPIManager } from "../../conans/api/conanAPIManager";
import { ConfigurationManager } from "./configManager";
import { ConanCacheExplorerManager } from "../manager/explorer/conanCache";
import { ConanProfileExplorerManager } from "../manager/explorer/conanProfile";
import { ConanRemoteExplorerManager } from "../manager/explorer/conanRemote";
import { VSConanWorkspaceManager } from "../manager/vsconanWorkspace";

export function configChangeListener(event: vscode.ConfigurationChangeEvent,
    conanApiManager: ConanAPIManager, 
    conanCacheExplorerManager: ConanCacheExplorerManager,
    conanProfileExplorerManager: ConanProfileExplorerManager,
    conanRemoteExplorerManager: ConanRemoteExplorerManager,
    conanWorkspaceManager: VSConanWorkspaceManager,
    configManager: ConfigurationManager
    ) {
    // Check if only vsconan configuration is changed, otherwise do nothing. Removing overhead.
    let affected = event.affectsConfiguration("vsconan");

    if (affected) {

        if (event.affectsConfiguration("vsconan.conan.version")) {
            let conanVersion: string | undefined = vscode.workspace.getConfiguration("vsconan.conan").get("version");
            let conanExecutionMode: ConanExecutionMode;
            let conanPythonInterpreter: string;
            let conanExecutable: string;

            if (conanVersion == "2") {
                // Getting the setting for execution mode as requirements for ConanAPI
                let mode = vscode.workspace.getConfiguration("vsconan.conan").get("2.conanExecutionMode");

                if (mode === "pythonInterpreter") {
                    conanExecutionMode = ConanExecutionMode.python;
                }
                else if (mode === "conanExecutable") {
                    conanExecutionMode = ConanExecutionMode.conan;
                }

                conanPythonInterpreter = vscode.workspace.getConfiguration("vsconan.conan").get("2.pythonInterpreter")!;
                conanExecutable = vscode.workspace.getConfiguration("vsconan.conan").get("2.conanExecutable")!;
            }
            else { // In case the conan version is an error value, set to conan version 1 as default
                conanVersion = "1";
                // Getting the setting for execution mode as requirements for ConanAPI
                let mode = vscode.workspace.getConfiguration("vsconan.conan").get("1.conanExecutionMode");

                if (mode === "pythonInterpreter") {
                    conanExecutionMode = ConanExecutionMode.python;
                }
                else if (mode === "conanExecutable") {
                    conanExecutionMode = ConanExecutionMode.conan;
                }

                conanPythonInterpreter = vscode.workspace.getConfiguration("vsconan.conan").get("1.pythonInterpreter")!;
                conanExecutable = vscode.workspace.getConfiguration("vsconan.conan").get("1.conanExecutable")!;
            }

            conanApiManager.setApiInstance(
                conanVersion,
                conanPythonInterpreter,
                conanExecutable,
                conanExecutionMode!,
            )

            conanCacheExplorerManager.refresh();
            conanProfileExplorerManager.refresh();
            conanRemoteExplorerManager.refresh();
            conanWorkspaceManager.refresh();
        }

        let conanUserHome: string = vscode.workspace.getConfiguration("vsconan").get("general.conanUserHome")!;

        if (conanUserHome === null) { // Default value of configuration, see 'package.json'. Null means follow the pre defined environment variable
            // Reset the current conan user home to the default environment variable
            // We will get this from the config manager.
            let envConanUserHome = configManager.getEnvConanUserHome();

            if (envConanUserHome === undefined) {
                // Deleting the environment variable, because it was not pre defined before
                delete process.env.CONAN_USER_HOME;
            }
            else {
                process.env.CONAN_USER_HOME = envConanUserHome;
            }
        }
        else {
            process.env.CONAN_USER_HOME = conanUserHome;
        }
    }
}