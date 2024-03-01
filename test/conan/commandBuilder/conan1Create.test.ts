import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan1 } from "../../../src/conans/conan/commandBuilder";
import { ConfigCommandCreate } from "../../../src/conans/command/configCommand";
import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan1;


beforeAll(() => {
    commandBuilder = new CommandBuilderConan1();
});

describe("Conan 1 Create method", () => {

    it("should return conan create command with standard value", () => {

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", new ConfigCommandCreate());

        expect(cmd).toBe(`create ${path.normalize("/home/user/ws/conanfile.py")} -pr default`);
    });

    it("should return conan create command with user and channel", () => {

        let conanCreate = new ConfigCommandCreate();
        conanCreate.user = "user";
        conanCreate.channel = "channel";

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", conanCreate);

        expect(cmd).toBe(`create ${path.normalize("/home/user/ws/conanfile.py")} user/channel -pr default`);
    });

    it("should return command string without user and channel due to missing user", () => {

        let conanCreate = new ConfigCommandCreate();
        conanCreate.channel = "channel";

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", conanCreate);

        expect(cmd).toBe(`create ${path.normalize("/home/user/ws/conanfile.py")} -pr default`);
    });

    it("should return command string without user and channel due to missing channel", () => {

        let conanCreate = new ConfigCommandCreate();
        conanCreate.user = "user";

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", conanCreate);

        expect(cmd).toBe(`create ${path.normalize("/home/user/ws/conanfile.py")} -pr default`);
    });

    it("should return undefined due to missing conan recipe", () => {

        let conanCreate = new ConfigCommandCreate();
        conanCreate.conanRecipe = "";

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", conanCreate);

        expect(cmd).toBe(undefined);
    });

    it("should return command with user profile", () => {

        let conanCreate = new ConfigCommandCreate();
        conanCreate.profile = "myProfile";

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", conanCreate);

        expect(cmd).toBe(`create ${path.normalize("/home/user/ws/conanfile.py")} -pr myProfile`);
    });

    it("should return command additional flags from args", () => {

        let conanCreate = new ConfigCommandCreate();
        conanCreate.profile = "myProfile";
        conanCreate.args = ["-pr:h", "host", "-pr:b", "build"];

        let cmd = commandBuilder.buildCommandCreate("/home/user/ws", conanCreate);

        expect(cmd).toBe(`create ${path.normalize("/home/user/ws/conanfile.py")} -pr myProfile -pr:h host -pr:b build`);
    });

});