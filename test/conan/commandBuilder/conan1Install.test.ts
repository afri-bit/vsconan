import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan1 } from "../../../src/conans/conan/commandBuilder";
import { configCommandInstallSchemaDefault } from "../../../src/conans/command/configCommand";
import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan1;

beforeAll(() => {
    commandBuilder = new CommandBuilderConan1();
});

describe("Conan 1 Install method", () => {

    it("should return conan install command with standard value", () => {
        let cfg = configCommandInstallSchemaDefault.parse({});
        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pr default -if ${JSON.stringify("/home/user/ws/install")}`);
    });

    it("should return conan install command with custom profile", () => {
        let cfg = configCommandInstallSchemaDefault.parse({
            profile: "foo"
        });

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pr foo -if ${JSON.stringify("/home/user/ws/install")}`);
    });

    it("should return conan install command with user and channel", () => {
        let cfg = configCommandInstallSchemaDefault.parse({
            profile: "foo",
            user: "user",
            channel: "channel"
        });

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(6);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} user/channel -pr foo -if ${JSON.stringify("/home/user/ws/install")}`);
    });

    it("should return conan install command without user and channel due to missing user", () => {
        let cfg = configCommandInstallSchemaDefault.parse({
            profile: "foo",
            channel: "channel"
        });

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pr foo -if ${JSON.stringify("/home/user/ws/install")}`);
    });

    it("should return undefined due to missing conan recipe", () => {
        let cfg = configCommandInstallSchemaDefault.parse({
            conanRecipe: ""
        });

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd).toBe(undefined);
    });

    it("should return conan install command with custom install folder", () => {
        let cfg = configCommandInstallSchemaDefault.parse({
            installFolder: "bar"
        });

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pr default -if ${JSON.stringify("/home/user/ws/bar")}`);
    });

    it("should return conan install command with additional args", () => {
        let cfg = configCommandInstallSchemaDefault.parse({
            installFolder: "bar",
            args: ["-pr:b", "foo"]
        });

        let cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(7);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pr default -if ${JSON.stringify("/home/user/ws/bar")} -pr:b foo`);
    });
});