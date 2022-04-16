import * as vscode from 'vscode';
import * as path from 'path';
import * as utils from '../../utils';
import { ConanAPI } from "../../api/conan/conanAPI";

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
        // Get the python interpreter from the explorer configuration file
        // If something goes wrong it will be an empty list
        let python = utils.vsconan.config.getExplorerPython();

        let recipeList: string[] = [];

        if (python) {
            recipeList = this.conanApi.getRecipes(python!);
        }

        let recipeItemList: Array<ConanRecipeItem> = [];

        for (let recipe of recipeList) {
            recipeItemList.push(new ConanRecipeItem(recipe, vscode.TreeItemCollapsibleState.None));
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

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState) {

        super(label, collapsibleState);

        this.tooltip = `${this.label}`;

        this.command = {
            "title": "Conan Recipe Selected",
            "command": "vsconan.explorer.treeview.recipe.item.selected",
        };
    }

    iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'dark', 'recipe.png'),
        dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'dark', 'recipe.png')
    };

    contextValue = 'recipe';
}
