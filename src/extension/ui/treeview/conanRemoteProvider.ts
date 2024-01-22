import * as path from 'path';
import * as vscode from 'vscode';
import { ConanAPIManager } from '../../../conans/api/conanAPIManager';
import { ConanRemote } from '../../../conans/model/conanRemote';

export class ConanRemoteNodeProvider implements vscode.TreeDataProvider<ConanRemoteItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanRemoteItem | undefined | void> = new vscode.EventEmitter<ConanRemoteItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanRemoteItem | undefined | void> = this._onDidChangeTreeData.event;

    private conanApiManager: ConanAPIManager;

    public constructor(conanApi: ConanAPIManager) {
        this.conanApiManager = conanApi;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ConanRemoteItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ConanRemoteItem): ConanRemoteItem[] {
        let remoteList: Array<ConanRemote> = [];

        remoteList = this.conanApiManager.conanApi.getRemotes();

        let remoteItemList: Array<ConanRemoteItem> = [];

        for (let remote of remoteList) {
            remoteItemList.push(new ConanRemoteItem(remote.name, vscode.TreeItemCollapsibleState.None, remote));
        }

        return remoteItemList;
    }

    public getChildrenString(): string[] {
        let childStringList = [];

        for (let child of this.getChildren()) {
            childStringList.push(child.label);
        }

        return childStringList;
    }
}

export class ConanRemoteItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public model: ConanRemote) {

        super(label, collapsibleState);

        this.model = model;

        this.tooltip = JSON.stringify(this.model, null, 4);

        this.command = {
            "title": "Conan Remote Selected",
            "command": "vsconan.explorer.treeview.remote.item.selected",
        };

        this.setRemoteEnableIcon(this.model.enabled);
    }

    public setRemoteEnableIcon(state: boolean) {
        if (state) { // Remote is enabled
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'light', 'remote_on.png'),
                dark: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'dark', 'remote_on.png')
            };
        }
        else { // Remote is disabled
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'light', 'remote_off.png'),
                dark: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'dark', 'remote_off.png')
            };
        }
    }

    contextValue = 'remote';
}
