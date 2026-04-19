import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan2 } from "../../../src/conans/conan2/commandBuilder";
import { configCommandPackageExportSchemaDefault } from "../../../src/conans/command/configCommand";

jest.mock("vscode", () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan2;

beforeAll(() => {
    commandBuilder = new CommandBuilderConan2();
});

describe("Conan 2 Package export method", () => {
    it("should return export-pkg arguments with recipe path only", () => {
        const cfg = configCommandPackageExportSchemaDefault.parse({});
        const cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd?.length).toBe(1);
        expect(cmd?.join(" ")).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")}`);
    });

    it("should return export-pkg arguments with user and channel", () => {
        const cfg = configCommandPackageExportSchemaDefault.parse({
            user: "user",
            channel: "channel",
        });
        const cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);
        expect(cmd?.join(" ")).toBe(
            `${JSON.stringify("/home/user/ws/conanfile.py")} --user user --channel channel`
        );
    });

    it("should return undefined due to missing conan recipe", () => {
        const cfg = configCommandPackageExportSchemaDefault.parse({ conanRecipe: "" });
        const cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd).toBe(undefined);
    });

    it("should append additional args (folder options ignored for Conan 2)", () => {
        const cfg = configCommandPackageExportSchemaDefault.parse({
            installFolder: "ignored",
            args: ["--force"],
        });
        const cmd = commandBuilder.buildCommandPackageExport("/home/user/ws", cfg);

        expect(cmd?.length).toBe(2);
        expect(cmd?.join(" ")).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} --force`);
    });
});
