import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan1 } from "../../../src/conans/conan/commandBuilder";
import { ConfigCommandSource } from "../../../src/conans/command/configCommand";
import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan1;


beforeAll(() => {
    commandBuilder = new CommandBuilderConan1();
});


describe("Conan 1 Source method", () => {

    it("should return conan source command with standard value", () => {

        let cmd = commandBuilder.buildCommandSource("/home/user/ws", new ConfigCommandSource());

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${path.normalize("/home/user/ws/conanfile.py")} -if ${path.normalize("/home/user/ws/install")} -sf ${path.normalize("/home/user/ws/source")}`);
    });

    it("should return undefined due to missing conan recipe", () => {

        let conanSource = new ConfigCommandSource();
        conanSource.conanRecipe = "";

        let cmd = commandBuilder.buildCommandSource("/home/user/ws", conanSource);

        expect(cmd).toBe(undefined);
    });
}); 