import * as path from 'path';
import * as vscode from 'vscode';
import { ConanAPIManager } from '../../../conans/api/conanAPIManager';
import { ConanRecipe } from '../../../conans/model/conanRecipe';
import { SettingsPropertyManager } from '../../settings/settingsPropertyManager';
import { ConanAPI } from '../../../conans/api/base/conanAPI';

export class ConanRecipeNodeProvider implements vscode.TreeDataProvider<ConanRecipeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanRecipeItem | undefined | void> = new vscode.EventEmitter<ConanRecipeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanRecipeItem | undefined | void> = this._onDidChangeTreeData.event;

    private selectedRecipe: string | undefined = undefined;

    private conanApiManager: ConanAPIManager;
    private settingsPropertyManager: SettingsPropertyManager;

    public constructor(conanApiManager: ConanAPIManager, settingsPropertyManager: SettingsPropertyManager) {
        this.conanApiManager = conanApiManager;
        this.settingsPropertyManager = settingsPropertyManager;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ConanRecipeItem): vscode.TreeItem {
        return element;
    }

    public async getChildren(element?: ConanRecipeItem): Promise<ConanRecipeItem[]> {
        const recipeItemList: Array<ConanRecipeItem> = [];

        if (this.conanApiManager.conanApi) {
            let recipeList: Array<ConanRecipe> = [];
            let recipeEditableList: Array<ConanRecipe> = [];

            if (this.settingsPropertyManager.isRecipeFiltered()) {
                const filterKey: string = this.settingsPropertyManager.getRecipeFilterKey()!;
                recipeList = await this.conanApiManager.conanApi.getRecipesByRemote(filterKey);
            }
            else {
                recipeList = await this.conanApiManager.conanApi.getRecipes();
                recipeEditableList = await this.conanApiManager.conanApi.getEditablePackageRecipes();
            }

            const editableRecipeStringList: Array<string> = [];

            for (const recipe of recipeEditableList) {
                editableRecipeStringList.push(recipe.name);
                recipeItemList.push(new ConanRecipeItem(recipe.name, vscode.TreeItemCollapsibleState.None, recipe));
            }

            for (const recipe of recipeList) {
                if (!editableRecipeStringList.includes(recipe.name)) {
                    recipeItemList.push(new ConanRecipeItem(recipe.name, vscode.TreeItemCollapsibleState.None, recipe));
                }
            }
        }

        return recipeItemList;
    }

    public async getChildrenString(): Promise<string[]> {
        const childStringList: string[] = [];
        for (const child of await this.getChildren()) {
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
                light: vscode.Uri.file(path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'recipe_editable.png')),
                dark: vscode.Uri.file(path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'recipe_editable.png'))
            };

            this.contextValue = 'recipeEditable';
        }
        else {
            this.iconPath = {
                light: vscode.Uri.file(path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'recipe.png')),
                dark: vscode.Uri.file(path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'recipe.png'))
            };

            this.contextValue = 'recipe';
        }
    }

    public isEditable(): boolean {
        return this.model.editable;
    }
}
