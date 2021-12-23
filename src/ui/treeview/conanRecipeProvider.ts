import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConanAPI } from "../../api/conan/conanAPI";

export class ConanRecipeNodeProvider implements vscode.TreeDataProvider<ConanRecipeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanRecipeItem | undefined | void> = new vscode.EventEmitter<ConanRecipeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanRecipeItem | undefined | void> = this._onDidChangeTreeData.event;

    private conanApi: ConanAPI;

    constructor(conanApi: ConanAPI) {
        this.conanApi = conanApi;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ConanRecipeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ConanRecipeItem): Thenable<ConanRecipeItem[]> {
        let recipeList: Array<string> = this.conanApi.getRecipes();

        let recipeItemList: Array<ConanRecipeItem> = [];

        for (let recipe of recipeList) {
            recipeItemList.push(new ConanRecipeItem(recipe, vscode.TreeItemCollapsibleState.None));
        }

        return Promise.resolve(recipeItemList);
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
            "command": "vsconan.recipe.selected",
        }
    }

    iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'conan_io_gray.png'),
        dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'conan_io_gray.png')
    };

    contextValue = 'recipe';
}
