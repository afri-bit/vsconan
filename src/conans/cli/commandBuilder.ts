import * as utils from "../../utils/utils";
import { ConfigCommandBuild, 
    ConfigCommandCreate, 
    ConfigCommandInstall, 
    ConfigCommandPackage, 
    ConfigCommandPackageExport, 
    ConfigCommandSource } from "./configCommand";

/**
 * Static class to build command for some conan workflow based on the configuration. 
 */
export class CommandBuilder {
    /**
     * Build command for 'conan create'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param python Path to python interpreter, where conan is installed
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan create' | undefined on error
     */
    public static buildCommandCreate(wsPath: string, python: string, cfg: ConfigCommandCreate): string | undefined {
        // Initialized the command in array of string. Later on will be converted to plain string.
        let cmd: Array<string> = [];

        if (python !== "" && python !== undefined) {
            cmd.push(python + " -m conans.conan");  // Standard CLI command for conan using python module
            cmd.push("create");
        }
        else {
            return undefined;
        }

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

        return cmd.join(" ");
    }

    /**
     * Build command for 'conan install'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param python Path to python interpreter, where conan is installed
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan install' | undefined on error
     */
    public static buildCommandInstall(wsPath: string, python: string, cfg: ConfigCommandInstall): string | undefined {
        let cmd: Array<string> = [];

        if (python !== "" && python !== undefined) {
            cmd.push(python + " -m conans.conan");
            cmd.push("install");
        }
        else {
            return undefined;
        }

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

        return cmd.join(" ");
    }

    /**
     * Build command for 'conan build'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param python Path to python interpreter, where conan is installed
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan build' | undefined on error
     */
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

        return cmd.join(" ");
        
    }

    /**
     * Build command for 'conan source'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param python Path to python interpreter, where conan is installed
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan source' | undefined on error
     */
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

        return cmd.join(" ");
    }

    /**
     * Build command for 'conan package'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param python Path to python interpreter, where conan is installed
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan package' | undefined on error
     */
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

        return cmd.join(" ");
    }

    /**
     * Build command for 'conan export-pkg'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param python Path to python interpreter, where conan is installed
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan export-pkg' | undefined on error
     */
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

        return cmd.join(" ");
    }
}