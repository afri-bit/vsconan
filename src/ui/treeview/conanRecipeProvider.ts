import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {ConanAPI} from "../../api/conan/conanAPI";

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

		// if (element) {
		// 	return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
		// } else {
		// 	const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
		// 	if (this.pathExists(packageJsonPath)) {
		// 		return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
		// 	} else {
		// 		vscode.window.showInformationMessage('Workspace has no package.json');
		// 		return Promise.resolve([]);
		// 	}
		// }

	}
}

export class ConanRecipeItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
            
        super(label, collapsibleState);

        this.tooltip = `${this.label}`;
        this.description = this.label;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dep.png'),
        dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dep.png')
    };

    contextValue = 'dependency';
}
