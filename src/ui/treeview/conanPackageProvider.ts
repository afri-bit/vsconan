import * as vscode from 'vscode';
import * as path from 'path';
import * as utils from "../../utils";
import { ConanAPI, ConanPackageModel } from "../../api/conan/conanAPI";

export class ConanPackageNodeProvider implements vscode.TreeDataProvider<ConanPackageItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanPackageItem | undefined | void> = new vscode.EventEmitter<ConanPackageItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanPackageItem | undefined | void> = this._onDidChangeTreeData.event;

    private recipeName: string = "";
    private showDirtyPackage: boolean = false;
    private conanApi: ConanAPI;

    public constructor(conanApi: ConanAPI) {
        this.conanApi = conanApi;
    }

    public refresh(recipeName: string, showDirtyPackage: boolean): void {
        this.recipeName = recipeName;
        this.showDirtyPackage = showDirtyPackage;
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ConanPackageItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ConanPackageItem): ConanPackageItem[] {
        let packageList: Array<ConanPackageModel> = [];
        let dirtyPackageList: Array<ConanPackageModel> = [];

        packageList = this.conanApi.getPackages(this.recipeName);

        if (this.showDirtyPackage){
            dirtyPackageList = this.conanApi.getDirtyPackage(this.recipeName);
        }

        let packageItemList: Array<ConanPackageItem> = [];

        for (let pkg of packageList) {
            packageItemList.push(new ConanPackageItem(pkg.id, vscode.TreeItemCollapsibleState.None, pkg));
        }

        for (let pkg of dirtyPackageList) {
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
    public model: ConanPackageModel;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        model: ConanPackageModel) {

        super(label, collapsibleState);

        this.model = model;

        this.command = {
            "title": "Conan Package Selected",
            "command": "vsconan.explorer.treeview.package.item.selected",
        };

        if (this.model.dirty) {
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icon', 'package_dirty.png'),
                dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icon', 'package_dirty.png')
            };

            this.contextValue = 'packageDirty';
        }
        else {
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icon', 'package.png'),
                dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icon', 'package.png')
            };

            this.contextValue = 'package';
        }
    }
    
    public isDirty(): boolean {
        return this.model.dirty;
    }
}
