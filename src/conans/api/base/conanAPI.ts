import { ConanRecipe } from "../../model/conanRecipe";
import { ConanPackage } from "../../model/conanPackage";
import { ConanProfile } from "../../model/conanProfile";
import { ConanRemote } from "../../model/conanRemote";
import { ConanPackageRevision } from "../../model/conanPackageRevision";
import { RecipeFolderOption } from "../../conan/api/conanAPI";

export enum ConanExecutionMode {
    python = 1,
    conan
}

/**
 * Class to interact with the conan package manager
 * 
 * Currently the Conan API relies on the conan CLI. There is no direct API from conan, except with python.
 * The whole API mechanism will use diffrent approaches, such as filesystem and CLI.
 * Most of the public method of this class requires path to the python interpreter, before calling the API methods
 * the extension will read the configuration file, where user stores the python interpreter.
 * 
 * This will be adapted in the future using file watcher instead.
 */
export abstract class ConanAPI {
    protected conanExecutor: string = "";
    protected pythonInterpreter: string;
    protected conanExecutable: string;
    protected conanExecutionMode: ConanExecutionMode;

    public constructor(pythonInterpreter: string, conanExecutable: string, conanExecutionMode: ConanExecutionMode) {
        this.pythonInterpreter = pythonInterpreter;
        this.conanExecutable = conanExecutable;
        this.conanExecutionMode = conanExecutionMode;
    }

    /**
     * Method to the conan version
     * @returns <string> Conan version
     */
    public getConanVersion(): string {
        // TODO: Fill the implementation. This should either be same or different between conan version 1 and 2
        return "";
    }

    /**
     * Method to switch execution mode of conan.
     * There are two options to install and use conan, python package or alternative installation.
     * If the mode is python, it will use the python module command.
     * If the mode is conan, it means that it will use the conan executable approach.
     * @param mode <ConanExecutionMode> python interpreter mode or alternative mode (conan executable)
     */
    public abstract switchExecutionMode(mode: ConanExecutionMode): void;

    /**
     * Setter method for python interpreter
     * @param python Path to python interpreter
     */
    public abstract setPythonInterpreter(python: string): void;

    /**
     * Method to switch this API to use python interpreter execution approach
     * @param pythonInterpreter Path to the python interpreter
     */
    public abstract switchToPythonMode(pythonInterpreter: string): void;

    /**
     * Setter method for conan executable
     * @param conanExecutable Path to the conan executable
     */
    public abstract setConanExecutable(conanExecutable: string): void;

    /**
     * Method to switch this API to use conan executable execution approach
     * @param conanExecutable Path to the conan executable
     */
    public abstract switchToConanExecutableMode(conanExecutable: string): void;

    /**
     * Method to get the home folder of conan by using CLI
     * @param python
     * @returns Path to conan home folder | undefined on error
     */
    public abstract getConanHomePath(): string | undefined;

    /**
     * Method to get the path where all the profiles are located
     * This method depends on the conan home directory, which can be configured by the user.
     * @param python
     * @returns Full path to the conan profiles directory | undefined on error
     */
    public abstract getConanProfilesPath(): string | undefined;

    /**
     * Method to get absolute path to selected conan profile.
     * @param profileName Conan profile name
     * @returns Absolute path to the selected conan profile | undefined on error
     */
    public abstract getProfileFilePath(profileName: string): string | undefined;

    /**
     * Method to get the conan recipe path in the local cache
     * To get the path in this method, we will create the path based on 
     * the folder structure pattern in the local cache, that is created by Conan.
     * @param recipe Conan recipe name
     * @returns Absolute path to the local cache of the recipe | undefined on error
     */
    public abstract getRecipePath(recipe: string): string | undefined;

    /**
     * Method to get the specified binary package path.
     * This method doesnt use original Conan CLI but constructs the path based recipe and package ID
     * to navigate through the file system.
     * Required basic information is the Conan home folder. 
     * @param recipe Conan recipe name
     * @param packageId Binary package Id that belongs to the recipe
     * @returns Absolute path to the binary package folder | undefined on error
     */
    public abstract getPackagePath(recipe: string, packageId: string): string | undefined;

    /**
     * Method to get list of existing recipe in the local cache.
     * This method uses combination of CLI and filesystem that is provided by Conan itself.
     * We will execute one of the conan commands and write the result into a JSON file.
     * @returns List of all recipes in the local cache
     */
    public abstract getRecipes(): Array<ConanRecipe>;

    /**
     * Method to get list of existing profiles.
     * This method executes the Conan CLI and stores the result in a JSON file
     * @returns List of all exisiting profiles
     */
    public abstract getProfiles(): Array<string>;

    /**
     * Get list of packages from a specific recipe
     * @param recipe Recipe ID to get the packages from
     * @returns Return will be an array of dictionary / map from JSON file
     */
    public abstract getPackages(recipe: string): Array<ConanPackage>;

    /**
     * Method to get absolute path to the Conan remote json file.
     * This json file stores all the information about all the remotes information users configure
     * @returns Absolute path to the Conan remote json file | undefined on error
     */
    public abstract getRemoteFilePath(): string | undefined;

    /**
     * Get the list of available remotes
     * @returns List of availabel remotes
     */
    public abstract getRemotes(): Array<ConanRemote>;

    /**
     * Method to remove a selected binary package from its recipe
     * @param recipe Conan recipe name
     * @param packageId Selected package Id to be removed
     */
    public abstract removePackage(recipe: string, packageId: string): void;

    /**
     * Remove a selected recipe from the local cache
     * @param recipe Conan recipe name to be removed
     */
    public abstract removeRecipe(recipe: string): void;

    /**
     * Remove a selected conan profile
     * To make the process quicker, we will delete the file directly from the system.
     * In this case, we don't use the Conan CLI
     * @param profile Conan profile name to be removed
     */
    public abstract removeProfile(profile: string): void;

    /**
     * Add a new remote
     * @param remote Remote name
     * @param url URL that belongs to the remote
     */
    public abstract addRemote(remote: string, url: string): void;

    /**
     * Remove a selected remote from Conan
     * @param remote Remote name to be removed
     */
    public abstract removeRemote(remote: string): void;

    /**
     * Enable/disable selected remote
     * @param remote Remote name
     * @param enable State to enable or disable
     */
    public abstract enableRemote(remote: string, enable: boolean): void;

    /**
     * Rename selected remote
     * @param remoteName Remote name to be renamed
     * @param newName New name for the remote
     */
    public abstract renameRemote(remoteName: string, newName: string): void;

    /**
     * Edit URL of the selected remote
     * @param remoteName Remote name to be modified
     * @param url New URL for the selected remote
     */
    public abstract updateRemoteURL(remoteName: string, url: string): void;

    /**
     * Rename a selected profile
     * For this method we will use the file system approach again.
     * @param oldProfileName Profile name to be renamed
     * @param newProfileName New profile name
     */
    public abstract renameProfile(oldProfileName: string, newProfileName: string): void;

    /**
     * Method to duplicate selected profile.
     * Sometimes we don't want to write everything from scratch, but just want to edit a small detail.
     * Therefore we can just use this method to duplicate an existing profile and give it a new name.
     * @param oldProfileName Profile name to be duplicated
     * @param newProfileName New profile name
     * 
     */
    public abstract duplicateProfile(oldProfileName: string, newProfileName: string): void;

    /**
     * Create a new profile
     * @param profileName Name for the new profile
     */
    public abstract createNewProfile(profileName: string): void;

    /**
     * Method to retrieve recipe general information such as name, version, license and many more.
     * This method uses Conan CLI to get the recipe information and stores it in a JSON file.
     * @param recipeName Recipe name to get the information from
     * @returns Recipe general information in JSON string format | undefined on error
     */
    public abstract getRecipeInformation(recipeName: string): string | undefined;

    /**
     * Function to obtain dirty packages from a recipe
     * To search for a dirty package conan CLI cannot be used directly, therefore
     * we need to go through the file system to find files with '.dirty' extension
     * @param recipeName Recipe name to get the dirty packages from
     */
    public abstract getDirtyPackage(recipeName: string): Array<ConanPackage>;

    /**
     * Function to obtain list of recipe of editable packages
     * This function is a workaround that parses a plain string to obtain the information about editable packages
     * Conan only output its own text formatting for this purpose (not YAML, not JSON)
     * We are currently doing this parsing by asuming that the text that we get is ideal (kinda brute force way)
     * Fingers crossed!!!
     * @returns List of editable list
     */
    public abstract getEditablePackageRecipes(): Array<ConanRecipe>;

    /**
     * Method to remove a package from editable mode
     * @param recipe Package recipe name
     */
    public abstract removeEditablePackageRecipe(recipe: string): void;

    /**
     * Method to add an editable package
     * @param recipePath Path to conan recipe
     * @param name Name of the package in the recipe (must be the same name as in the recipe)
     * @param user Conan user for the package
     * @param channel Conan channel for the package
     * @param layout Predefined layout file for editable package (Can be a full path to the layout file) 
     *               For further information please refer to official documentation from conan.
     */
    public abstract addEditablePackage(recipePath: string, name: string, user: string, channel: string, layout: string): void;

    /**
     * Method to extract recipe attribute from a recipe file
     * @param recipePath Path to recipe file
     * @param attribute Attribute to be extracted from the recipe
     * @returns Attribute information in string format
     */
    public abstract getRecipeAttribute(recipePath: string, attribute: string): string;

    /**
     * Method to get all the recipes based on selected remote
     * @param remote Remote name to filter the source of the recipes
     */
    public abstract getRecipesByRemote(remote: string): Array<ConanRecipe>;

    /**
     * Open a specific path from the recipe folder
     * There are several folders, that exits based on the way you build the package.
     * For example 'build', 'dl', 'source', etc. 
     * @param recipe Recipe name
     * @param folderOption Option of the folder to be opened.
     */
    public abstract getFolderPathFromRecipe(recipe: string, folderOption: RecipeFolderOption): string;
    
    /*
     * Method to get all the binary packages from a recipe based on selected remote
     * @param recipe Recipe name to get the binary packages from
     * @param remote Remote name to filter the source of the binary packages
     */
    public abstract getPackagesByRemote(recipe: string, remote: string): Array<ConanPackage>;

    /**
     * Method to get all the package revisions from a package ID
     * !!! Attention - this package revision only works on Conan 2 !!!
     * @param recipe Recipe name to get the binary package from
     * @param packageId Selected package Id to search package revision from
     */
    public abstract getPackageRevisions(recipe: string, packageId: string): Array<ConanPackageRevision>;

    /**
     * Method to get the path to the package revision in the local cache
     * !!! Attention - this API only works for Conan 2 !!!
     * @param recipe Recipe name to get the binary package from
     * @param packageId Selected package id to search for the package revision
     * @param revisionId Selected package revision id to get the path from
     */
    public abstract getPackageRevisionPath(recipe: string, packageId: string, revisionId: string): string | undefined;
}