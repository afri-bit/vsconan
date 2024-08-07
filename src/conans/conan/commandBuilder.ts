import * as utils from "../../utils/utils";
import { CommandBuilder } from "../command/commandBuilder";
import {
    ConfigCommandBuild,
    ConfigCommandCreate,
    ConfigCommandInstall,
    ConfigCommandPackage,
    ConfigCommandPackageExport,
    ConfigCommandSource
} from "../command/configCommand";

/**
 * Static class to build command for some conan workflow based on the configuration. 
 */
export class CommandBuilderConan1 extends CommandBuilder {

    public override buildCommandCreate(wsPath: string, cfg: ConfigCommandCreate): Array<string> | undefined {
        // Initialized the command in array of string. Later on will be converted to plain string.
        let cmd: Array<string> = [];

        // One of mandatory attributes is the path to the conanfile.py
        // If this is empty the whole command build process will be cancelled.
        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        // Check if user and channel are specified
        if ((cfg.user !== undefined && cfg.user !== "") && (cfg.channel !== undefined && cfg.channel !== "")) {
            cmd.push(cfg.user + "/" + cfg.channel);
        }

        // Check if there is a specific profile define for this command
        if (cfg.profile !== "" && cfg.profile !== undefined) {
            cmd.push.apply(cmd, ["-pr", cfg.profile]);
        }

        // Push additional arguments that user can define
        cmd.push.apply(cmd, cfg.args);

        return cmd;
    }

    public override buildCommandInstall(wsPath: string, cfg: ConfigCommandInstall): Array<string> | undefined {
        let cmd: Array<string> = [];

        // One of mandatory attributes is the path to the conanfile.py
        // If this is empty the whole command build process will be cancelled.
        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if ((cfg.user !== undefined && cfg.user !== "") && (cfg.channel !== undefined && cfg.channel !== "")) {
            cmd.push(cfg.user + "/" + cfg.channel);
        }

        if (cfg.profile !== "" && cfg.profile !== undefined) {
            cmd.push.apply(cmd, ["-pr", cfg.profile]);
        }

        if (cfg.installFolder !== "" && cfg.installFolder !== undefined) {
            cmd.push.apply(cmd, ["-if", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        cmd.push.apply(cmd, cfg.args);

        return cmd; // TODO: Clean up - Returning the array of string

    }

    public override buildCommandBuild(wsPath: string, cfg: ConfigCommandBuild): Array<string> | undefined {
        let cmd: Array<string> = [];

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.installFolder !== "" && cfg.installFolder !== undefined) {
            cmd.push.apply(cmd, ["-if", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        if (cfg.buildFolder !== "" && cfg.buildFolder !== undefined) {
            cmd.push.apply(cmd, ["-bf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.buildFolder)]);
        }

        if (cfg.packageFolder !== "" && cfg.packageFolder !== undefined) {
            cmd.push.apply(cmd, ["-pf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.packageFolder)]);
        }

        if (cfg.sourceFolder !== "" && cfg.sourceFolder !== undefined) {
            cmd.push.apply(cmd, ["-sf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.sourceFolder)]);
        }

        cmd.push.apply(cmd, cfg.args);

        return cmd;

    }

    public override buildCommandSource(wsPath: string, cfg: ConfigCommandSource): Array<string> | undefined {

        let cmd: Array<string> = [];

        // cmd.push("source");

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.installFolder !== "" && cfg.installFolder !== undefined) {
            cmd.push.apply(cmd, ["-if", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        if (cfg.sourceFolder !== "" && cfg.sourceFolder !== undefined) {
            cmd.push.apply(cmd, ["-sf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.sourceFolder)]);
        }

        return cmd;

    }

    public override buildCommandPackage(wsPath: string, cfg: ConfigCommandPackage): Array<string> | undefined {
        let cmd: Array<string> = [];

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.installFolder !== "" && cfg.installFolder !== undefined) {
            cmd.push.apply(cmd, ["-if", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        if (cfg.buildFolder !== "" && cfg.buildFolder !== undefined) {
            cmd.push.apply(cmd, ["-bf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.buildFolder)]);
        }

        if (cfg.packageFolder !== "" && cfg.packageFolder !== undefined) {
            cmd.push.apply(cmd, ["-pf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.packageFolder)]);
        }

        if (cfg.sourceFolder !== "" && cfg.sourceFolder !== undefined) {
            cmd.push.apply(cmd, ["-sf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.sourceFolder)]);
        }

        return cmd;

    }

    public override buildCommandPackageExport(wsPath: string, cfg: ConfigCommandPackageExport): Array<string> | undefined {
        let cmd: Array<string> = [];

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.installFolder !== "" && cfg.installFolder !== undefined) {
            cmd.push.apply(cmd, ["-if", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        if (cfg.buildFolder !== "" && cfg.buildFolder !== undefined) {
            cmd.push.apply(cmd, ["-bf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.buildFolder)]);
        }

        if (cfg.packageFolder !== "" && cfg.packageFolder !== undefined) {
            cmd.push.apply(cmd, ["-pf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.packageFolder)]);
        }

        if (cfg.sourceFolder !== "" && cfg.sourceFolder !== undefined) {
            cmd.push.apply(cmd, ["-sf", utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.sourceFolder)]);
        }

        cmd.push.apply(cmd, cfg.args);

        return cmd;
    }
}