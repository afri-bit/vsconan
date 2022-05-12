import * as vscode from "vscode";
import { ConanAPI } from "./api/conan/conanAPI";

export function configChangeListener(event: vscode.ConfigurationChangeEvent, conanApi: ConanAPI) {
    // TODO: Check if only vsconan configuration is changed, otherwise do nothing. Removing overhead.
    conanApi.setPythonInterpreter(vscode.workspace.getConfiguration("vsconan").get("general.pythonInterpreter")!);
}