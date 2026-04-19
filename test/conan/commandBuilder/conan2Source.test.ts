import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan2 } from "../../../src/conans/conan2/commandBuilder";
import { configCommandSourceSchemaDefault } from "../../../src/conans/command/configCommand";

jest.mock("vscode", () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan2;

beforeAll(() => {
    commandBuilder = new CommandBuilderConan2();
});

describe("Conan 2 Source method", () => {
    it("should return conan source command with recipe path only", () => {
        const cfg = configCommandSourceSchemaDefault.parse({});
        const cmd = commandBuilder.buildCommandSource("/home/user/ws", cfg);

        expect(cmd?.length).toBe(1);
        expect(cmd?.join(" ")).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")}`);
    });

    it("should return conan source command with user and channel", () => {
        const cfg = configCommandSourceSchemaDefault.parse({
            user: "user",
            channel: "channel",
        });
        const cmd = commandBuilder.buildCommandSource("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);
        expect(cmd?.join(" ")).toBe(
            `${JSON.stringify("/home/user/ws/conanfile.py")} --user user --channel channel`
        );
    });

    it("should return undefined due to missing conan recipe", () => {
        const cfg = configCommandSourceSchemaDefault.parse({ conanRecipe: "" });
        const cmd = commandBuilder.buildCommandSource("/home/user/ws", cfg);

        expect(cmd).toBe(undefined);
    });

    it("should append additional args", () => {
        const cfg = configCommandSourceSchemaDefault.parse({
            args: ["--lockfile", "deps.lock"],
        });
        const cmd = commandBuilder.buildCommandSource("/home/user/ws", cfg);

        expect(cmd?.length).toBe(3);
        expect(cmd?.join(" ")).toBe(
            `${JSON.stringify("/home/user/ws/conanfile.py")} --lockfile deps.lock`
        );
    });
});
