import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as utils from '../../utils/utils';
import { ConanAPI } from "../../api/conan/conanAPI";

export class ConanRemoteNodeProvider implements vscode.TreeDataProvider<ConanRemoteItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanRemoteItem | undefined | void> = new vscode.EventEmitter<ConanRemoteItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanRemoteItem | undefined | void> = this._onDidChangeTreeData.event;

    private recipeName: string = "";

    public constructor() {
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ConanRemoteItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ConanRemoteItem): ConanRemoteItem[] {
        // Get the python interpreter from the explorer configuration file
        // If something goes wrong it will be an empty list
        let python = utils.vsconan.config.getExplorerPython();

        let remoteList = [];

        if (python) {
            remoteList = ConanAPI.getRemotes(python!);
        }

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
        public detailInfo: any) {

        super(label, collapsibleState);

        this.detailInfo = JSON.stringify(this.detailInfo, null, 4);

        this.tooltip = this.detailInfo;

        this.command = {
            "title": "Conan Remote Selected",
            "command": "vsconan.remote.selected",
        };

        this.setRemoteEnableIcon(this.isEnabled()!);
    }
    
    public isEnabled() {
        let jsonObj = JSON.parse(this.detailInfo);

        // Remote is disabled
        if (jsonObj.disabled === true) { // Remote is disabled
            return false;
        }
        // Undefined mean that this remote is enabled
        // The 'disabled' option will be visible only if the remote is disabled
        else if (jsonObj.disabled === undefined || jsonObj.disabled === false) {
            return true;
        }
    }

    public setRemoteEnableIcon(state: boolean) {
        if (state) { // Remote is enabled
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'light', 'remote_on.png'),
                dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'dark', 'remote_on.png')
            };
        }
        else { // Remote is disabled
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'light', 'remote_off.png'),
                dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icon', 'dark', 'remote_off.png')
            };
        }
    }

    contextValue = 'remote';
}
