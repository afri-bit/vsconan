import * as vscode from "vscode";
import { ConanExecutionMode } from "../../conans/api/base/conanAPI";
import { ConanAPIManager } from "../../conans/api/conanAPIManager";
import { ConanCacheExplorerManager } from "../manager/explorer/conanCache";
import { ConanProfileExplorerManager } from "../manager/explorer/conanProfile";
import { ConanRemoteExplorerManager } from "../manager/explorer/conanRemote";
import { VSConanWorkspaceManager } from "../manager/vsconanWorkspace";
import { SettingsPropertyManager } from "./settingsPropertyManager";

export class SettingsManager {
    private conanApiManager: ConanAPIManager;
    private conanCacheExplorerManager: ConanCacheExplorerManager;
    private conanProfileExplorerManager: ConanProfileExplorerManager;
    private conanRemoteExplorerManager: ConanRemoteExplorerManager;
    private conanWorkspaceManager: VSConanWorkspaceManager;
    private settingsPropertyManager: SettingsPropertyManager;

    public constructor(
        conanApiManager: ConanAPIManager,
        conanCacheExplorerManager: ConanCacheExplorerManager,
        conanProfileExplorerManager: ConanProfileExplorerManager,
        conanRemoteExplorerManager: ConanRemoteExplorerManager,
        conanWorkspaceManager: VSConanWorkspaceManager,
        settingsPropertyManager: SettingsPropertyManager
    ) {
        this.conanApiManager = conanApiManager;
        this.conanCacheExplorerManager = conanCacheExplorerManager;
        this.conanProfileExplorerManager = conanProfileExplorerManager;
        this.conanRemoteExplorerManager = conanRemoteExplorerManager;
        this.conanWorkspaceManager = conanWorkspaceManager;
        this.settingsPropertyManager = settingsPropertyManager;
    }

    public init() {
        // Set the environment conan user home path in the config manager
        // With this approach, we can get back to the environment variable that is set when the VS Code is started
        // Undefined means no specific path is set, so conan default home folder will be used.
        this.settingsPropertyManager.setEnvConanUserHome(process.env.CONAN_USER_HOME);
        this.settingsPropertyManager.setEnvConanHome(process.env.CONAN_HOME);


        // // Get the configuration from 'settings.json' for this matter
        // let conanUserHome: string | null | undefined = vscode.workspace.getConfiguration("vsconan").get("general.conanUserHome");
        // // If this is defined, the the environment variable will be overwritten, using the configuration in settings.json
        // if (conanUserHome !== null) {
        //     process.env.CONAN_USER_HOME = conanUserHome;
        // }

        // TODO: Check if vsconan.conan.profile.configurations is defined at all, if not define default value


        // TODO: vsconan.conan.profile.default is defined? if not set to default

        this.changeConanProfile();
    }

    public listen(event: vscode.ConfigurationChangeEvent) {
        // Check if only vsconan configuration is changed, otherwise do nothing. Removing overhead.
        if (event.affectsConfiguration("vsconan")) {
            if (event.affectsConfiguration("vsconan.conan.profile")) {
                this.changeConanProfile();
            }
        }
    }

    private changeConanProfile() {
        let selectedProfile: string | undefined = vscode.workspace.getConfiguration("vsconan.conan.profile").get("default");

        if (this.settingsPropertyManager.isProfileAvailable(selectedProfile!) &&
            this.settingsPropertyManager.isProfileValid(selectedProfile!)) {
            let profileObject = this.settingsPropertyManager.getConanProfileObject(selectedProfile!);

            let conanExecutionMode: ConanExecutionMode = ConanExecutionMode.conan;

            if (profileObject!.conanExecutionMode === "pythonInterpreter") {
                conanExecutionMode = ConanExecutionMode.python;
            }
            else if (profileObject!.conanExecutionMode === "conanExecutable") {
                conanExecutionMode = ConanExecutionMode.conan;
            }

            this.conanApiManager.setApiInstance(
                profileObject!.conanVersion,
                profileObject!.conanPythonInterpreter.replace(/ /g, "\\ "),
                profileObject!.conanExecutable.replace(/ /g, "\\ "),
                conanExecutionMode);

            this.conanCacheExplorerManager.refresh();
            this.conanProfileExplorerManager.refresh();
            this.conanRemoteExplorerManager.refresh();
            this.conanWorkspaceManager.refresh();
        }
        else {
            this.conanApiManager.setApiInstance(
                "",
                "",
                "",
                ConanExecutionMode.conan,
            );

            vscode.window.showErrorMessage("VSConan - Invalid configuration for conan. Check the configuration once again.");

            this.conanCacheExplorerManager.clean();
            this.conanProfileExplorerManager.clean();
            this.conanRemoteExplorerManager.clean();
            this.conanWorkspaceManager.refresh();
        }
    }
}