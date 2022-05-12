import * as utils from '../../utils';
import * as vscode from 'vscode';
import { ConanAPI } from '../../api/conan/conanAPI';
import { ConanPackageNodeProvider } from '../../ui/treeview/conanPackageProvider';
import { ConanRecipeItem, ConanRecipeNodeProvider } from '../../ui/treeview/conanRecipeProvider';
import { ExtensionManager } from '../extensionManager';

/**
 * Class to manage the treeview explorer of the recipe and binary package
 */
export class ConanCacheExplorerManager extends ExtensionManager {

    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private conanApi: ConanAPI;
    private nodeProviderConanRecipe: ConanRecipeNodeProvider;
    private nodeProviderConanPackage: ConanPackageNodeProvider;
    private treeViewConanRecipe: vscode.TreeView<any>;
    private treeViewConanPackage: vscode.TreeView<any>;

    /**
     * Create the conan cache explorer manager
     * @param context The context of the extension
     * @param outputChannel Output channel of the extension
     * @param conanApi Conan API
     * @param nodeProviderConanRecipe Treedata provider for conan recipe
     * @param nodeProviderConanPackage Treedata provider for conan binary package
     */
    public constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel, 
        conanApi: ConanAPI, nodeProviderConanRecipe: ConanRecipeNodeProvider, nodeProviderConanPackage: ConanPackageNodeProvider) {
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
        this.registerCommand("vsconan.explorer.treeview.recipe.refresh", () => this.recipeRefreshTreeview());
        this.registerCommand("vsconan.explorer.treeview.recipe.item.selected", () => this.recipeItemSelected());
        this.registerCommand("vsconan.explorer.treeview.recipe.item.information", (node: ConanRecipeItem) => this.recipeShowInformation(node));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open-explorer", (node: ConanRecipeItem) => this.recipeOpenExplorer(node));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open-vscode", (node: ConanRecipeItem) => this.recipeOpenVSCode(node));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.remove", (node: ConanRecipeItem) => this.recipeRemove(node));

        // Register command for binary package treeview
        this.registerCommand("vsconan.explorer.treeview.package.refresh", () => this.packageRefreshTreeview());
        this.registerCommand("vsconan.explorer.treeview.package.dirty.show", () => this.showDirtyPackage());
        this.registerCommand("vsconan.explorer.treeview.package.dirty.hide", () => this.hideDirtyPackage());
        this.registerCommand("vsconan.explorer.treeview.package.item.information", (node: ConanRecipeItem) => this.packageShowInformation(node));
        this.registerCommand("vsconan.explorer.treeview.package.item.open-explorer", (node: ConanRecipeItem) => this.packageOpenExplorer(node));
        this.registerCommand("vsconan.explorer.treeview.package.item.open-vscode", (node: ConanRecipeItem) => this.packageOpenVSCode(node));
        this.registerCommand("vsconan.explorer.treeview.package.item.remove", (node: ConanRecipeItem) => this.packageRemove(node));
    }

    // ========== RECIPE TREEVIEW COMMANDS

    /**
     * Refresh the recipe treeview
     */
    private recipeRefreshTreeview() {
        this.nodeProviderConanRecipe.refresh();

        // Refreshing the recipe tree explorer will reset the recipe tree explorer and package tree explorer
        this.nodeProviderConanRecipe.setSelectedRecipe(undefined); // Reset the internal selected recipe from the recipeNodeProvider
        this.nodeProviderConanPackage.refresh("", this.context.workspaceState.get("show-dirty")!); // Empty the binary package tree explorer
        this.treeViewConanPackage.title = "Conan - Package"; // Reset the title of the treeview
    }

    /**
     * Callback method if a recipe item in the treeview in selected
     */
    private recipeItemSelected() {
        this.nodeProviderConanRecipe.setSelectedRecipe(this.treeViewConanRecipe.selection[0].label);

        // Change the title of the treeview for package explorer to match the selected recipe
        this.treeViewConanPackage.title = this.treeViewConanRecipe.selection[0].label;
        this.nodeProviderConanPackage.refresh(this.treeViewConanRecipe.selection[0].label, this.context.workspaceState.get("show-dirty")!);
    }

    /**
     * Method to show the information of a selected recipe.
     * To view the information we will use a web view panel in this case
     * @param node Selected recipe node item
     */
    private recipeShowInformation(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        try {
            let recipeInfo = this.conanApi.getRecipeInformation(node.label);

            // Create a web view panel
            const panel = vscode.window.createWebviewPanel(
                node.label,
                node.label,
                vscode.ViewColumn.One,
                {}
            );

            // Equipped the plain JSON text with HTML elements
            panel.webview.html = this.getWebviewContent(recipeInfo!);
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }
    
    /**
     * Open the selected recipe in the file explorer
     * @param node Selected recipe node item
     */
    private recipeOpenExplorer(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        try {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.conanApi.getRecipePath(node.label)!));
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    /**
     * Open the selected recipe in a new VSCode window
     * @param node Selected recipe node item
     */
    private recipeOpenVSCode(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        if (python) {
            try {
                let packagePath = this.conanApi.getRecipePath(node.label);
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

    /**
     * Remove selected recipe
     * @param node Selected recipe node item to be removed
     */
    private recipeRemove(node: ConanRecipeItem) {
        try {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the recipe '${node.label}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        let python = utils.vsconan.config.getExplorerPython();

                        this.conanApi.removeRecipe(node.label);
                        this.nodeProviderConanRecipe.refresh();

                        this.nodeProviderConanPackage.refresh("", this.context.workspaceState.get("show-dirty")!); // Empty the binary package treeview
                        this.treeViewConanPackage.title = "Conan - Package"; // Reset the title of the binary package treeview panel
                    }
                });
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    // ========== BINARY PACKAGE TREEVIEW COMMANDS

    /**
     * Refresh binary package treeview
     */
    private packageRefreshTreeview() {
        this.nodeProviderConanPackage.refresh(this.nodeProviderConanRecipe.getSelectedRecipe(), this.context.workspaceState.get("show-dirty")!);
    }

    private showDirtyPackage() {
        vscode.commands.executeCommand('setContext', 'show-dirty', true);
        this.context.workspaceState.update("show-dirty", true);
        this.nodeProviderConanPackage.refresh(this.nodeProviderConanRecipe.getSelectedRecipe(), true);
    }

    private hideDirtyPackage() {
        vscode.commands.executeCommand('setContext', 'show-dirty', false);
        this.context.workspaceState.update("show-dirty", false);
        this.nodeProviderConanPackage.refresh(this.nodeProviderConanRecipe.getSelectedRecipe(), false);
    }

    /**
     * Show binary package information
     * Still in the todo list. Need to figure out how to obtain this information
     * @param node Selected binary package node item
     */
    private packageShowInformation(node: ConanRecipeItem) {
        // TODO: Show information from the selected recipe
    }

    /**
     * Open selected binary package in the file explorer
     * @param node Selected binary package node item
     */
    private packageOpenExplorer(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        try {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.conanApi.getPackagePath(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label)!));
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    /**
     * Open selected binary package in VS Code
     * @param node Selected binary package node item
     */
    private packageOpenVSCode(node: ConanRecipeItem) {
        let python = utils.vsconan.config.getExplorerPython();

        if (python !== undefined) {
            try {
                let packagePath = this.conanApi.getPackagePath(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label);
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

    /**
     * Remove selected binary package
     * @param node Selected binary package node item to be removed
     */
    private packageRemove(node: ConanRecipeItem) {
        try {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the binary package '${node.label}' from '${this.treeViewConanPackage.title!}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        let python = utils.vsconan.config.getExplorerPython();

                        this.conanApi.removePackage(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label);

                        this.nodeProviderConanPackage.refresh(this.treeViewConanRecipe.selection[0].label, this.context.workspaceState.get("show-dirty")!);
                    }
                });
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    /**
     * Temporary utility function to get HTML structure.
     * Currently this method is created for one specific reason, to view recipe information in the web view.
     * @param content Content of the HTML to be written in
     * @returns Complete HTML structure with the content in string format
     */
    private getWebviewContent(content: string) {
        return `
    <html>
    <body>
    <pre>
    <code>
    ${content}
    </code>
    </pre>
    </body>
    </html>`;
    }
}