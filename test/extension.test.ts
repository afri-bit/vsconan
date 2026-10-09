import * as vscode from "./mocks/vscode";
jest.mock('vscode', () => vscode, { virtual: true });

jest.mock("../src/extension/manager/explorer/conanCache");
jest.mock("../src/extension/manager/explorer/conanProfile");
jest.mock("../src/extension/manager/explorer/conanRemote");
jest.mock("../src/extension/manager/vsconanWorkspace");
jest.mock("../src/extension/settings/settingsManager");
jest.mock("../src/extension/ui/treeview/conanPackageProvider");
jest.mock("../src/extension/ui/treeview/conanPackageRevisionProvider");
jest.mock("../src/extension/ui/treeview/conanProfileProvider");
jest.mock("../src/extension/ui/treeview/conanRecipeProvider");
jest.mock("../src/extension/ui/treeview/conanRemoteProvider");

import * as fs from "fs";

import { activate, deactivate } from "../src/extension";
import * as utils from "../src/utils/utils";

// activate() doesn't await the "Yes/Not Now" prompt, so tests need to flush
// the microtask queue to observe what happens after the user answers.
const flushPromises = () => new Promise<void>(resolve => setImmediate(resolve));

describe("extension", () => {
    let context: any;

    beforeEach(() => {
        jest.clearAllMocks();
        vscode.workspace.setWorkspaceFolders(undefined);

        context = {
            subscriptions: [],
            workspaceState: { get: jest.fn(), update: jest.fn() }
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("activate", () => {
        it("should initialize the global area and reset the context state", () => {
            const initializeGlobalAreaMock = jest.spyOn(utils.vsconan, "initializeGlobalArea").mockImplementation(() => undefined);

            activate(context);

            expect(initializeGlobalAreaMock).toHaveBeenCalled();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('setContext', 'recipe-filtered', false);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('setContext', 'package-filtered', false);
            expect(context.workspaceState.update).toHaveBeenCalledWith('recipe-filtered', false);
            expect(context.workspaceState.update).toHaveBeenCalledWith('recipe-filter-key', "");
            expect(context.workspaceState.update).toHaveBeenCalledWith('package-filter-key', "");
        });

        it("should register the managers and configuration listener as disposables", () => {
            jest.spyOn(utils.vsconan, "initializeGlobalArea").mockImplementation(() => undefined);

            activate(context);

            expect(context.subscriptions.length).toBeGreaterThanOrEqual(5);
        });

        it("should prompt to configure a workspace detected as a conan project without an existing config", () => {
            jest.spyOn(utils.vsconan, "initializeGlobalArea").mockImplementation(() => undefined);
            vscode.workspace.setWorkspaceFolders([{ uri: { fsPath: "/path/to/ws" }, name: "ws", index: 0 }]);
            jest.spyOn(utils.conan, "isFolderConanProject").mockReturnValue(true);
            jest.spyOn(utils.vsconan, "getWorkspaceConfigPath").mockReturnValue("/path/to/ws/.vsconan/config.json");
            jest.spyOn(fs, "existsSync").mockReturnValue(false);

            activate(context);

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                "The workspace 'ws' is detected as a conan project. Do you want to configure this workspace?",
                "Yes", "Not Now"
            );
        });

        it("should create the config directory and initial config when the user confirms", async () => {
            jest.spyOn(utils.vsconan, "initializeGlobalArea").mockImplementation(() => undefined);
            vscode.workspace.setWorkspaceFolders([{ uri: { fsPath: "/path/to/ws" }, name: "ws", index: 0 }]);
            jest.spyOn(utils.conan, "isFolderConanProject").mockReturnValue(true);
            jest.spyOn(utils.vsconan, "getWorkspaceConfigPath").mockReturnValue("/path/to/ws/.vsconan/config.json");
            jest.spyOn(fs, "existsSync").mockReturnValue(false);
            const mkdirSyncMock = jest.spyOn(fs, "mkdirSync").mockImplementation(() => undefined as any);
            const createInitialWorkspaceConfigMock = jest.spyOn(utils.vsconan.config, "createInitialWorkspaceConfig").mockImplementation(() => undefined);
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue("Yes");

            activate(context);
            await flushPromises();

            expect(mkdirSyncMock).toHaveBeenCalledWith("/path/to/ws/.vsconan", { recursive: true });
            expect(createInitialWorkspaceConfigMock).toHaveBeenCalledWith("/path/to/ws/.vsconan/config.json");
        });

        it("should not create a config when the user declines", async () => {
            jest.spyOn(utils.vsconan, "initializeGlobalArea").mockImplementation(() => undefined);
            vscode.workspace.setWorkspaceFolders([{ uri: { fsPath: "/path/to/ws" }, name: "ws", index: 0 }]);
            jest.spyOn(utils.conan, "isFolderConanProject").mockReturnValue(true);
            jest.spyOn(utils.vsconan, "getWorkspaceConfigPath").mockReturnValue("/path/to/ws/.vsconan/config.json");
            jest.spyOn(fs, "existsSync").mockReturnValue(false);
            const createInitialWorkspaceConfigMock = jest.spyOn(utils.vsconan.config, "createInitialWorkspaceConfig").mockImplementation(() => undefined);
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue("Not Now");

            activate(context);
            await flushPromises();

            expect(createInitialWorkspaceConfigMock).not.toHaveBeenCalled();
        });

        it("should not prompt when the workspace already has a config file", () => {
            jest.spyOn(utils.vsconan, "initializeGlobalArea").mockImplementation(() => undefined);
            vscode.workspace.setWorkspaceFolders([{ uri: { fsPath: "/path/to/ws" }, name: "ws", index: 0 }]);
            jest.spyOn(utils.conan, "isFolderConanProject").mockReturnValue(true);
            jest.spyOn(utils.vsconan, "getWorkspaceConfigPath").mockReturnValue("/path/to/ws/.vsconan/config.json");
            jest.spyOn(fs, "existsSync").mockReturnValue(true);

            activate(context);

            expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
        });

        it("should do nothing when the workspace is not a conan project", () => {
            jest.spyOn(utils.vsconan, "initializeGlobalArea").mockImplementation(() => undefined);
            vscode.workspace.setWorkspaceFolders([{ uri: { fsPath: "/path/to/ws" }, name: "ws", index: 0 }]);
            jest.spyOn(utils.conan, "isFolderConanProject").mockReturnValue(false);

            activate(context);

            expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
        });

        it("should do nothing with the workspace loop when there are no workspace folders", () => {
            jest.spyOn(utils.vsconan, "initializeGlobalArea").mockImplementation(() => undefined);
            const isFolderConanProjectMock = jest.spyOn(utils.conan, "isFolderConanProject");
            vscode.workspace.setWorkspaceFolders(undefined);

            activate(context);

            expect(isFolderConanProjectMock).not.toHaveBeenCalled();
        });
    });

    describe("deactivate", () => {
        it("should be a no-op", () => {
            expect(() => deactivate()).not.toThrow();
        });
    });
});
