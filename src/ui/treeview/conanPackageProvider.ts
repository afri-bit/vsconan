import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as utils from "../../utils";
import { ConanAPI } from "../../api/conan/conanAPI";

export class ConanPackageNodeProvider implements vscode.TreeDataProvider<ConanPackageItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanPackageItem | undefined | void> = new vscode.EventEmitter<ConanPackageItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanPackageItem | undefined | void> = this._onDidChangeTreeData.event;

    private recipeName: string = "";
    private conanApi: ConanAPI;

    public constructor(conanApi: ConanAPI) {
        this.conanApi = conanApi;
    }

    public refresh(recipeName: string): void {
        this.recipeName = recipeName;
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ConanPackageItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ConanPackageItem): ConanPackageItem[] {
        // Get the python interpreter from the explorer configuration file
        // If something goes wrong it will be an empty list
        let python = utils.vsconan.config.getExplorerPython();

        let packageList = [];
        
        if (python) {
            packageList = this.conanApi.getPackages(python!, this.recipeName);
        }

        let packageItemList: Array<ConanPackageItem> = [];

        for (let pkg of packageList) {
            packageItemList.push(new ConanPackageItem(pkg.id, vscode.TreeItemCollapsibleState.None, pkg));
        }

        return packageItemList;
    }

    public getChildrenString(): string[] {
        let childStringList = [];

        for (let child of this.getChildren()) {
            childStringList.push(child.label);
        }

        return childStringList;
    }
}

export class ConanPackageItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly detailInfo: string) {

        super(label, collapsibleState);

        this.detailInfo = JSON.stringify(this.detailInfo, null, 4);
        
        this.command = {
            "title": "Conan Package Selected",
            "command": "vsconan.package.selected",
        };
    }

    iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'light', 'package.png'),
        dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'dark', 'package.png')
    };

    contextValue = 'package';
}
