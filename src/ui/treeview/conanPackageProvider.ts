import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConanAPI } from "../../api/conan/conanAPI";

export class ConanPackageNodeProvider implements vscode.TreeDataProvider<ConanPackageItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanPackageItem | undefined | void> = new vscode.EventEmitter<ConanPackageItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanPackageItem | undefined | void> = this._onDidChangeTreeData.event;

    private conanApi: ConanAPI;
    private recipeName: string = "";

    constructor(conanApi: ConanAPI) {
        this.conanApi = conanApi;
    }

    refresh(recipeName: string): void {
        this.recipeName = recipeName;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ConanPackageItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ConanPackageItem): Thenable<ConanPackageItem[]> {
        let packageList = this.conanApi.getPackages(this.recipeName);

        let packageItemList: Array<ConanPackageItem> = [];

        for (let pkg of packageList) {
            packageItemList.push(new ConanPackageItem(pkg.id, vscode.TreeItemCollapsibleState.None, pkg));
        }

        return Promise.resolve(packageItemList);
    }
}

export class ConanPackageItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public detailInfo: any) {

        super(label, collapsibleState);

        this.detailInfo = detailInfo;
        
        this.tooltip = JSON.stringify(this.detailInfo, null, 4);

        this.command = {
            "title": "Conan Recipe Selected",
            "command": "vsconan.recipe.selected",
        }
    }

    iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'light', 'none.png'),
        dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'dark', 'none.png')
    };

    contextValue = 'dependency';
}
