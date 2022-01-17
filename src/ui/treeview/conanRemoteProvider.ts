import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConanAPI } from "../../api/conan/conanAPI";

export class ConanRemoteNodeProvider implements vscode.TreeDataProvider<ConanRemoteItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanRemoteItem | undefined | void> = new vscode.EventEmitter<ConanRemoteItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanRemoteItem | undefined | void> = this._onDidChangeTreeData.event;

    private conanApi: ConanAPI;
    private recipeName: string = "";

    constructor(conanApi: ConanAPI) {
        this.conanApi = conanApi;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ConanRemoteItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ConanRemoteItem): Thenable<ConanRemoteItem[]> {
        let remoteList = this.conanApi.getRemotes();

        let remoteItemList: Array<ConanRemoteItem> = [];

        for (let remote of remoteList) {
            remoteItemList.push(new ConanRemoteItem(remote.name, vscode.TreeItemCollapsibleState.None, remote));
        }

        return Promise.resolve(remoteItemList);
    }
}

export class ConanRemoteItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public detailInfo: any) {

        super(label, collapsibleState);

        this.detailInfo = detailInfo;
        
        this.tooltip = JSON.stringify(this.detailInfo, null, 4);

        this.command = {
            "title": "Conan Remote Selected",
            "command": "vsconan.remote.selected",
        }
    }

    iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'light', 'remote.png'),
        dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'dark', 'remote.png')
    };

    contextValue = 'remote';
}
