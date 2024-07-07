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
export class CommandBuilderConan2 extends CommandBuilder {

    public override buildCommandCreate(wsPath: string, cfg: ConfigCommandCreate): Array<string> | undefined {
        // Initialized the command in array of string. Later on will be converted to plain string.
        let cmd: Array<string> = [];

        if (cfg.conanRecipe) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.user) { cmd.push.apply(cmd, ["--user", cfg.user]); }

        if (cfg.channel) { cmd.push.apply(cmd, ["--channel", cfg.channel]); }

        if (cfg.profile) { cmd.push.apply(cmd, ["-pr", cfg.profile]); }

        // Push additional arguments that user can define
        cmd.push.apply(cmd, cfg.args);

        return cmd;

    }

    public override buildCommandInstall(wsPath: string, cfg: ConfigCommandInstall): Array<string> | undefined {
        let cmd: Array<string> = [];

        if (cfg.conanRecipe) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.user) { cmd.push.apply(cmd, ["--user", cfg.user]); }

        if (cfg.channel) { cmd.push.apply(cmd, ["--channel", cfg.channel]); }

        if (cfg.profile) { cmd.push.apply(cmd, ["-pr", cfg.profile]); }

        // NOTE: Install folder argument is ignored in conan2, conan will generate build folder automatically

        cmd.push.apply(cmd, cfg.args);

        return cmd;
    }

    public override buildCommandBuild(wsPath: string, cfg: ConfigCommandBuild): Array<string> | undefined {
        let cmd: Array<string> = [];

        if (cfg.conanRecipe) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        // NOTE: Ignore following input for now: (only works for conan 1)
        // install Folder 
        // build folder
        // package folder
        // source folder

        cmd.push.apply(cmd, cfg.args);

        return cmd;

    }

    public override buildCommandSource(wsPath: string, cfg: ConfigCommandSource): Array<string> | undefined {

        let cmd: Array<string> = [];

        if (cfg.conanRecipe) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.user) { cmd.push.apply(cmd, ["--user", cfg.user]); }

        if (cfg.channel) { cmd.push.apply(cmd, ["--channel", cfg.channel]); }

        // NOTE: Ignoring following input for now (only works for conan 1)
        // Install Folder
        // Source Folder

        cmd.push.apply(cmd, cfg.args);

        return cmd;

    }

    public override buildCommandPackage(wsPath: string, cfg: ConfigCommandPackage): Array<string> | undefined {
        // No 'package' command in conan 2
        return undefined;
    }

    public override buildCommandPackageExport(wsPath: string, cfg: ConfigCommandPackageExport): Array<string> | undefined {
        let cmd: Array<string> = [];

        if (cfg.conanRecipe) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.user) { cmd.push.apply(cmd, ["--user", cfg.user]); }

        if (cfg.channel) { cmd.push.apply(cmd, ["--channel", cfg.channel]); }

        cmd.push.apply(cmd, cfg.args);

        return cmd;

    }
}