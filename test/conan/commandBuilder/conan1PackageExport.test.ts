import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan1 } from "../../../src/conans/conan/commandBuilder";
import { configCommandPackageExportSchema } from "../../../src/conans/command/configCommand";
import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan1;

beforeAll(() => {
    commandBuilder = new CommandBuilderConan1();
});

describe("Conan 1 Package method", () => {

    it("should return conan package export command with standard value", () => {
        let cfg = configCommandPackageExportSchema.parse({});
        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd?.length).toBe(9);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -if ${JSON.stringify("/home/user/ws/install")} -bf ${JSON.stringify("/home/user/ws/build")} -pf ${JSON.stringify("/home/user/ws/package")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return undefined due to missing conan recipe", () => {
        let cfg = configCommandPackageExportSchema.parse({
            conanRecipe: ""
        });

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd).toBe(undefined);
    });

    it("should return conan package export command without install folder", () => {
        let cfg = configCommandPackageExportSchema.parse({
            installFolder: ""
        });

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd?.length).toBe(7);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -bf ${JSON.stringify("/home/user/ws/build")} -pf ${JSON.stringify("/home/user/ws/package")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return conan package export command without build folder", () => {
        let cfg = configCommandPackageExportSchema.parse({
            installFolder: "",
            buildFolder: ""
        });

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pf ${JSON.stringify("/home/user/ws/package")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return conan package export command without source folder", () => {
        let cfg = configCommandPackageExportSchema.parse({
            installFolder: "",
            buildFolder: "",
            sourceFolder: ""
        });

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd?.length).toBe(3);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pf ${JSON.stringify("/home/user/ws/package")}`);
    });

    it("should return conan package export command without package folder", () => {
        let cfg = configCommandPackageExportSchema.parse({
            installFolder: "",
            buildFolder: "",
            sourceFolder: "",
            packageFolder: ""
        });

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd?.length).toBe(1);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")}`);
    });

});