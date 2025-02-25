import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { ConanAPIManager } from '../../../conans/api/conanAPIManager';
import { ConanPackageRevision } from '../../../conans/model/conanPackageRevision';
import { SettingsPropertyManager } from '../../settings/settingsPropertyManager';

export class ConanPackageRevisionNodeProvider implements vscode.TreeDataProvider<ConanPackageRevisionItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConanPackageRevisionItem | undefined | void> = new vscode.EventEmitter<ConanPackageRevisionItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ConanPackageRevisionItem | undefined | void> = this._onDidChangeTreeData.event;

    private recipeName: string = "";
    private packageId: string = "";
    private showDirtyPackage: boolean = false;
    private conanApiManager: ConanAPIManager;
    private settingsPropertyManager: SettingsPropertyManager;

    private expandedNodes = new Set<string>();

    public constructor(conanApiManager: ConanAPIManager, settingsPropertyManager: SettingsPropertyManager) {
        this.conanApiManager = conanApiManager;
        this.settingsPropertyManager = settingsPropertyManager;
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

        if (!element) {

            let packageRevisionList: Array<ConanPackageRevision> = [];
            let dirtyPackageList: Array<ConanPackageRevision> = [];
            let packageRevisionItemList: Array<ConanPackageRevisionItem> = [];
    
            if (this.conanApiManager.conanApi) {
                packageRevisionList = this.conanApiManager.conanApi.getPackageRevisions(this.recipeName, this.packageId);
    
                for (let pkgRevision of packageRevisionList) {
                    let packageRevisionPath = this.conanApiManager.conanApi.getPackageRevisionPath(this.recipeName, this.packageId, pkgRevision.id);


                    packageRevisionItemList.push(new ConanPackageRevisionItem(pkgRevision.id,
                        vscode.Uri.file(packageRevisionPath!),
                        vscode.TreeItemCollapsibleState.Collapsed,
                        pkgRevision, true, true));
                }
            }

            return packageRevisionItemList;
        }

        // Load subfolders/files only if the folder is expanded
        if (!this.expandedNodes.has(element.resourceUri.fsPath)) {
            return [];
        }
        
        return this.getFilesAndFolders(element.resourceUri.fsPath);

    }

    private getFilesAndFolders(directoryPath: string): ConanPackageRevisionItem[] {
        if (!fs.existsSync(directoryPath)) {
            return [];
        }

        const files = fs.readdirSync(directoryPath).map(file => {
            const filePath = path.join(directoryPath, file);
            const stat = fs.statSync(filePath);

            return new ConanPackageRevisionItem(
                file,
                vscode.Uri.file(filePath),
                stat.isDirectory() ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                new ConanPackageRevision("",123),
                false,
                stat.isDirectory()
            );
        });

        // Sort: Folders first, then files
        files.sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory));

        return files;
    }

    public getChildrenString(): string[] {
        let childStringList = [];

        for (let child of this.getChildren()) {
            childStringList.push(child.label);
        }

        return childStringList;
    }

    expandFolder(uri: vscode.Uri): void {
        this.expandedNodes.add(uri.fsPath);
        this.refresh(this.recipeName, this.packageId, this.showDirtyPackage);
    }
}

export class ConanPackageRevisionItem extends vscode.TreeItem {
    public model!: ConanPackageRevision;
    isDirectory: boolean; // To check if it's a folder

    constructor(public readonly label: string, public readonly resourceUri: vscode.Uri, public readonly collapsibleState: vscode.TreeItemCollapsibleState, model: ConanPackageRevision, isRoot: boolean, isDirectory: boolean = false) {

        super(resourceUri=resourceUri, collapsibleState=collapsibleState);

        this.label = label;

        this.isDirectory = isDirectory;

        this.command = {
            "title": "Conan Package Revision Selected",
            "command": "vsconan.explorer.treeview.package.revision.item.selected",
        };

        if (isRoot) {
            this.iconPath = {
                light: vscode.Uri.file(path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'package_revision.png')),
                dark: vscode.Uri.file(path.join(__filename, '..', '..', '..', '..', '..', '..', 'resources', 'icon', 'package_revision.png'))
            };

            this.contextValue = 'packageRevision';
            this.model = model;

            this.tooltip = JSON.stringify(this.model, null, 4);
        }

        
    }
}
