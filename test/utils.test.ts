import * as vscode from "./mocks/vscode";
jest.mock('vscode', () => vscode, { virtual: true });

import * as utils from "../src/utils/utils";
import * as os from "os";
import * as path from "path";

import { ConanProfileConfiguration } from "../src/extension/settings/model";
import { general } from "../src/utils/utils";


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
