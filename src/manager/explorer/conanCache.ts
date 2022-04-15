import * as utils from '../../utils'
import * as vscode from 'vscode';
import { ConanAPI } from '../../api/conan/conanAPI';
import { ConanPackageNodeProvider } from '../../ui/treeview/conanPackageProvider';
import { ConanRecipeItem, ConanRecipeNodeProvider } from '../../ui/treeview/conanRecipeProvider';
import { CommandManager } from '../commandManager';

/**
 * Class to manage the treeview explorer of the recipe and binary package
 */
export class ConanCacheExplorerManager extends CommandManager {

    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private conanApi: ConanAPI;
    private nodeProviderConanRecipe: ConanRecipeNodeProvider;
    private nodeProviderConanPackage: ConanPackageNodeProvider;
    private treeViewConanRecipe: vscode.TreeView<any>;
    private treeViewConanPackage: vscode.TreeView<any>;

    public constructor(
        context: vscode.ExtensionContext,
        outputChannel: vscode.OutputChannel,
        conanApi: ConanAPI,
        nodeProviderConanRecipe: ConanRecipeNodeProvider,
        nodeProviderConanPackage: ConanPackageNodeProvider) {
        super();

        this.context = context;
        this.outputChannel = outputChannel;
        this.conanApi = conanApi;
        this.nodeProviderConanRecipe = nodeProviderConanRecipe;
        this.nodeProviderConanPackage = nodeProviderConanPackage;

        // ========== Registering the treeview for the extension
        this.treeViewConanRecipe = vscode.window.createTreeView("vsconan-explorer.treeview.recipe", {
            treeDataProvider: this.nodeProviderConanRecipe
        });

        this.treeViewConanPackage = vscode.window.createTreeView("vsconan-explorer.treeview.package", {
            treeDataProvider: this.nodeProviderConanPackage
        });

        // Register command for recipe treeview
        this.registerCommand("vsconan-explorer.treeview.recipe.refresh", () => this.recipeRefreshTreeview());
        this.registerCommand("vsconan-explorer.item.recipe.selected", () => this.recipeItemSelected());
        this.registerCommand("vsconan-explorer.item.recipe.option.information", (node: ConanRecipeItem) => this.recipeShowInformation(node));
        this.registerCommand("vsconan-explorer.item.recipe.option.open.explorer", (node: ConanRecipeItem) => this.recipeOpenExplorer(node));
        this.registerCommand("vsconan-explorer.item.recipe.option.open.vscode", (node: ConanRecipeItem) => this.recipeOpenVSCode(node));
        this.registerCommand("vsconan-explorer.item.recipe.option.remove", (node: ConanRecipeItem) => this.recipeRemove(node));

        // Register command for binary package treeview
        this.registerCommand("vsconan-explorer.treeview.package.refresh", () => this.packageRefreshTreeview());
        this.registerCommand("vsconan-explorer.item.package.option.information", (node: ConanRecipeItem) => this.packageShowInformation(node));
        this.registerCommand("vsconan-explorer.item.package.option.open.explorer", (node: ConanRecipeItem) => this.packageOpenExplorer(node));
        this.registerCommand("vsconan-explorer.item.package.option.open.vscode", (node: ConanRecipeItem) => this.packageOpenVSCode(node));
        this.registerCommand("vsconan-explorer.item.package.option.remove", (node: ConanRecipeItem) => this.packageRemove(node));
    }

    // ========== RECIPE TREEVIEW COMMANDS

    private recipeRefreshTreeview() {
        this.nodeProviderConanRecipe.refresh();

        // Refreshing the recipe tree explorer will reset the recipe tree explorer and package tree explorer
        this.nodeProviderConanRecipe.setSelectedRecipe(undefined); // Reset the internal selected recipe from the recipeNodeProvider
        this.nodeProviderConanPackage.refresh(""); // Empty the binary package tree explorer
        this.treeViewConanPackage.title = "Conan - Package"; // Reset the title of the treeview
    }

    private recipeItemSelected() {
        this.nodeProviderConanRecipe.setSelectedRecipe(this.treeViewConanRecipe.selection[0].label);

        // Change the title of the treeview for package explorer to match the selected recipe
        this.treeViewConanPackage.title = this.treeViewConanRecipe.selection[0].label;
        this.nodeProviderConanPackage.refresh(this.treeViewConanRecipe.selection[0].label);
    }

    private recipeShowInformation(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        try {
            let recipeInfo = this.conanApi.getRecipeInformation(node.label, python);

            // Create a web view panel
            const panel = vscode.window.createWebviewPanel(
                node.label,
                node.label,
                vscode.ViewColumn.One,
                {}
            );

            panel.webview.html = utils.vsconan.getWebviewContent(recipeInfo!);
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }

    }

    private recipeOpenExplorer(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        try {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.conanApi.getRecipePath(node.label, python)!));
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    private recipeOpenVSCode(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        if (python) {
            try {
                let packagePath = this.conanApi.getRecipePath(node.label, python);
                vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(packagePath!), true);
            }
            catch (err) {
                vscode.window.showErrorMessage((err as Error).message);
            }
        }
        else {
            vscode.window.showErrorMessage("Python Interpreter not defined.");
        }
    }

    private recipeRemove(node: ConanRecipeItem) {
        try {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the recipe '${node.label}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        let python = utils.vsconan.config.getExplorerPython();

                        this.conanApi.removeRecipe(node.label, python);
                        this.nodeProviderConanRecipe.refresh();

                        this.nodeProviderConanPackage.refresh(""); // Empty the binary package treeview
                        this.treeViewConanPackage.title = "Conan - Package"; // Reset the title of the binary package treeview panel
                    }
                });
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    // ========== BINARY PACKAGE TREEVIEW COMMANDS

    private packageRefreshTreeview() {
        this.nodeProviderConanPackage.refresh(this.nodeProviderConanRecipe.getSelectedRecipe());
    }

    private packageShowInformation(node: ConanRecipeItem) {
        // TODO: Show information from the selected recipe
    }

    private packageOpenExplorer(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        try {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.conanApi.getPackagePath(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label, python)!));
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    private packageOpenVSCode(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        if (python !== undefined) {
            try {
                let packagePath = this.conanApi.getPackagePath(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label, python);
                vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(packagePath!), true);
            }
            catch (err) {
                vscode.window.showErrorMessage((err as Error).message);
            }
        }
        else {
            vscode.window.showErrorMessage("Python Interpreter not defined.");
        }
    }

    private packageRemove(node: ConanRecipeItem) {
        try {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the binary package '${node.label}' from '${this.treeViewConanPackage.title!}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        let python = utils.vsconan.config.getExplorerPython();

                        this.conanApi.removePackage(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label, python);

                        this.nodeProviderConanPackage.refresh(this.treeViewConanRecipe.selection[0].label);
                    }
                });
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }
}