import * as vscode from "vscode";
import { ConanAPI, ConanExecutionMode } from "../../conan/api/conanAPI";
import { ConfigurationManager } from "./configManager";

export function configChangeListener(event: vscode.ConfigurationChangeEvent, conanApi: ConanAPI, configManager: ConfigurationManager) {
    // TODO: Check if only vsconan configuration is changed, otherwise do nothing. Removing overhead.

    let pythonInterpreter: string = vscode.workspace.getConfiguration("vsconan").get("general.pythonInterpreter")!;
    let conanExecutable: string = vscode.workspace.getConfiguration("vsconan").get("general.conanExecutable")!;
    let conanExecutionMode: string = vscode.workspace.getConfiguration("vsconan").get("general.conanExecutionMode")!;

    conanApi.setPythonInterpreter(pythonInterpreter);
    conanApi.setConanExecutable(conanExecutable);
    if (conanExecutionMode === "pythonInterpreter") {
        conanApi.switchExecutionMode(ConanExecutionMode.python);
    }
    else if (conanExecutionMode === "conanExecutable") {
        conanApi.switchExecutionMode(ConanExecutionMode.conan);
    }
    else {
        conanApi.switchExecutionMode(ConanExecutionMode.conan);
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