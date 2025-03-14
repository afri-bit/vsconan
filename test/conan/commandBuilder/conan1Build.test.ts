import * as vscode from "../../mocks/vscode";

import { configCommandBuildSchemaDefault } from "../../../src/conans/command/configCommand";
import { CommandBuilderConan1 } from "../../../src/conans/conan/commandBuilder";

import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan1;


beforeAll(() => {
    commandBuilder = new CommandBuilderConan1();
});


describe("Conan 1 Build method", () => {

    it("should return conan build command with standard value", () => {

        let cmd = commandBuilder.buildCommandBuild("/home/user/ws", configCommandBuildSchemaDefault.parse({}));

        expect(cmd?.length).toBe(9);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -if ${JSON.stringify("/home/user/ws/install")} -bf ${JSON.stringify("/home/user/ws/build")} -pf ${JSON.stringify("/home/user/ws/package")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return undefined due to missing conan recipe", () => {

        let conanBuild = configCommandBuildSchemaDefault.parse({});
        conanBuild.conanRecipe = "";

        let cmd = commandBuilder.buildCommandBuild("/home/user/ws", conanBuild);

        expect(cmd).toBe(undefined);
    });

    it("should return conan build command without install folder", () => {

        let conanBuild = configCommandBuildSchemaDefault.parse({});
        conanBuild.installFolder = "";

        let cmd = commandBuilder.buildCommandBuild("/home/user/ws", conanBuild);

        expect(cmd?.length).toBe(7);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -bf ${JSON.stringify("/home/user/ws/build")} -pf ${JSON.stringify("/home/user/ws/package")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return conan build command without build folder", () => {

        let conanBuild = configCommandBuildSchemaDefault.parse({});
        conanBuild.buildFolder = "";

        let cmd = commandBuilder.buildCommandBuild("/home/user/ws", conanBuild);

        expect(cmd?.length).toBe(7);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -if ${JSON.stringify("/home/user/ws/install")} -pf ${JSON.stringify("/home/user/ws/package")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return conan build command without package folder", () => {

        let conanBuild = configCommandBuildSchemaDefault.parse({});
        conanBuild.packageFolder = "";

        let cmd = commandBuilder.buildCommandBuild("/home/user/ws", conanBuild);

        expect(cmd?.length).toBe(7);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -if ${JSON.stringify("/home/user/ws/install")} -bf ${JSON.stringify("/home/user/ws/build")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return conan build command without source folder", () => {

        let conanBuild = configCommandBuildSchemaDefault.parse({});
        conanBuild.sourceFolder = "";

        let cmd = commandBuilder.buildCommandBuild("/home/user/ws", conanBuild);

        expect(cmd?.length).toBe(7);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -if ${JSON.stringify("/home/user/ws/install")} -bf ${JSON.stringify("/home/user/ws/build")} -pf ${JSON.stringify("/home/user/ws/package")}`);
    });

    it("should return conan build command without folder definitions", () => {

        let conanBuild = configCommandBuildSchemaDefault.parse({});
        conanBuild.installFolder = "";
        conanBuild.sourceFolder = "";
        conanBuild.packageFolder = "";
        conanBuild.buildFolder = "";

        let cmd = commandBuilder.buildCommandBuild("/home/user/ws", conanBuild);

        expect(cmd?.length).toBe(1);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")}`);
    });

    it("should return conan build command with additional args", () => {

        let conanBuild = configCommandBuildSchemaDefault.parse({});
        conanBuild.installFolder = "";
        conanBuild.sourceFolder = "";
        conanBuild.packageFolder = "";
        conanBuild.buildFolder = "";
        conanBuild.args = ["--some", "arg", "--another", "arg"];

        let cmd = commandBuilder.buildCommandBuild("/home/user/ws", conanBuild);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} --some arg --another arg`);
    });

}); 