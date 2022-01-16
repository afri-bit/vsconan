import { UriHandler } from "vscode";
import * as utils from "../../utils/utils";
import * as fs from "fs";
import * as path from "path";
import { ConfigCommandBuild, 
    ConfigCommandCreate, 
    ConfigCommandInstall, 
    ConfigCommandPackage, 
    ConfigCommandPackageExport, 
    ConfigCommandSource } from "../../config/configCommand"

function getWorkspaceAbsolutePath(pathName: string): string {
    if (path.isAbsolute(pathName))
        return pathName;
    else
        return path.join(utils.getWorkspaceFolder()!, pathName);
}

export class CommandBuilder {
    public static buildCommandConan(python: string): string | undefined{
        let cmd: Array<string> = [];

        if (python != "" && python != undefined) 
            cmd.push(python + " -m conans.conan");
        else
            return undefined;

        return cmd.join(" ");
    }

    public static buildCommandCreate(python: string, cfg: ConfigCommandCreate): string | undefined {
        let cmd: Array<string> = [];

        if (python != "" && python != undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("create");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe != "" && cfg.conanRecipe != undefined)
            cmd.push(getWorkspaceAbsolutePath(cfg.conanRecipe));
        else
            return undefined;

        if ((cfg.user != undefined && cfg.user != "") && (cfg.channel != undefined && cfg.channel != ""))
            cmd.push(cfg.user + "/" + cfg.channel);

        if (cfg.profile != "" && cfg.profile != undefined)
            cmd.push.apply(cmd, ["-pr", cfg.profile]);

        cmd.push.apply(cmd, cfg.args);

        return cmd.join(" ");
    }

    public static buildCommandInstall(python: string, cfg: ConfigCommandInstall): string | undefined {
        let cmd: Array<string> = [];

        if (python != "" && python != undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("install");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe != "" && cfg.conanRecipe != undefined)
            cmd.push(getWorkspaceAbsolutePath(cfg.conanRecipe));
        else
            return undefined;

        if ((cfg.user != undefined && cfg.user != "") && (cfg.channel != undefined && cfg.channel != ""))
            cmd.push(cfg.user + "/" + cfg.channel);

        if (cfg.profile != "" && cfg.profile != undefined)
            cmd.push.apply(cmd, ["-pr", cfg.profile]);

        if (cfg.installFolder != "" && cfg.installFolder != undefined)
            cmd.push.apply(cmd, ["-if", getWorkspaceAbsolutePath(cfg.installFolder)]);

        cmd.push.apply(cmd, cfg.args);

        return cmd.join(" ");
    }

    public static buildCommandBuild(python: string, cfg: ConfigCommandBuild): string | undefined {
        let cmd: Array<string> = [];

        if (python != "" && python != undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("build");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe != "" && cfg.conanRecipe != undefined)
            cmd.push(getWorkspaceAbsolutePath(cfg.conanRecipe));
        else
            return undefined;

        if (cfg.installFolder != "" && cfg.installFolder != undefined)
            cmd.push.apply(cmd, ["-if", getWorkspaceAbsolutePath(cfg.installFolder)]);

        if (cfg.buildFolder != "" && cfg.buildFolder != undefined)
            cmd.push.apply(cmd, ["-bf", getWorkspaceAbsolutePath(cfg.buildFolder)]);

        if (cfg.packageFolder != "" && cfg.packageFolder != undefined)
            cmd.push.apply(cmd, ["-pf", getWorkspaceAbsolutePath(cfg.packageFolder)]);

        if (cfg.sourceFolder != "" && cfg.sourceFolder != undefined)
            cmd.push.apply(cmd, ["-sf", getWorkspaceAbsolutePath(cfg.sourceFolder)]);

        cmd.push.apply(cmd, cfg.args);

        return cmd.join(" ");
        
    }

    public static buildCommandSource(python: string, cfg: ConfigCommandSource): string | undefined {
        
        let cmd: Array<string> = [];

        if (python != "" && python != undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("source");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe != "" && cfg.conanRecipe != undefined)
            cmd.push(getWorkspaceAbsolutePath(cfg.conanRecipe));
        else
            return undefined;

        if (cfg.installFolder != "" && cfg.installFolder != undefined)
            cmd.push.apply(cmd, ["-if", getWorkspaceAbsolutePath(cfg.installFolder)]);

        if (cfg.sourceFolder != "" && cfg.sourceFolder != undefined)
            cmd.push.apply(cmd, ["-sf", getWorkspaceAbsolutePath(cfg.sourceFolder)]);

        return cmd.join(" ");
    }

    public static buildCommandPackage(python: string, cfg: ConfigCommandPackage): string | undefined {
        let cmd: Array<string> = [];

        if (python != "" && python != undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("package");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe != "" && cfg.conanRecipe != undefined)
            cmd.push(getWorkspaceAbsolutePath(cfg.conanRecipe));
        else
            return undefined;

        if (cfg.installFolder != "" && cfg.installFolder != undefined)
            cmd.push.apply(cmd, ["-if", getWorkspaceAbsolutePath(cfg.installFolder)]);

        if (cfg.buildFolder != "" && cfg.buildFolder != undefined)
            cmd.push.apply(cmd, ["-bf", getWorkspaceAbsolutePath(cfg.buildFolder)]);

        if (cfg.packageFolder != "" && cfg.packageFolder != undefined)
            cmd.push.apply(cmd, ["-pf", getWorkspaceAbsolutePath(cfg.packageFolder)]);

        if (cfg.sourceFolder != "" && cfg.sourceFolder != undefined)
            cmd.push.apply(cmd, ["-sf", getWorkspaceAbsolutePath(cfg.sourceFolder)]);

        return cmd.join(" ");
    }

    public static buildCommandPackageExport(python: string, cfg: ConfigCommandPackageExport): string | undefined {
        let cmd: Array<string> = [];

        if (python != "" && python != undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("export-pkg");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe != "" && cfg.conanRecipe != undefined)
            cmd.push(getWorkspaceAbsolutePath(cfg.conanRecipe));
        else
            return undefined;

        if (cfg.installFolder != "" && cfg.installFolder != undefined)
            cmd.push.apply(cmd, ["-if", getWorkspaceAbsolutePath(cfg.installFolder)]);

        if (cfg.buildFolder != "" && cfg.buildFolder != undefined)
            cmd.push.apply(cmd, ["-bf", getWorkspaceAbsolutePath(cfg.buildFolder)]);

        if (cfg.packageFolder != "" && cfg.packageFolder != undefined)
            cmd.push.apply(cmd, ["-pf", getWorkspaceAbsolutePath(cfg.packageFolder)]);

        if (cfg.sourceFolder != "" && cfg.sourceFolder != undefined)
            cmd.push.apply(cmd, ["-sf", getWorkspaceAbsolutePath(cfg.sourceFolder)]);

        cmd.push.apply(cmd, cfg.args);

        return cmd.join(" ");
    }
}