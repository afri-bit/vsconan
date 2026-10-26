import * as vscode from "./mocks/vscode";
jest.mock('vscode', () => vscode, { virtual: true });

import * as utils from "../src/utils/utils";
import * as os from "os";
import * as path from "path";

import { ConanProfileConfiguration } from "../src/extension/settings/model";
import { general, workspace } from "../src/utils/utils";
import { ConfigWorkspace } from "../src/conans/workspace/configWorkspace";


describe("General", () => {
    it("should convert plain object to class", () => {
        let plainObject: object = {
            "conanPythonInterpreter": "python",
            "conanExecutable": "conan",
            "conanExecutionMode": "conanExecutable",
            "conanVersion": "2",
        };

        let profile: ConanProfileConfiguration = general.plainObjectToClass(ConanProfileConfiguration, plainObject);
        expect(profile.conanExecutable).toBe("conan");
        expect(profile.conanVersion).toBe("2");
        expect(profile.conanExecutionMode).toBe("conanExecutable");
        expect(profile.conanPythonInterpreter).toBe("python");
        expect(profile.conanUserHome).toBe(undefined);

        expect(profile.isValid()).toBeTruthy();
    });

    it("should ignore overpacked attributes from plain object", () => {
        let plainObject: object = {
            "conanPythonInterpreter": "python",
            "conanExecutable": "conan",
            "conanExecutionMode": "conanExecutable",
            "conanVersion": "2",
            "externalAttribute": "someValue",
            "unwantedAttribute": "123"
        };

        let profile: ConanProfileConfiguration = general.plainObjectToClass(ConanProfileConfiguration, plainObject);

        expect(profile.conanExecutable).toBe("conan");
        expect(profile.conanVersion).toBe("2");
        expect(profile.conanExecutionMode).toBe("conanExecutable");
        expect(profile.conanPythonInterpreter).toBe("python");
        expect(profile.conanUserHome).toBe(undefined);
    });
});

describe("VSConan Utils", () => {
    it("should return home directory of vsconan in user home directory", () => {

        jest.mock("os");

        const mockedHomedir = jest.spyOn(os, 'homedir').mockReturnValue(path.normalize('/home/user'));

        let homeDir = utils.vsconan.getVSConanHomeDir();
        expect(homeDir).toEqual(path.normalize("/home/user/.vsconan"));

        expect(mockedHomedir).toHaveBeenCalled();

        mockedHomedir.mockRestore();
    });

    it("should return path to temp directory of vsconan", () => {

        jest.mock("os");
        const mockedHomedir = jest.spyOn(os, 'homedir').mockReturnValue(path.normalize('/home/user'));

        utils.vsconan.getVSConanHomeDir = jest.fn().mockImplementationOnce(() => "/home/user/.vsconan");

        let tempDir = utils.vsconan.getVSConanHomeDirTemp();

        expect(tempDir).toEqual(path.normalize("/home/user/.vsconan/temp"));

        mockedHomedir.mockRestore();
    });
});

describe("getWorkspaceConfigPath", () => {
    const workspacePath = path.normalize("/path/to/workspace");
    let getConfigurationMock: jest.Mock;

    beforeEach(() => {
        getConfigurationMock = jest.fn();
        (vscode as any).workspace = { getConfiguration: getConfigurationMock };
        (vscode as any).Uri = { file: (fsPath: string) => ({ fsPath }) };
    });

    it("should resolve the default relative config path against the workspace folder", () => {
        const get = jest.fn().mockImplementation((key: string, defaultValue: string) => defaultValue);
        getConfigurationMock.mockReturnValue({ get });

        const configPath = utils.vsconan.getWorkspaceConfigPath(workspacePath);

        expect(getConfigurationMock).toHaveBeenCalledWith("vsconan", { fsPath: workspacePath });
        expect(get).toHaveBeenCalledWith("workspace.configPath", path.join(".vsconan", "config.json"));
        expect(configPath).toEqual(path.join(workspacePath, ".vsconan", "config.json"));
    });

    it("should resolve a custom relative config path against the workspace folder", () => {
        const get = jest.fn().mockReturnValue("custom/myConfig.json");
        getConfigurationMock.mockReturnValue({ get });

        const configPath = utils.vsconan.getWorkspaceConfigPath(workspacePath);

        expect(configPath).toEqual(path.join(workspacePath, "custom/myConfig.json"));
    });

    it("should use an absolute config path unchanged", () => {
        const absolutePath = path.normalize("/absolute/myConfig.json");
        const get = jest.fn().mockReturnValue(absolutePath);
        getConfigurationMock.mockReturnValue({ get });

        const configPath = utils.vsconan.getWorkspaceConfigPath(workspacePath);

        expect(configPath).toEqual(absolutePath);
    });
});

describe("Config", () => {
    it("should create the initial workspace config with a default preset workflow", () => {
        const writeToFileMock = jest.spyOn(ConfigWorkspace.prototype, "writeToFile").mockImplementation(() => { });

        const configFilePath = path.normalize("/path/to/workspace/.vsconan/config.json");
        utils.vsconan.config.createInitialWorkspaceConfig(configFilePath);

        expect(writeToFileMock).toHaveBeenCalledWith(configFilePath);

        const configWorkspace = writeToFileMock.mock.instances[0] as unknown as ConfigWorkspace;
        expect(configWorkspace.commandContainer.create).toHaveLength(0);
        expect(configWorkspace.presetContainer).toHaveProperty("default");

        writeToFileMock.mockRestore();
    });
});

describe("Workspace", ()=>{

    it("should get the absolute path", () => {
        let workspacePath = "/path/to/workspace";

        let pathName = "/absolute/path/to/some/file";

        let realPath = workspace.getAbsolutePathFromWorkspace(workspacePath, pathName);

        expect(realPath).toEqual(JSON.stringify(pathName));

    });

    it("should get the absolute path from the workspace", () => {
        let workspacePath = "/path/to/workspace";

        let pathName = "relative/path/to/some/file";

        let realPath = workspace.getAbsolutePathFromWorkspace(workspacePath, pathName);

        expect(realPath).toEqual(JSON.stringify("/path/to/workspace/relative/path/to/some/file"));

    });

    it("should get the absolute path from the workspace (extra slash at the end)", () => {
        let workspacePath = "/path/to/workspace/";

        let pathName = "relative/path/to/some/file";

        let realPath = workspace.getAbsolutePathFromWorkspace(workspacePath, pathName);

        expect(realPath).toEqual(JSON.stringify("/path/to/workspace/relative/path/to/some/file"));

    });

    it("should escape the white space with relative path", () => {
        let workspacePath = "/path/to/workspace/";

        let pathName = "relative/path/to/some file";

        let realPath = workspace.getAbsolutePathFromWorkspace(workspacePath, pathName);

        expect(realPath).toEqual(JSON.stringify("/path/to/workspace/relative/path/to/some file"));

    });

    it("should get the absolute path with escaped whitespace", () => {
        let workspacePath = "/path/to/workspace";

        let pathName = "/absolute/path/to/some file";

        let realPath = workspace.getAbsolutePathFromWorkspace(workspacePath, pathName);

        expect(realPath).toEqual(JSON.stringify("/absolute/path/to/some file"));

    });
});
