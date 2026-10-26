import * as fs from "fs";
import { parse, ParseError, printParseErrorCode } from "jsonc-parser";
import {
    CommandContainer, ConfigCommandBuild, ConfigCommandCreate,
    ConfigCommandInstall, ConfigCommandPackage, ConfigCommandPackageExport,
    ConfigCommandSource, ConfigCommandWorkflow
} from "../command/configCommand";

export class ConfigWorkspace {
    public commandContainer: CommandContainer;
    public presetContainer: Record<string, ConfigCommandWorkflow> | undefined;

    constructor(commandContainer: CommandContainer = new CommandContainer(), presetContainer: Record<string, ConfigCommandWorkflow> | undefined = undefined) {
        this.commandContainer = commandContainer;
        this.presetContainer = presetContainer;
    }

    public static fromJson(json: string): ConfigWorkspace {
        const parseErrors: ParseError[] = [];
        const configWorkspace = parse(json, parseErrors, { allowTrailingComma: true }) as ConfigWorkspace;
        if (parseErrors.length > 0) {
            const details = parseErrors.map(error => `${printParseErrorCode(error.error)} at offset ${error.offset}`).join(", ");
            throw new SyntaxError(`Invalid workspace configuration: ${details}`);
        }

        const commandContainer = configWorkspace.commandContainer || new CommandContainer();
        const workflows = configWorkspace.presetContainer;

        if (!workflows) {
            return configWorkspace;
        }

        const expandedCommands = new CommandContainer(
            commandContainer.create || [],
            commandContainer.install || [],
            commandContainer.build || [],
            commandContainer.source || [],
            commandContainer.pkg || [],
            commandContainer.pkgExport || []
        );

        for (const name of Object.keys(workflows)) {
            const workflow = workflows[name];
            const commonArgs = workflow.args || [];
            const getArgs = (commandArgs: Array<string> | undefined) => commandArgs === undefined ? commonArgs : commandArgs;

            const create = new ConfigCommandCreate(name, workflow.description, workflow.detail, workflow.profile, workflow.user, workflow.channel, getArgs(workflow.createArgs));
            const install = new ConfigCommandInstall(name, workflow.description, workflow.detail, workflow.installFolder, workflow.profile, workflow.user, workflow.channel, getArgs(workflow.installArgs));
            const build = new ConfigCommandBuild(name, workflow.description, workflow.detail, workflow.installFolder, workflow.buildFolder, workflow.packageFolder, workflow.sourceFolder, getArgs(workflow.buildArgs));
            const source = new ConfigCommandSource(name, workflow.description, workflow.detail, workflow.installFolder, workflow.sourceFolder, workflow.version, workflow.user, workflow.channel, getArgs(workflow.sourceArgs));
            const pkg = new ConfigCommandPackage(name, workflow.description, workflow.detail, workflow.installFolder, workflow.buildFolder, workflow.packageFolder, workflow.sourceFolder, getArgs(workflow.packageArgs));
            const pkgExport = new ConfigCommandPackageExport(name, workflow.description, workflow.detail, workflow.installFolder, workflow.buildFolder, workflow.packageFolder, workflow.sourceFolder, workflow.user, workflow.channel, getArgs(workflow.packageExportArgs));
            const commands = [create, install, build, source, pkg, pkgExport];

            for (const command of commands) {
                command.conanRecipe = workflow.conanRecipe || "conanfile.py";
            }

            expandedCommands.create.push(create);
            expandedCommands.install.push(install);
            expandedCommands.build.push(build);
            expandedCommands.source.push(source);
            expandedCommands.pkg.push(pkg);
            expandedCommands.pkgExport.push(pkgExport);
        }

        return new ConfigWorkspace(expandedCommands);
    }

    public getJsonString(): string {
        let jsonString = JSON.stringify(this, null, 4);
        return jsonString;
    }

    /**
     * Save current configuration to JSON file with give file name
     *
     * @param filename
     */
    public writeToFile(filename: string) {
        let jsonString = JSON.stringify(this, null, 4);
        fs.writeFile(filename, jsonString, "utf8", function (err) {
            if (err) {
                throw err;
            }
        });
    }
}
