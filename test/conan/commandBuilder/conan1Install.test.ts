import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan1 } from "../../../src/conans/conan/commandBuilder";
import { ConfigCommandInstall } from "../../../src/conans/command/configCommand";
import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan1;


beforeAll(() => {
    commandBuilder = new CommandBuilderConan1();
});


describe("Conan 1 Install method", () => {

    it("should return conan install command with standard value", () => {

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", new ConfigCommandInstall());

        expect(cmd).toBe(`install ${path.normalize("/home/user/ws/conanfile.py")} -pr default -if ${path.normalize("/home/user/ws/install")}`);
    });

    it("should return conan install command with custom profile", () => {

        let conanInstall = new ConfigCommandInstall();
        conanInstall.profile = "foo";

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", conanInstall);

        expect(cmd).toBe(`install ${path.normalize("/home/user/ws/conanfile.py")} -pr foo -if ${path.normalize("/home/user/ws/install")}`);
    });

    it("should return conan install command with user and channel", () => {

        let conanInstall = new ConfigCommandInstall();
        conanInstall.profile = "foo";
        conanInstall.user = "user";
        conanInstall.channel = "channel";

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", conanInstall);

        expect(cmd).toBe(`install ${path.normalize("/home/user/ws/conanfile.py")} user/channel -pr foo -if ${path.normalize("/home/user/ws/install")}`);
    });

    it("should return conan install command without user and channel due to missing user", () => {

        let conanInstall = new ConfigCommandInstall();
        conanInstall.profile = "foo";
        conanInstall.channel = "channel";

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", conanInstall);

        expect(cmd).toBe(`install ${path.normalize("/home/user/ws/conanfile.py")} -pr foo -if ${path.normalize("/home/user/ws/install")}`);
    });

    it("should return undefined due to missing conan recipe", () => {

        let conanInstall = new ConfigCommandInstall();
        conanInstall.conanRecipe = "";

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", conanInstall);

        expect(cmd).toBe(undefined);
    });

    it("should return conan install command with custom install folder", () => {

        let conanInstall = new ConfigCommandInstall();
        conanInstall.installFolder = "bar";

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", conanInstall);

        expect(cmd).toBe(`install ${path.normalize("/home/user/ws/conanfile.py")} -pr default -if ${path.normalize("/home/user/ws/bar")}`);
    });

    it("should return conan install command with additional args", () => {
        let conanInstall = new ConfigCommandInstall();
        conanInstall.installFolder = "bar";
        conanInstall.args = ["-pr:b", "foo"]

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", conanInstall);

        expect(cmd).toBe(`install ${path.normalize("/home/user/ws/conanfile.py")} -pr default -if ${path.normalize("/home/user/ws/bar")} -pr:b foo`);
    });
}); 