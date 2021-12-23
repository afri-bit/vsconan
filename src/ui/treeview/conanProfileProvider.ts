import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConanAPI } from "../../api/conan/conanAPI";

export class ConanProfileNodeProvider implements vscode.TreeDataProvider<ConanProfileItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanProfileItem | undefined | void> = new vscode.EventEmitter<ConanProfileItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanProfileItem | undefined | void> = this._onDidChangeTreeData.event;

    private conanApi: ConanAPI;

    constructor(conanApi: ConanAPI) {
        this.conanApi = conanApi;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ConanProfileItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ConanProfileItem): Thenable<ConanProfileItem[]> {
        let profileList: Array<string> = this.conanApi.getProfiles();

        let recipeItemList: Array<ConanProfileItem> = [];

        for (let profile of profileList) {
            recipeItemList.push(new ConanProfileItem(profile, vscode.TreeItemCollapsibleState.None));
        }

        return Promise.resolve(recipeItemList);
    }
}

export class ConanProfileItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState) {

        super(label, collapsibleState);

        this.tooltip = `${this.label}`;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'light', 'profile.png'),
        dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'dark', 'profile.png')
    };

    contextValue = 'profile';
}
