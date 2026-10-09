import * as vscode from "../../mocks/vscode";
jest.mock('vscode', () => vscode, { virtual: true });

import * as fs from "fs";

jest.mock("../../../src/extension/manager/workspaceEnvironment");

import { ConanAPIManager } from "../../../src/conans/api/conanAPIManager";
import { VSConanWorkspaceEnvironment } from "../../../src/extension/manager/workspaceEnvironment";
import { SettingsPropertyManager } from "../../../src/extension/settings/settingsPropertyManager";
import { VSConanWorkspaceManager } from "../../../src/extension/manager/vsconanWorkspace";
import * as utils from "../../../src/utils/utils";

describe("VSConanWorkspaceManager", () => {
    let context: any;
    let outputChannel: any;
    let conanApiManager: ConanAPIManager;
    let settingsPropertyManager: SettingsPropertyManager;
    let registeredCommands: Record<string, (...args: any[]) => any>;

    function createManager(): VSConanWorkspaceManager {
        return new VSConanWorkspaceManager(context, outputChannel, conanApiManager, settingsPropertyManager);
    }

    beforeEach(() => {
        jest.clearAllMocks();

        registeredCommands = {};
        (vscode.commands.registerCommand as jest.Mock).mockImplementation((command: string, cb: (...args: any[]) => any) => {
            registeredCommands[command] = cb;
            return { dispose: jest.fn() };
        });
        (vscode.window.createQuickPick as jest.Mock).mockReturnValue({ items: [] });
        (vscode.window.showQuickPick as jest.Mock).mockImplementation((items: any[]) => Promise.resolve(items[0]));

        context = {
            subscriptions: [],
            workspaceState: { get: jest.fn(), update: jest.fn() },
            environmentVariableCollection: { replace: jest.fn(), delete: jest.fn() }
        };
        outputChannel = { show: jest.fn(), appendLine: jest.fn(), append: jest.fn() };
        conanApiManager = {
            conanApi: {
                getRecipeAttribute: jest.fn(),
                addEditablePackage: jest.fn(),
                getEditablePackageRecipes: jest.fn().mockReturnValue([]),
                removeEditablePackageRecipe: jest.fn()
            }
        } as unknown as ConanAPIManager;
        settingsPropertyManager = {
            getSelectedConanProfile: jest.fn().mockReturnValue("default"),
            getConanProfileObject: jest.fn().mockResolvedValue(undefined),
            getListOfConanProfiles: jest.fn().mockReturnValue([]),
            updateConanProfile: jest.fn(),
            isProfileValid: jest.fn().mockResolvedValue(false),
            getConanVersionOfProfile: jest.fn().mockResolvedValue(null),
            isUpdateDotEnv: jest.fn().mockReturnValue(false)
        } as unknown as SettingsPropertyManager;

        (VSConanWorkspaceEnvironment.prototype.activateEnvironment as jest.Mock).mockResolvedValue(undefined);
        (VSConanWorkspaceEnvironment.prototype.restoreEnvironment as jest.Mock).mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("createWorkspaceConfig", () => {
        it("should create the config file and open it when it doesn't already exist", async () => {
            const selectWorkspaceMock = jest.spyOn(utils.workspace, "selectWorkspace").mockResolvedValue("/path/to/ws");
            const getWorkspaceConfigPathMock = jest.spyOn(utils.vsconan, "getWorkspaceConfigPath").mockReturnValue("/path/to/ws/.vsconan/config.json");
            const existsSyncMock = jest.spyOn(fs, "existsSync").mockReturnValue(false);
            const mkdirSyncMock = jest.spyOn(fs, "mkdirSync").mockImplementation(() => undefined as any);
            const createInitialWorkspaceConfigMock = jest.spyOn(utils.vsconan.config, "createInitialWorkspaceConfig").mockImplementation(() => undefined);
            const openFileInEditorMock = jest.spyOn(utils.editor, "openFileInEditor").mockResolvedValue(undefined);

            createManager();
            await registeredCommands["vsconan.config.workspace.create"]();
            await Promise.resolve();

            expect(mkdirSyncMock).toHaveBeenCalledWith("/path/to/ws/.vsconan", { recursive: true });
            expect(createInitialWorkspaceConfigMock).toHaveBeenCalledWith("/path/to/ws/.vsconan/config.json");
            expect(openFileInEditorMock).toHaveBeenCalledWith("/path/to/ws/.vsconan/config.json");

            selectWorkspaceMock.mockRestore();
            getWorkspaceConfigPathMock.mockRestore();
            existsSyncMock.mockRestore();
            mkdirSyncMock.mockRestore();
            createInitialWorkspaceConfigMock.mockRestore();
            openFileInEditorMock.mockRestore();
        });

        it("should show a message and not overwrite an existing config file", async () => {
            const selectWorkspaceMock = jest.spyOn(utils.workspace, "selectWorkspace").mockResolvedValue("/path/to/ws");
            const getWorkspaceConfigPathMock = jest.spyOn(utils.vsconan, "getWorkspaceConfigPath").mockReturnValue("/path/to/ws/.vsconan/config.json");
            const existsSyncMock = jest.spyOn(fs, "existsSync").mockReturnValue(true);
            const createInitialWorkspaceConfigMock = jest.spyOn(utils.vsconan.config, "createInitialWorkspaceConfig");

            createManager();
            await registeredCommands["vsconan.config.workspace.create"]();
            await Promise.resolve();

            expect(createInitialWorkspaceConfigMock).not.toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith("Config file already exists in the workspace.");

            selectWorkspaceMock.mockRestore();
            getWorkspaceConfigPathMock.mockRestore();
            existsSyncMock.mockRestore();
            createInitialWorkspaceConfigMock.mockRestore();
        });

        it("should show a message when no workspace is detected", async () => {
            const selectWorkspaceMock = jest.spyOn(utils.workspace, "selectWorkspace").mockRejectedValue(undefined);

            createManager();
            await registeredCommands["vsconan.config.workspace.create"]();
            await Promise.resolve();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith("Cannot create config file. No workspace detected.");

            selectWorkspaceMock.mockRestore();
        });
    });

    describe("openWorkspaceConfig", () => {
        it("should open the config file for the selected workspace", async () => {
            const selectWorkspaceMock = jest.spyOn(utils.workspace, "selectWorkspace").mockResolvedValue("/path/to/ws");
            const getWorkspaceConfigPathMock = jest.spyOn(utils.vsconan, "getWorkspaceConfigPath").mockReturnValue("/path/to/ws/.vsconan/config.json");
            const openFileInEditorMock = jest.spyOn(utils.editor, "openFileInEditor").mockResolvedValue(undefined);

            createManager();
            await registeredCommands["vsconan.config.workspace.open"]();

            expect(openFileInEditorMock).toHaveBeenCalledWith("/path/to/ws/.vsconan/config.json");

            selectWorkspaceMock.mockRestore();
            getWorkspaceConfigPathMock.mockRestore();
            openFileInEditorMock.mockRestore();
        });

        it("should show an error when no workspace is selected", async () => {
            const selectWorkspaceMock = jest.spyOn(utils.workspace, "selectWorkspace").mockResolvedValue(undefined);

            createManager();
            await registeredCommands["vsconan.config.workspace.open"]();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("Unable to find the config file.");

            selectWorkspaceMock.mockRestore();
        });
    });

    describe("executeConanCommand (config path lookup)", () => {
        it("should show a warning when no config file is found in the workspace", async () => {
            const selectWorkspaceMock = jest.spyOn(utils.workspace, "selectWorkspace").mockResolvedValue("/path/to/ws");
            const getWorkspaceConfigPathMock = jest.spyOn(utils.vsconan, "getWorkspaceConfigPath").mockReturnValue("/path/to/ws/.vsconan/config.json");
            const existsSyncMock = jest.spyOn(fs, "existsSync").mockReturnValue(false);

            createManager();
            await registeredCommands["vsconan.conan.create"]();

            expect(getWorkspaceConfigPathMock).toHaveBeenCalledWith("/path/to/ws");
            expect(existsSyncMock).toHaveBeenCalledWith("/path/to/ws/.vsconan/config.json");
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith("Unable to find configuration file in the workspace '/path/to/ws'");

            selectWorkspaceMock.mockRestore();
            getWorkspaceConfigPathMock.mockRestore();
            existsSyncMock.mockRestore();
        });
    });
});
