import * as path from 'path';
import * as vscode from 'vscode';
import { ConanAPIManager } from '../../../conans/api/conanAPIManager';
import { ConanPackageRevision } from '../../../conans/model/conanPackageRevision';
import { ConfigurationManager } from '../../config/configManager';

export class ConanPackageRevisionNodeProvider implements vscode.TreeDataProvider<ConanPackageRevisionItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanPackageRevisionItem | undefined | void> = new vscode.EventEmitter<ConanPackageRevisionItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanPackageRevisionItem | undefined | void> = this._onDidChangeTreeData.event;

    private recipeName: string = "";
    private packageId: string = "";
    private showDirtyPackage: boolean = false;
    private conanApiManager: ConanAPIManager;
    private configManager: ConfigurationManager;

    public constructor(conanApiManager: ConanAPIManager, configManager: ConfigurationManager) {
        this.conanApiManager = conanApiManager;
        this.configManager = configManager;
    }

    public refresh(recipeName: string, packageId: string, showDirtyPackage: boolean): void {
        this.recipeName = recipeName;
        this.packageId = packageId;
        this.showDirtyPackage = showDirtyPackage;
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ConanPackageRevisionItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ConanPackageRevisionItem): ConanPackageRevisionItem[] {
        let packageRevisionList: Array<ConanPackageRevision> = [];
        let dirtyPackageList: Array<ConanPackageRevision> = [];

        packageRevisionList = this.conanApiManager.conanApi.getPackageRevisions(this.recipeName, this.packageId);

        let packageRevisionItemList: Array<ConanPackageRevisionItem> = [];

        for (let pkgRevision of packageRevisionList) {
            packageRevisionItemList.push(new ConanPackageRevisionItem(pkgRevision.id, vscode.TreeItemCollapsibleState.None, pkgRevision));
        }

        return packageRevisionItemList;
    }

    public getChildrenString(): string[] {
        let childStringList = [];

        for (let child of this.getChildren()) {
            childStringList.push(child.label);
        }

        return childStringList;
    }
}

export class ConanPackageRevisionItem extends vscode.TreeItem {
    public model: ConanPackageRevision;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        model: ConanPackageRevision) {

        super(label, collapsibleState);

        this.model = model;

        this.tooltip = JSON.stringify(this.model, null, 4);

        this.command = {
            "title": "Conan Package Revision Selected",
            "command": "vsconan.explorer.treeview.package.revision.item.selected",
        };


        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'package_revision.png'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'package_revision.png')
        };

        this.contextValue = 'packageRevision';
    }
}
