import * as fs from "fs";
import * as vscode from "vscode";
import {
    ConfigCommand, ConfigCommandBuild, ConfigCommandCreate, ConfigCommandInstall,
    ConfigCommandPackage,
    ConfigCommandPackageExport, ConfigCommandSource
} from "./configCommand";
import * as utils from "./utils";


export class ConanConfig {
    public python: string;
    public command: ConfigCommand;

    constructor(python: string = "python", command: ConfigCommand = new ConfigCommand()) {
        this.python = python;
        this.command = command;
    }
}

export class ConfigController {
    private config: ConanConfig;

    constructor(config: ConanConfig) {
        this.config = config;
    }

    public getPython(): string {
        return this.config.python;
    }

    public getConfig(): ConanConfig {
        return this.config;
    }

    public generateDefaultConfig() {

        let config = new ConanConfig("python", new ConfigCommand([new ConfigCommandCreate()],
            [new ConfigCommandInstall()],
            [new ConfigCommandBuild()],
            [new ConfigCommandSource()],
            [new ConfigCommandPackage()],
            [new ConfigCommandPackageExport()]));

        this.config = config;
    }

    public updateConfig() {

    }

    public writeConfig() {

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
            return this.config.command.create;
        else
            return undefined;
    }

    public getListCommandInstall(): Array<ConfigCommandInstall> | undefined {
        if (this.fetchConfig())
            return this.config.command.install;
        else
            return undefined;
    }

    public getListCommandBuild(): Array<ConfigCommandBuild> | undefined {
        if (this.fetchConfig())
            return this.config.command.build;
        else
            return undefined;
    }

    public getListCommandSource(): Array<ConfigCommandSource> | undefined {
        if (this.fetchConfig())
            return this.config.command.source;
        else
            return undefined;
    }

    public getListCommandPackage(): Array<ConfigCommandPackage> | undefined {
        if (this.fetchConfig())
            return this.config.command.pkg;
        else
            return undefined;
    }

    public getListCommandPackageExport(): Array<ConfigCommandPackageExport> | undefined {
        if (this.fetchConfig())
            return this.config.command.pkg_export;
        else
            return undefined;
    }

    public getConfigCommandCreate(index: number): ConfigCommandCreate {
        return this.config.command.create[index];
    }

    public getConfigCommandInstall(index: number): ConfigCommandInstall {
        return this.config.command.install[index];
    }

    public getConfigCommandBuild(index: number): ConfigCommandBuild {
        return this.config.command.build[index];
    }

    public getConfigCommandSource(index: number): ConfigCommandSource {
        return this.config.command.source[index];
    }

    public getConfigCommandPackage(index: number): ConfigCommandPackage {
        return this.config.command.pkg[index];
    }

    public getConfigCommandPackageExport(index: number): ConfigCommandPackageExport {
        return this.config.command.pkg_export[index];
    }

}

