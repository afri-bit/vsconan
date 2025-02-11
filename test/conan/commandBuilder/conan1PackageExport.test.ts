import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan1 } from "../../../src/conans/conan/commandBuilder";
import { ConfigCommandPackageExport } from "../../../src/conans/command/configCommand";
import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan1;


beforeAll(() => {
    commandBuilder = new CommandBuilderConan1();
});


describe("Conan 1 Package method", () => {

    it("should return conan package export command with standard value", () => {

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", new ConfigCommandPackageExport());

        expect(cmd?.length).toBe(9);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -if ${JSON.stringify("/home/user/ws/install")} -bf ${JSON.stringify("/home/user/ws/build")} -pf ${JSON.stringify("/home/user/ws/package")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return undefined due to missing conan recipe", () => {

        let conanPackageExport = new ConfigCommandPackageExport();
        conanPackageExport.conanRecipe = "";

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", conanPackageExport);

        expect(cmd).toBe(undefined);
    });

    it("should return conan package export command without install folder", () => {

        let conanPackageExport = new ConfigCommandPackageExport();
        conanPackageExport.installFolder = "";

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", conanPackageExport);

        expect(cmd?.length).toBe(7);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -bf ${JSON.stringify("/home/user/ws/build")} -pf ${JSON.stringify("/home/user/ws/package")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return conan package export command without build folder", () => {

        let conanPackageExport = new ConfigCommandPackageExport();
        conanPackageExport.installFolder = "";
        conanPackageExport.buildFolder = "";

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", conanPackageExport);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pf ${JSON.stringify("/home/user/ws/package")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return conan package export command without source folder", () => {

        let conanPackageExport = new ConfigCommandPackageExport();
        conanPackageExport.installFolder = "";
        conanPackageExport.buildFolder = "";
        conanPackageExport.sourceFolder = "";

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", conanPackageExport);

        expect(cmd?.length).toBe(3);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pf ${JSON.stringify("/home/user/ws/package")}`);
    });

    it("should return conan package export command without package folder", () => {

        let conanPackageExport = new ConfigCommandPackageExport();
        conanPackageExport.installFolder = "";
        conanPackageExport.buildFolder = "";
        conanPackageExport.sourceFolder = "";
        conanPackageExport.packageFolder = "";

        let cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", conanPackageExport);

        expect(cmd?.length).toBe(1);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")}`);
    });

}); 