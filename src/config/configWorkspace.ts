import * as fs from "fs";
import * as vscode from "vscode";
import {
    CommandContainer,
    ConfigCommandBuild, ConfigCommandCreate, ConfigCommandInstall,
    ConfigCommandPackage,
    ConfigCommandPackageExport, ConfigCommandSource
} from "./configCommand";
import * as utils from "../utils/utils";


export class ConfigWorkspace {
    public python: string;
    public commandContainer: CommandContainer;

    constructor(python: string = "python", commandContainer: CommandContainer = new CommandContainer()) {
        this.python = python;
        this.commandContainer = commandContainer;
    }
}

export class ConfigWorkspaceController {
    private config: ConfigWorkspace;

    constructor(config: ConfigWorkspace) {
        this.config = config;
    }

    public getPython(): string {
        return this.config.python;
    }

    public getConfig(): ConfigWorkspace {
        return this.config;
    }

    public generateDefaultConfig() {

        let config = new ConfigWorkspace("python", new CommandContainer([new ConfigCommandCreate()],
            [new ConfigCommandInstall()],
            [new ConfigCommandBuild()],
            [new ConfigCommandSource()],
            [new ConfigCommandPackage()],
            [new ConfigCommandPackageExport()]));

        this.config = config;
    }

    public fetchConfig(): boolean {

        if (fs.existsSync(utils.getWorkspaceConfigPath()!)) {
            let configText = fs.readFileSync(utils.getWorkspaceConfigPath()!, 'utf8');
            this.config = JSON.parse(configText);
            return true;
        }
        else {
            vscode.window.showErrorMessage("Unable to find config file.");
            return false;
        }
    }

    public getListCommandCreate(): Array<ConfigCommandCreate> | undefined {
        if (this.fetchConfig())
            return this.config.commandContainer.create;
        else
            return undefined;
    }

    public getListCommandInstall(): Array<ConfigCommandInstall> | undefined {
        if (this.fetchConfig())
            return this.config.commandContainer.install;
        else
            return undefined;
    }

    public getListCommandBuild(): Array<ConfigCommandBuild> | undefined {
        if (this.fetchConfig())
            return this.config.commandContainer.build;
        else
            return undefined;
    }

    public getListCommandSource(): Array<ConfigCommandSource> | undefined {
        if (this.fetchConfig())
            return this.config.commandContainer.source;
        else
            return undefined;
    }

    public getListCommandPackage(): Array<ConfigCommandPackage> | undefined {
        if (this.fetchConfig())
            return this.config.commandContainer.pkg;
        else
            return undefined;
    }

    public getListCommandPackageExport(): Array<ConfigCommandPackageExport> | undefined {
        if (this.fetchConfig())
            return this.config.commandContainer.pkgExport;
        else
            return undefined;
    }

    public getConfigCommandCreate(index: number): ConfigCommandCreate {
        return this.config.commandContainer.create[index];
    }

    public getConfigCommandInstall(index: number): ConfigCommandInstall {
        return this.config.commandContainer.install[index];
    }

    public getConfigCommandBuild(index: number): ConfigCommandBuild {
        return this.config.commandContainer.build[index];
    }

    public getConfigCommandSource(index: number): ConfigCommandSource {
        return this.config.commandContainer.source[index];
    }

    public getConfigCommandPackage(index: number): ConfigCommandPackage {
        return this.config.commandContainer.pkg[index];
    }

    public getConfigCommandPackageExport(index: number): ConfigCommandPackageExport {
        return this.config.commandContainer.pkgExport[index];
    }

}

