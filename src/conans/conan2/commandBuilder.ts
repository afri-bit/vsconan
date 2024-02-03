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

    public override buildCommandCreate(wsPath: string, cfg: ConfigCommandCreate): string | undefined {
        // Initialized the command in array of string. Later on will be converted to plain string.
        let cmd: Array<string> = [];

        cmd.push("create");

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

        return cmd.join(" ");
    }

    public override buildCommandInstall(wsPath: string, cfg: ConfigCommandInstall): string | undefined {
        let cmd: Array<string> = [];

        cmd.push("install");

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

        return cmd.join(" ");
    }

    public override buildCommandBuild(wsPath: string, cfg: ConfigCommandBuild): string | undefined {
        let cmd: Array<string> = [];

        cmd.push("build");

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

        return cmd.join(" ");

    }

    public override buildCommandSource(wsPath: string, cfg: ConfigCommandSource): string | undefined {

        let cmd: Array<string> = [];

        cmd.push("source");

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

        return cmd.join(" ");
    }

    public override buildCommandPackage(wsPath: string, cfg: ConfigCommandPackage): string | undefined {
        // No 'package' command in conan 2
        return undefined;
    }

    public override buildCommandPackageExport(wsPath: string, cfg: ConfigCommandPackageExport): string | undefined {
        let cmd: Array<string> = [];

        cmd.push("export-pkg");

        if (cfg.conanRecipe) {
            cmd.push(utils.workspace.getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.user) { cmd.push.apply(cmd, ["--user", cfg.user]); }

        if (cfg.channel) { cmd.push.apply(cmd, ["--channel", cfg.channel]); }

        cmd.push.apply(cmd, cfg.args);

        return cmd.join(" ");
    }
}