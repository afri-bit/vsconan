import * as vscode from "../mocks/vscode";
import { ConanExecutionMode } from "../../src/conans/api/base/conanAPI";
import { ConanAPIManager } from "../../src/conans/api/conanAPIManager";
import { Conan1API } from "../../src/conans/conan/api/conanAPI";
import { Conan2API } from "../../src/conans/conan2/api/conanAPI";

jest.mock('vscode', () => vscode, { virtual: true });

let conanApiManager: ConanAPIManager;


beforeAll(() => {
    conanApiManager = new ConanAPIManager();
});

describe("Initialization", () => {
    it("should have undefined conan API", () => {
        expect(conanApiManager.conanApi).toBe(undefined);
    });

    it("should have empty string of conan version", () => {
        expect(conanApiManager.conanVersion).toBe("");
    });

});


// conanVersion: string, pythonInterpreter: string, conanExecutable: string, conanExecutionMode: ConanExecutionMode
describe("Setting API Instance", () => {

    it("should have conan API version 1", () => {
        conanApiManager.setApiInstance("1", "python", "conan", ConanExecutionMode.conan);
        expect(conanApiManager.conanApi).toBeInstanceOf(Conan1API);

        expect(conanApiManager.conanVersion).toBe("1");
    });

    it("should have conan API version 2", () => {
        conanApiManager.setApiInstance("2", "python", "conan", ConanExecutionMode.conan);
        expect(conanApiManager.conanApi).toBeInstanceOf(Conan2API);

        expect(conanApiManager.conanVersion).toBe("2");
    });

    it("should return undefined for Conan API object", () => {
        let invalidVersion: string = "3";

        conanApiManager.setApiInstance(invalidVersion, "python", "conan", ConanExecutionMode.conan);
        expect(conanApiManager.conanApi).toBe(undefined);

        expect(conanApiManager.conanVersion).toBe("");
    });
});
