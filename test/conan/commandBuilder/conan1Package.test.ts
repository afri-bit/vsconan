import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan1 } from "../../../src/conans/conan/commandBuilder";
import { ConfigCommandPackage } from "../../../src/conans/command/configCommand";
import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan1;


beforeAll(() => {
    commandBuilder = new CommandBuilderConan1();
});


describe("Conan 1 Package method", () => {

    it("should return conan package command with standard value", () => {

        let cmd = commandBuilder.buildCommandPackage("/home/user/ws", new ConfigCommandPackage());

        expect(cmd).toBe(`package ${path.normalize("/home/user/ws/conanfile.py")} -if ${path.normalize("/home/user/ws/install")} -bf ${path.normalize("/home/user/ws/build")} -pf ${path.normalize("/home/user/ws/package")} -sf ${path.normalize("/home/user/ws/source")}`);
    });

    it("should return undefined due to missing conan recipe", () => {

        let conanPackage = new ConfigCommandPackage();
        conanPackage.conanRecipe = "";

        let cmd = commandBuilder.buildCommandPackage("/home/user/ws", conanPackage);

        expect(cmd).toBe(undefined);
    });

    it("should return conan package command without install folder", () => {

        let conanPackage = new ConfigCommandPackage();
        conanPackage.installFolder = "";

        let cmd = commandBuilder.buildCommandPackage("/home/user/ws", conanPackage);

        expect(cmd).toBe(`package ${path.normalize("/home/user/ws/conanfile.py")} -bf ${path.normalize("/home/user/ws/build")} -pf ${path.normalize("/home/user/ws/package")} -sf ${path.normalize("/home/user/ws/source")}`);
    });

    it("should return conan package command without build folder", () => {

        let conanPackage = new ConfigCommandPackage();
        conanPackage.installFolder = "";
        conanPackage.buildFolder = "";

        let cmd = commandBuilder.buildCommandPackage("/home/user/ws", conanPackage);

        expect(cmd).toBe(`package ${path.normalize("/home/user/ws/conanfile.py")} -pf ${path.normalize("/home/user/ws/package")} -sf ${path.normalize("/home/user/ws/source")}`);
    });

    it("should return conan package command without package folder", () => {

        let conanPackage = new ConfigCommandPackage();
        conanPackage.installFolder = "";
        conanPackage.buildFolder = "";
        conanPackage.packageFolder = "";

        let cmd = commandBuilder.buildCommandPackage("/home/user/ws", conanPackage);

        expect(cmd).toBe(`package ${path.normalize("/home/user/ws/conanfile.py")} -sf ${path.normalize("/home/user/ws/source")}`);
    });

    it("should return conan package without arguments", () => {

        let conanPackage = new ConfigCommandPackage();
        conanPackage.installFolder = "";
        conanPackage.buildFolder = "";
        conanPackage.packageFolder = "";
        conanPackage.sourceFolder = "";

        let cmd = commandBuilder.buildCommandPackage("/home/user/ws", conanPackage);

        expect(cmd).toBe(`package ${path.normalize("/home/user/ws/conanfile.py")}`);
    });
}); 