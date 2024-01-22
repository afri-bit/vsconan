import * as vscode from 'vscode';
import { ConanAPIManager } from '../../../conans/api/conanAPIManager';
import { RecipeFolderOption } from '../../../conans/conan/api/conanAPI';
import { ConfigurationManager } from '../../config/configManager';
import { ConanPackageItem, ConanPackageNodeProvider } from '../../ui/treeview/conanPackageProvider';
import { ConanPackageRevisionItem, ConanPackageRevisionNodeProvider } from '../../ui/treeview/conanPackageRevisionProvider';
import { ConanRecipeItem, ConanRecipeNodeProvider } from '../../ui/treeview/conanRecipeProvider';
import { ExtensionManager } from '../extensionManager';

/**
 * Class to manage the treeview explorer of the recipe and binary package
 */
export class ConanCacheExplorerManager extends ExtensionManager {

    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private conanApiManager: ConanAPIManager;
    private configManager: ConfigurationManager;
    private nodeProviderConanRecipe: ConanRecipeNodeProvider;
    private nodeProviderConanPackage: ConanPackageNodeProvider;
    private nodeProviderConanPackageRevision: ConanPackageRevisionNodeProvider;
    private treeViewConanRecipe: vscode.TreeView<any>;
    private treeViewConanPackage: vscode.TreeView<any>;
    private treeViewConanPackageRevision: vscode.TreeView<any>;

    /**
     * Create the conan cache explorer manager
     * @param context The context of the extension
     * @param outputChannel Output channel of the extension
     * @param conanApi Conan API
     * @param nodeProviderConanRecipe Treedata provider for conan recipe
     * @param nodeProviderConanPackage Treedata provider for conan binary package
     */
    public constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel,
        conanApiManager: ConanAPIManager, configManager: ConfigurationManager,
        nodeProviderConanRecipe: ConanRecipeNodeProvider,
        nodeProviderConanPackage: ConanPackageNodeProvider,
        nodeProviderConanPackageRevision: ConanPackageRevisionNodeProvider) {
        super();

        this.context = context;
        this.outputChannel = outputChannel;
        this.conanApiManager = conanApiManager;
        this.configManager = configManager;
        this.nodeProviderConanRecipe = nodeProviderConanRecipe;
        this.nodeProviderConanPackage = nodeProviderConanPackage;
        this.nodeProviderConanPackageRevision = nodeProviderConanPackageRevision;

        // ========== Registering the treeview for the extension
        this.treeViewConanRecipe = vscode.window.createTreeView("vsconan-explorer.treeview.recipe", {
            treeDataProvider: this.nodeProviderConanRecipe
        });

        this.treeViewConanPackage = vscode.window.createTreeView("vsconan-explorer.treeview.package", {
            treeDataProvider: this.nodeProviderConanPackage
        });

        this.treeViewConanPackageRevision = vscode.window.createTreeView("vsconan-explorer.treeview.package.revision", {
            treeDataProvider: this.nodeProviderConanPackageRevision
        });

        // Register command for recipe treeview
        this.registerCommand("vsconan.explorer.treeview.recipe.refresh", () => this.recipeRefreshTreeview());
        this.registerCommand("vsconan.explorer.treeview.recipe.filter.set", () => this.recipeSetFilter());
        this.registerCommand("vsconan.explorer.treeview.recipe.filter.clear", () => this.recipeClearFilter());
        this.registerCommand("vsconan.explorer.treeview.recipe.item.selected", () => this.recipeItemSelected());
        this.registerCommand("vsconan.explorer.treeview.recipe.item.information", (node: ConanRecipeItem) => this.recipeShowInformation(node));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open-explorer", (node: ConanRecipeItem) => this.recipeOpenExplorer(node));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open-vscode", (node: ConanRecipeItem) => this.recipeOpenVSCode(node));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.remove", (node: ConanRecipeItem) => this.recipeRemove(node));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.copy-clipboard", (node: ConanRecipeItem) => this.recipeCopyPathToClipboard(node));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.explorer.build", (node: ConanRecipeItem) => this.recipeOpenFolderInExplorer(node, RecipeFolderOption.build));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.explorer.download", (node: ConanRecipeItem) => this.recipeOpenFolderInExplorer(node, RecipeFolderOption.download));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.explorer.export", (node: ConanRecipeItem) => this.recipeOpenFolderInExplorer(node, RecipeFolderOption.export));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.explorer.export-source", (node: ConanRecipeItem) => this.recipeOpenFolderInExplorer(node, RecipeFolderOption.exportSource));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.explorer.locks", (node: ConanRecipeItem) => this.recipeOpenFolderInExplorer(node, RecipeFolderOption.locks));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.explorer.source", (node: ConanRecipeItem) => this.recipeOpenFolderInExplorer(node, RecipeFolderOption.source));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.explorer.scm-source", (node: ConanRecipeItem) => this.recipeOpenFolderInExplorer(node, RecipeFolderOption.scmSource));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.vscode.build", (node: ConanRecipeItem) => this.recipeOpenFolderInVSCode(node, RecipeFolderOption.build));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.vscode.download", (node: ConanRecipeItem) => this.recipeOpenFolderInVSCode(node, RecipeFolderOption.download));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.vscode.export", (node: ConanRecipeItem) => this.recipeOpenFolderInVSCode(node, RecipeFolderOption.export));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.vscode.export-source", (node: ConanRecipeItem) => this.recipeOpenFolderInVSCode(node, RecipeFolderOption.exportSource));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.vscode.locks", (node: ConanRecipeItem) => this.recipeOpenFolderInVSCode(node, RecipeFolderOption.locks));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.vscode.source", (node: ConanRecipeItem) => this.recipeOpenFolderInVSCode(node, RecipeFolderOption.source));
        this.registerCommand("vsconan.explorer.treeview.recipe.item.open.vscode.scm-source", (node: ConanRecipeItem) => this.recipeOpenFolderInVSCode(node, RecipeFolderOption.scmSource));

        // Register command for binary package treeview
        this.registerCommand("vsconan.explorer.treeview.package.refresh", () => this.packageRefreshTreeview());
        this.registerCommand("vsconan.explorer.treeview.package.filter.set", () => this.packageSetFilter());
        this.registerCommand("vsconan.explorer.treeview.package.filter.clear", () => this.packageClearFilter());
        this.registerCommand("vsconan.explorer.treeview.package.dirty.show", () => this.showDirtyPackage());
        this.registerCommand("vsconan.explorer.treeview.package.dirty.hide", () => this.hideDirtyPackage());
        this.registerCommand("vsconan.explorer.treeview.package.item.selected", () => this.packageItemSelected());
        this.registerCommand("vsconan.explorer.treeview.package.item.information", (node: ConanPackageItem) => this.packageShowInformation(node));
        this.registerCommand("vsconan.explorer.treeview.package.item.open-explorer", (node: ConanPackageItem) => this.packageOpenExplorer(node));
        this.registerCommand("vsconan.explorer.treeview.package.item.open-vscode", (node: ConanPackageItem) => this.packageOpenVSCode(node));
        this.registerCommand("vsconan.explorer.treeview.package.item.remove", (node: ConanPackageItem) => this.packageRemove(node));
        this.registerCommand("vsconan.explorer.treeview.package.item.copy-clipboard", (node: ConanPackageItem) => this.packageCopyPathToClipboard(node));

        // Register command for binary package revision treeview
        this.registerCommand("vsconan.explorer.treeview.package.revision.refresh", () => this.packageRevisionRefreshTreeview());
        this.registerCommand("vsconan.explorer.treeview.package.revision.item.selected", () => this.packageRevisionItemSelected());
        this.registerCommand("vsconan.explorer.treeview.package.revision.item.information", (node: ConanPackageRevisionItem) => this.packageRevisionShowInformation(node));
        this.registerCommand("vsconan.explorer.treeview.package.revision.item.open-explorer", (node: ConanPackageRevisionItem) => this.packageRevisionOpenExplorer(node));
        this.registerCommand("vsconan.explorer.treeview.package.revision.item.open-vscode", (node: ConanPackageRevisionItem) => this.packageRevisionOpenVSCode(node));
        this.registerCommand("vsconan.explorer.treeview.package.revision.item.remove", (node: ConanPackageRevisionItem) => this.packageRevisionRemove(node));
        this.registerCommand("vsconan.explorer.treeview.package.revision.item.copy-clipboard", (node: ConanPackageRevisionItem) => this.packageRevisionCopyPathToClipboard(node));
    }

    // ========== RECIPE TREEVIEW COMMANDS

    /**
     * Refresh the recipe treeview
     */
    private recipeRefreshTreeview() {
        this.nodeProviderConanRecipe.refresh();

        // Refreshing the recipe tree explorer will reset the recipe tree explorer and package tree explorer
        this.nodeProviderConanRecipe.setSelectedRecipe(undefined); // Reset the internal selected recipe from the recipeNodeProvider

        // Change the title of the Conan Recipe Treeview to have filter name inside that
        if (this.configManager.isRecipeFiltered()) {
            this.treeViewConanRecipe.title = `Conan - Recipe (Remote: ${this.configManager.getRecipeFilterKey()})`;
        }
        else {
            this.treeViewConanRecipe.title = "Conan - Recipe";
        }

        // Refreshing the package treeview, following single responsibility principal
        this.packageRefreshTreeview();
    }

    /**
     * Method to set filter to search for recipes
     * Currently this filter only meant for filtering based on remote
     */
    private async recipeSetFilter() {
        // Get all the saved remotes
        let remoteList = this.conanApiManager.conanApi.getRemotes();

        // Feed the remotes to Selection box
        const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();
        let quickPickItems = [];
        for (let i = 0; i < remoteList.length; i++) {
            quickPickItems.push({
                label: remoteList[i].name,
                description: remoteList[i].url,
                detail: "",
                index: i
            });
        }
        quickPickItems.map(label => ({ label }));
        quickPick.items = quickPickItems;

        const choice = await vscode.window.showQuickPick(quickPickItems);

        if (choice) {
            this.configManager.setRecipeFilter(choice.label);
            this.configManager.setPackageFilter(choice.label);

            this.recipeRefreshTreeview();
        }
    }

    /**
     * Clean the filter
     */
    private recipeClearFilter(): void {
        // Use config manager to clear the filter
        this.configManager.clearRecipeFilter();

        // Refresh the recipe treeview
        this.recipeRefreshTreeview();
    }

    /**
     * Callback method if a recipe item in the treeview in selected
     */
    private recipeItemSelected() {
        // Only works with non editable package
        if (this.treeViewConanRecipe.selection[0].isEditable()) {
            this.nodeProviderConanPackage.refresh("", this.context.workspaceState.get("show-dirty")!); // Empty the binary package treeview
            this.treeViewConanPackage.title = "Conan - Package"; // Reset the title of the binary package treeview panel
        }
        else {
            this.nodeProviderConanRecipe.setSelectedRecipe(this.treeViewConanRecipe.selection[0].label);

            // Change the title of the treeview for package explorer to match the selected recipe
            this.treeViewConanPackage.title = this.treeViewConanRecipe.selection[0].label;
            this.nodeProviderConanPackage.refresh(this.treeViewConanRecipe.selection[0].label, this.context.workspaceState.get("show-dirty")!);
            this.nodeProviderConanPackageRevision.refresh("", "", this.context.workspaceState.get("show-dirty")!);
            this.treeViewConanPackageRevision.title = "Conan - Package Revision"; //
        }

        if (this.configManager.isPackageFiltered()) {
            this.treeViewConanPackage.title = this.treeViewConanPackage.title + ` (Remote: ${this.configManager.getPackageFilterKey()})`;
        }
    }

    /**
     * Method to show the information of a selected recipe.
     * To view the information we will use a web view panel in this case
     * @param node Selected recipe node item
     */
    private recipeShowInformation(node: ConanRecipeItem) {
        try {
            let recipeInfo = this.conanApiManager.conanApi.getRecipeInformation(node.label);

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
        try {
            if (node.isEditable()) {
                vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(node.model.path));
            }
            else {
                vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.conanApiManager.conanApi.getRecipePath(node.label)!));
            }
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
        try {
            if (node.isEditable()) {
                // The path in the model is referring to the conanfile.py
                // We want to open the parent path of the file
                vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(node.model.path + "/.."), true);
            }
            else {
                let packagePath = this.conanApiManager.conanApi.getRecipePath(node.label);
                vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(packagePath!), true);
            }
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    /**
     * Remove selected recipe
     * @param node Selected recipe node item to be removed
     */
    private recipeRemove(node: ConanRecipeItem) {
        try {
            if (node.isEditable()) {
                this.conanApiManager.conanApi.removeEditablePackageRecipe(node.label);
                this.nodeProviderConanRecipe.refresh();
            }
            else {
                vscode.window
                    .showWarningMessage(`Are you sure you want to remove the recipe '${node.label}'?`, ...["Yes", "No"])
                    .then((answer) => {
                        if (answer === "Yes") {
                            this.conanApiManager.conanApi.removeRecipe(node.label);
                            this.nodeProviderConanRecipe.refresh();

                            this.nodeProviderConanPackage.refresh("", this.context.workspaceState.get("show-dirty")!); // Empty the binary package treeview
                            this.treeViewConanPackage.title = "Conan - Package"; // Reset the title of the binary package treeview panel

                            this.nodeProviderConanPackageRevision.refresh("", "", this.context.workspaceState.get("show-dirty")!); // Empty the binary package treeview
                            this.treeViewConanPackageRevision.title = "Conan - Package Revision";
                        }
                    });
            }
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    private recipeCopyPathToClipboard(node: ConanRecipeItem) {
        try {
            if (node.isEditable()) {
                vscode.env.clipboard.writeText(node.model.path);
            }
            else {
                let recipePath = this.conanApiManager.conanApi.getRecipePath(node.label);
                vscode.env.clipboard.writeText(recipePath!);
            }
        }
        catch {
            vscode.window.showErrorMessage("Unable to copy the path to clipboard");
        }
    }

    private recipeOpenFolderInExplorer(node: ConanRecipeItem, folderType: RecipeFolderOption) {
        let pathToOpen = this.conanApiManager.conanApi.getFolderPathFromRecipe(node.label, folderType);

        if (pathToOpen) {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(pathToOpen));
        }
        else {
            vscode.window.showErrorMessage("Error while opening the path. The path does not exist.");
        }
    }

    private recipeOpenFolderInVSCode(node: ConanRecipeItem, folderType: RecipeFolderOption) {
        let pathToOpen = this.conanApiManager.conanApi.getFolderPathFromRecipe(node.label, folderType);

        if (pathToOpen) {
            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(pathToOpen), true);
        }
        else {
            vscode.window.showErrorMessage("Error while opening the path. The path does not exist.");
        }
    }

    // ========== BINARY PACKAGE TREEVIEW COMMANDS

    /**
     * Refresh binary package treeview
     */
    private packageRefreshTreeview() {

        this.nodeProviderConanPackage.setSelectedPackage(undefined);

        // Check if there is a recipe selected from the recipe treeview
        if (this.nodeProviderConanRecipe.getSelectedRecipe()) { // A recipe is selected
            this.nodeProviderConanPackage.refresh(this.nodeProviderConanRecipe.getSelectedRecipe(), this.context.workspaceState.get("show-dirty")!);
            this.treeViewConanPackage.title = this.nodeProviderConanRecipe.getSelectedRecipe();
        }
        else { // No selected Recipe "undefined"
            this.nodeProviderConanPackage.refresh("", this.context.workspaceState.get("show-dirty")!); // Empty the binary package tree explorer
            this.treeViewConanPackage.title = "Conan - Package"; // Reset the title of the treeview
        }

        if (this.configManager.isPackageFiltered()) {
            this.treeViewConanPackage.title = this.treeViewConanPackage.title + ` (Remote: ${this.configManager.getPackageFilterKey()})`;
        }

        this.packageRevisionRefreshTreeview();
    }

    /**
     * Method to set filter to search for recipes
     * Currently this filter only meant for filtering based on remote
     */
    private async packageSetFilter() {

        // Get all the saved remotes
        let remoteList = this.conanApiManager.conanApi.getRemotes();

        // Feed the remotes to Selection box
        const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();
        let quickPickItems = [];
        for (let i = 0; i < remoteList.length; i++) {
            quickPickItems.push({
                label: remoteList[i].name,
                description: remoteList[i].url,
                detail: "",
                index: i
            });
        }
        quickPickItems.map(label => ({ label }));
        quickPick.items = quickPickItems;

        const choice = await vscode.window.showQuickPick(quickPickItems);

        if (choice) {
            this.configManager.setPackageFilter(choice.label);

            this.packageRefreshTreeview();
        }
    }

    /**
     * Clean the filter
     */
    private packageClearFilter(): void {

        if (this.configManager.isRecipeFiltered()) {
            vscode.window.showWarningMessage("Filter in Recipe is set. Unable to clear the filter in the packages.");
        }
        else {
            // Use config manager to clear the filter
            this.configManager.clearPackageFilter();

            // Refresh the recipe treeview
            this.packageRefreshTreeview();
        }

    }

    private showDirtyPackage() {
        vscode.commands.executeCommand('setContext', 'show-dirty', true);
        this.context.workspaceState.update("show-dirty", true);
        if (this.nodeProviderConanRecipe.getSelectedRecipe()) {
            this.nodeProviderConanPackage.refresh(this.nodeProviderConanRecipe.getSelectedRecipe(), true);
        }
    }

    private hideDirtyPackage() {
        vscode.commands.executeCommand('setContext', 'show-dirty', false);
        this.context.workspaceState.update("show-dirty", false);
        if (this.nodeProviderConanRecipe.getSelectedRecipe()) {
            this.nodeProviderConanPackage.refresh(this.nodeProviderConanRecipe.getSelectedRecipe(), false);
        }
    }

    private packageItemSelected() {
        this.nodeProviderConanPackage.setSelectedPackage(this.treeViewConanPackage.selection[0].label);

        this.treeViewConanPackageRevision.title = this.treeViewConanPackage.selection[0].label;
        this.nodeProviderConanPackageRevision.refresh(this.treeViewConanRecipe.selection[0].label, this.treeViewConanPackage.selection[0].label, false);
    }

    /**
     * Show binary package information
     * Still in the todo list. Need to figure out how to obtain this information
     * @param node Selected binary package node item
     */
    private packageShowInformation(node: ConanPackageItem) {
        // TODO: Show information from the selected recipe
    }

    /**
     * Open selected binary package in the file explorer
     * @param node Selected binary package node item
     */
    private packageOpenExplorer(node: ConanPackageItem) {
        try {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.conanApiManager.conanApi.getPackagePath(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label)!));
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    /**
     * Open selected binary package in VS Code
     * @param node Selected binary package node item
     */
    private packageOpenVSCode(node: ConanPackageItem) {
        try {
            let packagePath = this.conanApiManager.conanApi.getPackagePath(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label);
            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(packagePath!), true);
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    /**
     * Remove selected binary package
     * @param node Selected binary package node item to be removed
     */
    private packageRemove(node: ConanPackageItem) {
        try {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the binary package '${node.label}' from '${this.treeViewConanPackage.title!}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        this.conanApiManager.conanApi.removePackage(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label);

                        this.nodeProviderConanPackage.refresh(this.nodeProviderConanRecipe.getSelectedRecipe(), this.context.workspaceState.get("show-dirty")!);

                        this.nodeProviderConanPackageRevision.refresh("", "", this.context.workspaceState.get("show-dirty")!); // Empty the binary package treeview
                        this.treeViewConanPackageRevision.title = "Conan - Package Revision"; // Reset the title of the binary package treeview panel
                    }
                });
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    private packageCopyPathToClipboard(node: ConanPackageItem) {
        try {
            let packagePath = this.conanApiManager.conanApi.getPackagePath(this.nodeProviderConanRecipe.getSelectedRecipe(), node.label);
            vscode.env.clipboard.writeText(packagePath!);
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

    // ========== BINARY PACKAGE REVISION TREEVIEW COMMANDS

    private packageRevisionRefreshTreeview() {
        if (this.nodeProviderConanRecipe.getSelectedRecipe() && this.nodeProviderConanPackage.getSelectedPackage()) {
            this.nodeProviderConanPackageRevision.refresh(this.nodeProviderConanRecipe.getSelectedRecipe(), this.nodeProviderConanPackage.getSelectedPackage(), this.context.workspaceState.get("show-dirty")!);
        }
        else {
            this.nodeProviderConanPackageRevision.refresh("", "", this.context.workspaceState.get("show-dirty")!);
            this.treeViewConanPackageRevision.title = "Conan - Package Revision";
        }
    }

    private packageRevisionItemSelected() {
        // TODO:
    }

    private packageRevisionShowInformation(node: ConanPackageRevisionItem) {
        // TODO:
    }

    private packageRevisionOpenExplorer(node: ConanPackageRevisionItem) {
        try {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.conanApiManager.conanApi.getPackageRevisionPath(this.nodeProviderConanRecipe.getSelectedRecipe(), this.nodeProviderConanPackage.getSelectedPackage(), node.label)!));
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    private packageRevisionOpenVSCode(node: ConanPackageRevisionItem) {
        try {
            let packagePath = this.conanApiManager.conanApi.getPackageRevisionPath(this.nodeProviderConanRecipe.getSelectedRecipe(), this.nodeProviderConanPackage.getSelectedPackage(), node.label);
            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(packagePath!), true);
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    private packageRevisionRemove(node: ConanPackageRevisionItem) {
        try {
            vscode.window
                .showWarningMessage(`Are you sure you want to remove the binary package revision '${node.label}' from '${this.treeViewConanPackageRevision.title!}'?`, ...["Yes", "No"])
                .then((answer) => {
                    if (answer === "Yes") {
                        this.conanApiManager.conanApi.removePackageRevision(this.nodeProviderConanRecipe.getSelectedRecipe(), this.nodeProviderConanPackage.getSelectedPackage(), node.label);

                        this.nodeProviderConanPackageRevision.refresh(this.nodeProviderConanRecipe.getSelectedRecipe(),
                            this.nodeProviderConanPackage.getSelectedPackage(),
                            this.context.workspaceState.get("show-dirty")!);
                    }
                });
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

    private packageRevisionCopyPathToClipboard(node: ConanPackageRevisionItem) {
        try {
            let packageRevisionPath = this.conanApiManager.conanApi.getPackageRevisionPath(this.nodeProviderConanRecipe.getSelectedRecipe(), this.nodeProviderConanPackage.getSelectedPackage(), node.label);
            vscode.env.clipboard.writeText(packageRevisionPath!);
        }
        catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    }

}