import * as vscode from "./mocks/vscode";

import { vsconan } from "../src/utils/utils";

import * as os from "os";
import * as path from "path";

jest.mock('vscode', () => vscode, { virtual: true });

import { ConanProfileConfiguration } from "../src/extension/settings/model";
import { general } from "../src/utils/utils";


describe("Plain Object to Class", () => {
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



describe("Home Directory", () => {
    it("should convert plain object to class", () => {

        jest.mock("os");

        const mockedHomedir = jest.spyOn(os, 'homedir').mockReturnValue(path.normalize('/home/user'));

        let abc = vsconan.getVSConanHomeDir();
        expect(abc).toEqual(path.normalize("/home/user/.vsconan"));

        expect(mockedHomedir).toHaveBeenCalled();

        mockedHomedir.mockRestore();
    });
});
