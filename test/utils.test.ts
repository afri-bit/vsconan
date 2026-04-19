import * as vscode from "./mocks/vscode";
jest.mock('vscode', () => vscode, { virtual: true });

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as utils from "../src/utils/utils";
import { configWorkspaceSchema } from "../src/conans/workspace/configWorkspace";
import { ConanProfileConfiguration } from "../src/extension/settings/model";
import * as constants from "../src/utils/constants";
import { conan, general, vsconan, workspace } from "../src/utils/utils";


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
        const mockedHomedir = jest.spyOn(os, "homedir").mockReturnValue(path.normalize("/home/user"));

        const homeDir = utils.vsconan.getVSConanHomeDir();
        expect(homeDir).toEqual(path.normalize("/home/user/.vsconan"));
        expect(mockedHomedir).toHaveBeenCalled();

        mockedHomedir.mockRestore();
    });

    it("should return path to temp directory of vsconan", () => {
        const mockedHomedir = jest.spyOn(os, "homedir").mockReturnValue(path.normalize("/home/user"));

        const tempDir = utils.vsconan.getVSConanHomeDirTemp();
        expect(tempDir).toEqual(path.normalize("/home/user/.vsconan/temp"));

        mockedHomedir.mockRestore();
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

describe("conan.isFolderConanProject", () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vsconan-conanproj-"));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it("should return true when conanfile.py exists", () => {
        fs.writeFileSync(path.join(tempDir, "conanfile.py"), "");
        expect(conan.isFolderConanProject(tempDir)).toBe(true);
    });

    it("should return true when conanfile.txt exists", () => {
        fs.writeFileSync(path.join(tempDir, "conanfile.txt"), "");
        expect(conan.isFolderConanProject(tempDir)).toBe(true);
    });

    it("should return false when neither recipe file exists", () => {
        expect(conan.isFolderConanProject(tempDir)).toBe(false);
    });
});

describe("vsconan.config.createInitialWorkspaceConfig", () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vsconan-wscfg-"));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it("should write JSON that satisfies configWorkspaceSchema", () => {
        vsconan.config.createInitialWorkspaceConfig(tempDir);

        const configPath = path.join(tempDir, constants.CONFIG_FILE);
        expect(fs.existsSync(configPath)).toBe(true);

        const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const parsed = configWorkspaceSchema.safeParse(data);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            const c = parsed.data.commandContainer;
            expect(c.create?.length).toBe(1);
            expect(c.install?.length).toBe(1);
            expect(c.build?.length).toBe(1);
            expect(c.source?.length).toBe(1);
            expect(c.pkg?.length).toBe(1);
            expect(c.pkgExport?.length).toBe(1);
        }
    });
});
