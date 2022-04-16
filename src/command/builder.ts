import * as path from "path";
import { ConfigCommandBuild, 
    ConfigCommandCreate, 
    ConfigCommandInstall, 
    ConfigCommandPackage, 
    ConfigCommandPackageExport, 
    ConfigCommandSource } from "../config/configCommand";

/**
 * Helper function to get absolute path in relative to workspace path
 * If the path to be merged with workspace path is absolute it will return that path itself.
 * If the path is not absolute, it will return absolute path which is merge with workspace path.
 * 
 * @param wsPath Absolute path from workspace
 * @param pathName Path to be merged with workspace
 * @returns 
 */
function getAbsolutePathFromWorkspace(wsPath: string, pathName: string): string {
    if (path.isAbsolute(pathName)) { // Absolute path from the path itself
        return pathName;
    }
    else { // Absolute path in relative to workspace
        return path.join(wsPath, pathName);
    }
}

export class CommandBuilder {
    public static buildCommandConan(python: string): string | undefined{
        let cmd: Array<string> = [];

        if (python !== "" && python !== undefined) {
            cmd.push(python + " -m conans.conan");
        }
        else {
            return undefined;
        }

        return cmd.join(" ");
    }

    public static buildCommandCreate(wsPath: string, python: string, cfg: ConfigCommandCreate): string | undefined {
        let cmd: Array<string> = [];

        if (python !== "" && python !== undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("create");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
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

        cmd.push.apply(cmd, cfg.args);

        return cmd.join(" ");
    }

    public static buildCommandInstall(wsPath: string, python: string, cfg: ConfigCommandInstall): string | undefined {
        let cmd: Array<string> = [];

        if (python !== "" && python !== undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("install");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
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
            cmd.push.apply(cmd, ["-if", getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        cmd.push.apply(cmd, cfg.args);

        return cmd.join(" ");
    }

    public static buildCommandBuild(wsPath: string, python: string, cfg: ConfigCommandBuild): string | undefined {
        let cmd: Array<string> = [];

        if (python !== "" && python !== undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("build");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.installFolder !== "" && cfg.installFolder !== undefined) {
            cmd.push.apply(cmd, ["-if", getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        if (cfg.buildFolder !== "" && cfg.buildFolder !== undefined) {
            cmd.push.apply(cmd, ["-bf", getAbsolutePathFromWorkspace(wsPath, cfg.buildFolder)]);
        }

        if (cfg.packageFolder !== "" && cfg.packageFolder !== undefined) {
            cmd.push.apply(cmd, ["-pf", getAbsolutePathFromWorkspace(wsPath, cfg.packageFolder)]);
        }

        if (cfg.sourceFolder !== "" && cfg.sourceFolder !== undefined) {
            cmd.push.apply(cmd, ["-sf", getAbsolutePathFromWorkspace(wsPath, cfg.sourceFolder)]);
        }

        cmd.push.apply(cmd, cfg.args);

        return cmd.join(" ");
        
    }

    public static buildCommandSource(wsPath: string, python: string, cfg: ConfigCommandSource): string | undefined {
        
        let cmd: Array<string> = [];

        if (python !== "" && python !== undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("source");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.installFolder !== "" && cfg.installFolder !== undefined) {
            cmd.push.apply(cmd, ["-if", getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        if (cfg.sourceFolder !== "" && cfg.sourceFolder !== undefined) {
            cmd.push.apply(cmd, ["-sf", getAbsolutePathFromWorkspace(wsPath, cfg.sourceFolder)]);
        }

        return cmd.join(" ");
    }

    public static buildCommandPackage(wsPath: string, python: string, cfg: ConfigCommandPackage): string | undefined {
        let cmd: Array<string> = [];

        if (python !== "" && python !== undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("package");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.installFolder !== "" && cfg.installFolder !== undefined) {
            cmd.push.apply(cmd, ["-if", getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        if (cfg.buildFolder !== "" && cfg.buildFolder !== undefined) {
            cmd.push.apply(cmd, ["-bf", getAbsolutePathFromWorkspace(wsPath, cfg.buildFolder)]);
        }

        if (cfg.packageFolder !== "" && cfg.packageFolder !== undefined) {
            cmd.push.apply(cmd, ["-pf", getAbsolutePathFromWorkspace(wsPath, cfg.packageFolder)]);
        }

        if (cfg.sourceFolder !== "" && cfg.sourceFolder !== undefined) {
            cmd.push.apply(cmd, ["-sf", getAbsolutePathFromWorkspace(wsPath, cfg.sourceFolder)]);
        }

        return cmd.join(" ");
    }

    public static buildCommandPackageExport(wsPath: string, python: string, cfg: ConfigCommandPackageExport): string | undefined {
        let cmd: Array<string> = [];

        if (python !== "" && python !== undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("export-pkg");
        }
        else {
            return undefined;
        }

        if (cfg.conanRecipe !== "" && cfg.conanRecipe !== undefined) {
            cmd.push(getAbsolutePathFromWorkspace(wsPath, cfg.conanRecipe));
        }
        else {
            return undefined;
        }

        if (cfg.installFolder !== "" && cfg.installFolder !== undefined) {
            cmd.push.apply(cmd, ["-if", getAbsolutePathFromWorkspace(wsPath, cfg.installFolder)]);
        }

        if (cfg.buildFolder !== "" && cfg.buildFolder !== undefined) {
            cmd.push.apply(cmd, ["-bf", getAbsolutePathFromWorkspace(wsPath, cfg.buildFolder)]);
        }

        if (cfg.packageFolder !== "" && cfg.packageFolder !== undefined) {
            cmd.push.apply(cmd, ["-pf", getAbsolutePathFromWorkspace(wsPath, cfg.packageFolder)]);
        }

        if (cfg.sourceFolder !== "" && cfg.sourceFolder !== undefined) {
            cmd.push.apply(cmd, ["-sf", getAbsolutePathFromWorkspace(wsPath, cfg.sourceFolder)]);
        }

        cmd.push.apply(cmd, cfg.args);

        return cmd.join(" ");
    }
}