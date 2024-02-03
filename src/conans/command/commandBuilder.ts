import {
    ConfigCommandBuild,
    ConfigCommandCreate,
    ConfigCommandInstall,
    ConfigCommandPackage,
    ConfigCommandPackageExport,
    ConfigCommandSource
} from "./configCommand";

/**
 * Static class to build command for some conan workflow based on the configuration. 
 */
export abstract class  CommandBuilder {
    /**
     * Build command for 'conan create'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan create' | undefined on error
     */
    public abstract buildCommandCreate(wsPath: string, cfg: ConfigCommandCreate): string | undefined;

    /**
     * Build command for 'conan install'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan install' | undefined on error
     */
    public abstract buildCommandInstall(wsPath: string, cfg: ConfigCommandInstall): string | undefined;

    /**
     * Build command for 'conan build'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan build' | undefined on error
     */
    public abstract buildCommandBuild(wsPath: string, cfg: ConfigCommandBuild): string | undefined;

    /**
     * Build command for 'conan source'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan source' | undefined on error
     */
    public abstract buildCommandSource(wsPath: string, cfg: ConfigCommandSource): string | undefined;

    /**
     * Build command for 'conan package'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param python Path to python interpreter, where conan is installed
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan package' | undefined on error
     */
    public abstract buildCommandPackage(wsPath: string, cfg: ConfigCommandPackage): string | undefined;

    /**
     * Build command for 'conan export-pkg'
     * @param wsPath Absolute path of conan workspace. This is needed since user can put a relative path, which means relative path to the workspace.
     * @param python Path to python interpreter, where conan is installed
     * @param cfg Command configuration
     * @returns Full CLI command for 'conan export-pkg' | undefined on error
     */
    public abstract buildCommandPackageExport(wsPath: string, cfg: ConfigCommandPackageExport): string | undefined;
}