import * as path from 'path';
import * as vscode from 'vscode';
import { ConanAPIManager } from '../../../conans/api/conanAPIManager';

export class ConanProfileNodeProvider implements vscode.TreeDataProvider<ConanProfileItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanProfileItem | undefined | void> = new vscode.EventEmitter<ConanProfileItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanProfileItem | undefined | void> = this._onDidChangeTreeData.event;

    private conanApiManager: ConanAPIManager;

    public constructor(conanApiManager: ConanAPIManager) {
        this.conanApiManager = conanApiManager;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ConanProfileItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ConanProfileItem): ConanProfileItem[] {
        let profileList: string[] = [];
        let profileItemList: Array<ConanProfileItem> = [];

        if (this.conanApiManager.conanApi) {
            profileList = this.conanApiManager.conanApi.getProfiles();

            for (let profile of profileList) {
                profileItemList.push(new ConanProfileItem(profile, vscode.TreeItemCollapsibleState.None));
            }
        }

        return profileItemList;
    }

    public getChildrenString(): string[] {
        let childStringList = [];

        for (let child of this.getChildren()) {
            childStringList.push(child.label);
        }

        return childStringList;
    }
}

export class ConanProfileItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState) {

        super(label, collapsibleState);

        this.tooltip = `${this.label}`;

        this.command = {
            "title": "Conan Profile Selected",
            "command": "vsconan.explorer.treeview.profile.item.selected",
        };
    }

    iconPath = {
        light: vscode.Uri.file(path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'light', 'profile.png')),
        dark: vscode.Uri.file(path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'dark', 'profile.png'))
    };

    contextValue = 'profile';
}
