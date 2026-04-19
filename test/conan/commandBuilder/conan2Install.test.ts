import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan2 } from "../../../src/conans/conan2/commandBuilder";
import { configCommandInstallSchemaDefault } from "../../../src/conans/command/configCommand";

jest.mock("vscode", () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan2;

beforeAll(() => {
    commandBuilder = new CommandBuilderConan2();
});

describe("Conan 2 Install method", () => {
    it("should return conan install command with standard value", () => {
        const cfg = configCommandInstallSchemaDefault.parse({});
        const cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(3);
        expect(cmd?.join(" ")).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pr default`);
    });

    it("should return conan install command with custom profile", () => {
        const cfg = configCommandInstallSchemaDefault.parse({ profile: "foo" });
        const cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(3);
        expect(cmd?.join(" ")).toBe(`${JSON.stringify("/home/user/ws/conanfile.py")} -pr foo`);
    });

    it("should return conan install command with user and channel", () => {
        const cfg = configCommandInstallSchemaDefault.parse({
            profile: "foo",
            user: "user",
            channel: "channel",
        });
        const cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(7);
        expect(cmd?.join(" ")).toBe(
            `${JSON.stringify("/home/user/ws/conanfile.py")} --user user --channel channel -pr foo`
        );
    });

    it("should omit user/channel flags when only channel is set without user", () => {
        const cfg = configCommandInstallSchemaDefault.parse({
            profile: "foo",
            channel: "channel",
        });
        const cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);
        expect(cmd?.join(" ")).toBe(
            `${JSON.stringify("/home/user/ws/conanfile.py")} --channel channel -pr foo`
        );
    });

    it("should return undefined due to missing conan recipe", () => {
        const cfg = configCommandInstallSchemaDefault.parse({ conanRecipe: "" });
        const cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd).toBe(undefined);
    });

    it("should append additional args (install folder ignored for Conan 2)", () => {
        const cfg = configCommandInstallSchemaDefault.parse({
            installFolder: "bar",
            args: ["-pr:b", "foo"],
        });
        const cmd = commandBuilder.buildCommandInstall("/home/user/ws", cfg);

        expect(cmd?.length).toBe(5);
        expect(cmd?.join(" ")).toBe(
            `${JSON.stringify("/home/user/ws/conanfile.py")} -pr default -pr:b foo`
        );
    });
});
