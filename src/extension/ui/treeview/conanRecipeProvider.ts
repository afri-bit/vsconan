import * as path from 'path';
import * as vscode from 'vscode';
import { ConanAPIManager } from '../../../conans/api/conanAPIManager';
import { ConanRecipe } from '../../../conans/model/conanRecipe';
import { ConfigurationManager } from '../../config/configManager';

export class ConanRecipeNodeProvider implements vscode.TreeDataProvider<ConanRecipeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanRecipeItem | undefined | void> = new vscode.EventEmitter<ConanRecipeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanRecipeItem | undefined | void> = this._onDidChangeTreeData.event;

    private selectedRecipe: string | undefined = undefined;

    private conanApiManager: ConanAPIManager;
    private configManager: ConfigurationManager;

    public constructor(conanApiManager: ConanAPIManager, configManager: ConfigurationManager) {
        this.conanApiManager = conanApiManager;
        this.configManager = configManager;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ConanRecipeItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ConanRecipeItem): ConanRecipeItem[] {
        let recipeList: Array<ConanRecipe> = [];
        let recipeEditableList: Array<ConanRecipe> = [];

        // Check the configuration, if the filter is set
        // If the filter is set, get the filte name.
        // Otherwise do as always
        // If filter is on, the editable package will not appear
        if (this.configManager.isRecipeFiltered()) {
            let filterKey: string = this.configManager.getRecipeFilterKey()!;

            recipeList = this.conanApiManager.conanApi.getRecipesByRemote(filterKey);
        }
        else {
            recipeList = this.conanApiManager.conanApi.getRecipes();
            recipeEditableList = this.conanApiManager.conanApi.getEditablePackageRecipes();
        }

        // Get the list of string from editable packages
        let editableRecipeStringList: Array<string> = [];

        let recipeItemList: Array<ConanRecipeItem> = [];
        for (let recipe of recipeEditableList) {
            editableRecipeStringList.push(recipe.name);
            recipeItemList.push(new ConanRecipeItem(recipe.name, vscode.TreeItemCollapsibleState.None, recipe));
        }

        for (let recipe of recipeList) {
            // Basically even the package is editable, it will appear in the 'conan search' command
            // We dont want to have double name in the item list in the treeview, so we need to check if the package is already included in the editable list 
            if (!editableRecipeStringList.includes(recipe.name)) {
                recipeItemList.push(new ConanRecipeItem(recipe.name, vscode.TreeItemCollapsibleState.None, recipe));
            }
        }

        return recipeItemList;
    }

    public getChildrenString(): string[] {
        let childStringList = [];

        for (let child of this.getChildren()) {
            childStringList.push(child.label);
        }

        return childStringList;
    }

    public setSelectedRecipe(recipe: string | undefined) {
        this.selectedRecipe = recipe;
    }

    public getSelectedRecipe(): string {
        return this.selectedRecipe!;
    }
}

export class ConanRecipeItem extends vscode.TreeItem {
    public model: ConanRecipe;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        model: ConanRecipe) {

        super(label, collapsibleState);

        this.model = model;

        this.tooltip = `${this.label}`;

        this.command = {
            "title": "Conan Recipe Selected",
            "command": "vsconan.explorer.treeview.recipe.item.selected",
        };

        if (this.model.editable) {
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'recipe_editable.png'),
                dark: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'recipe_editable.png')
            };

            this.contextValue = 'recipeEditable';
        }
        else {
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'recipe.png'),
                dark: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'recipe.png')
            };

            this.contextValue = 'recipe';
        }
    }

    public isEditable(): boolean {
        return this.model.editable;
    }
}
