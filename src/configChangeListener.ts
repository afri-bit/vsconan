import * as vscode from "vscode";
import { ConanAPI, ConanExecutionMode } from "./api/conan/conanAPI";

export function configChangeListener(event: vscode.ConfigurationChangeEvent, conanApi: ConanAPI) {
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
}