import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan2 } from "../../../src/conans/conan2/commandBuilder";
import { configCommandCreateSchemaDefault } from "../../../src/conans/command/configCommand";
import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan2;

beforeAll(() => {
    commandBuilder = new CommandBuilderConan2();
});

describe("Conan 2 Create method", () => {

    it("should return conan create command with standard value", () => {
        let cfg = configCommandCreateSchemaDefault.parse({});
        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", cfg);

        expect(cmd?.length).toBe(3);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pr default`);
    });

    it("should return conan create command with user and channel", () => {
        let cfg = configCommandCreateSchemaDefault.parse({
            user: "user",
            channel: "channel"
        });

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", cfg);

        expect(cmd?.length).toBe(7);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} --user user --channel channel -pr default`);
    });

    it("should return command string with only channel", () => {
        let cfg = configCommandCreateSchemaDefault.parse({
            channel: "channel"
        });

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} --channel channel -pr default`);
    });

    it("should return command string with only user", () => {
        let cfg = configCommandCreateSchemaDefault.parse({
            user: "user"
        });

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} --user user -pr default`);
    });

    it("should return undefined due to missing conan recipe", () => {
        let cfg = configCommandCreateSchemaDefault.parse({
            conanRecipe: ""
        });

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", cfg);

        expect(cmd).toBe(undefined);
    });

    it("should return command additional flags from args", () => {
        let cfg = configCommandCreateSchemaDefault.parse({
            user: "user",
            channel: "channel",
            profile: "myProfile",
            args: ["-pr:h", "host", "-pr:b", "build"]
        });

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", cfg);

        expect(cmd?.length).toBe(11);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} --user user --channel channel -pr myProfile -pr:h host -pr:b build`);
    });

});