import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan1 } from "../../../src/conans/conan/commandBuilder";
import { configCommandSourceSchema } from "../../../src/conans/command/configCommand";
import path = require("path");

jest.mock('vscode', () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan1;

beforeAll(() => {
    commandBuilder = new CommandBuilderConan1();
});

describe("Conan 1 Source method", () => {

    it("should return conan source command with standard value", () => {
        let cfg = configCommandSourceSchema.parse({});
        let cmd = commandBuilder.buildCommandSource("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);

        let cmdString = cmd?.join(" ");

        expect(cmdString).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -if ${JSON.stringify("/home/user/ws/install")} -sf ${JSON.stringify("/home/user/ws/source")}`);
    });

    it("should return undefined due to missing conan recipe", () => {
        let cfg = configCommandSourceSchema.parse({
            conanRecipe: ""
        });

        let cmd = commandBuilder.buildCommandSource("/home/user/ws", cfg);

        expect(cmd).toBe(undefined);
    });
});