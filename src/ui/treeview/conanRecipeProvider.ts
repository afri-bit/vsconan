import * as vscode from 'vscode';
import * as path from 'path';
import * as utils from '../../utils';
import { ConanAPI, ConanRecipeModel } from "../../api/conan/conanAPI";

export class ConanRecipeNodeProvider implements vscode.TreeDataProvider<ConanRecipeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanRecipeItem | undefined | void> = new vscode.EventEmitter<ConanRecipeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanRecipeItem | undefined | void> = this._onDidChangeTreeData.event;

    private selectedRecipe: string | undefined = undefined;

    private conanApi: ConanAPI;

    public constructor(conanApi: ConanAPI) {
        this.conanApi = conanApi;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ConanRecipeItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ConanRecipeItem): ConanRecipeItem[] {
        let recipeList: Array<ConanRecipeModel> = [];
        let recipeEditableList: Array<ConanRecipeModel> = [];

        recipeList = this.conanApi.getRecipes();
        recipeEditableList = this.conanApi.getEditablePackageRecipes();

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
    public model: ConanRecipeModel;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        model: ConanRecipeModel) {
        
        super(label, collapsibleState);

        this.model = model;

        this.tooltip = `${this.label}`;

        this.command = {
            "title": "Conan Recipe Selected",
            "command": "vsconan.explorer.treeview.recipe.item.selected",
        };

        if (this.model.editable) {
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'recipe_editable.png'),
                dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'recipe_editable.png')
            };

            this.contextValue = 'recipeEditable';
        }
        else {
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'recipe.png'),
                dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'recipe.png')
            };

            this.contextValue = 'recipe';
        }
    }

    public isEditable(): boolean {
        return this.model.editable;
    }
}
