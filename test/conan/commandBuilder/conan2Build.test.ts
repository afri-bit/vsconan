import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan2 } from "../../../src/conans/conan2/commandBuilder";
import { configCommandBuildSchemaDefault } from "../../../src/conans/command/configCommand";

jest.mock("vscode", () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan2;

beforeAll(() => {
    commandBuilder = new CommandBuilderConan2();
});

describe("Conan 2 Build method", () => {
    it("should return conan build command with recipe path only", () => {
        const cmd = commandBuilder.buildCommandBuild("/home/user/ws", configCommandBuildSchemaDefault.parse({}));

        expect(cmd?.length).toBe(1);
        expect(cmd?.join(" ")).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")}`);
    });

    it("should return undefined due to missing conan recipe", () => {
        const cfg = configCommandBuildSchemaDefault.parse({});
        cfg.conanRecipe = "";
        const cmd = commandBuilder.buildCommandBuild("/home/user/ws", cfg);

        expect(cmd).toBe(undefined);
    });

    it("should append additional args (folder options ignored for Conan 2)", () => {
        const cfg = configCommandBuildSchemaDefault.parse({
            args: ["--build", "missing"],
        });
        const cmd = commandBuilder.buildCommandBuild("/home/user/ws", cfg);

        expect(cmd?.length).toBe(3);
        expect(cmd?.join(" ")).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} --build missing`);
    });
});
