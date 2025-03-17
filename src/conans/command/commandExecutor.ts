import * as vscode from "vscode";
import * as utils from "../../utils/utils";
import { CommandBuilder } from "./commandBuilder";
import { ConfigCommand, Task } from "./configCommand";

export enum ConanCommand {
    create = "create",
    install = "install",
    build = "build",
    source = "source",
    package = "package",
    packageExport = "export-pkg",
    activateBuildEnv = "activate-build-env",
    activateRunEnv = "activate-run-env",
    deactivateEnv = "deactivate-env",
}

class CommandTask {
    name: string;
    description: string;
    command: string;
    args: string[];
    continueOnError: boolean;
    context: string;
    env: Record<string, string>;
    channel: vscode.OutputChannel;

    constructor(task: Task, channel: vscode.OutputChannel) {
        this.name = task.name;
        this.description = task.description;
        this.command = task.command;
        this.args = task.args || [];
        this.continueOnError = task.continueOnError;
        this.context = task.context || "";
        this.env = task.env || {};

        this.channel = channel;
    }

    async execute() {
        const fullCommand = `${this.command} ${this.args.join(" ")}`;

        console.log(`\n [${this.name}] Running: ${fullCommand}`);

        try {
            await utils.vsconan.cmd.executeCommand(this.command, this.args, this.channel)
        } catch (err) {
            vscode.window.showErrorMessage(`Task '${this.name}' failed - \n\n${err}`);
            console.error(`Task '${this.name}' failed - \n\n${err}`);

            if (!this.continueOnError) {
                throw new Error(`Task '${this.name}' failed - \n\n${err}`);
            }
        }
    }
}

export class ConanCommandExecutor<TConfig extends ConfigCommand> {

    // General information about conan and workspaces
    private conanCommand: string;
    private commandType: ConanCommand;
    private wsPath: string;
    private commandBuilder: CommandBuilder;

    // Configuration for the command
    private config: TConfig
    private preTasks: CommandTask[] = [];
    private postTasks: CommandTask[] = [];

    // VScode output channel
    private channel: vscode.OutputChannel;

    constructor(wsPath: string,
        conanCommand: string,
        commandType: ConanCommand,
        config: TConfig & { preTask?: any[]; postTask?: any[] },
        builder: CommandBuilder,
        channel: vscode.OutputChannel) {

        this.conanCommand = conanCommand;
        this.commandType = commandType;
        this.wsPath = wsPath;
        this.commandBuilder = builder;

        this.config = config;
        this.preTasks = (config.preTask ?? []).map(t => new CommandTask(t, channel));
        this.postTasks = (config.postTask ?? []).map(t => new CommandTask(t, channel));

        this.channel = channel;
    }

    private async runPreTasks() {
        console.log("Running pre-tasks...");
        for (const task of this.preTasks) {
            console.log(`Executing pre-task: ${task.name}`);
            await task.execute();
        }
    }

    private async runPostTasks() {
        console.log("Running post-tasks...");
        for (const task of this.postTasks) {
            console.log(`Executing post-task: ${task.name}`);
            await task.execute();
        }
    }

    private buildConanCommand() {
        switch (this.commandType) {
            case ConanCommand.create:
                return this.commandBuilder.buildCommandCreate(this.wsPath, this.config);
            case ConanCommand.install:
                return this.commandBuilder.buildCommandInstall(this.wsPath, this.config);
            case ConanCommand.build:
                return this.commandBuilder.buildCommandBuild(this.wsPath, this.config);
            case ConanCommand.source:
                return this.commandBuilder.buildCommandSource(this.wsPath, this.config);
            case ConanCommand.package:
                return this.commandBuilder.buildCommandPackage(this.wsPath, this.config);
            case ConanCommand.packageExport:
                return this.commandBuilder.buildCommandPackageExport(this.wsPath, this.config);
            default:
                throw new Error(`Unknown command type: ${this.commandType}`);
        }
    }

    private async runConanCommand() {
        const conanCmd = this.buildConanCommand();

        await utils.vsconan.cmd.executeCommand(`${this.conanCommand} ${this.commandType.toString()}`, conanCmd!, this.channel)
    }

    public async run() {

        try {
            await this.runPreTasks();

            await this.runConanCommand();

            await this.runPostTasks();

            console.log("Command execution done!");
        }
        catch (err) {
            console.error(`Execution stopped due to error: ${err}`);
            throw new Error(`Execution stopped due to error: ${err}`);
        }
    }
}
