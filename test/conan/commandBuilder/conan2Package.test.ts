import * as vscode from "../../mocks/vscode";

import { CommandBuilderConan2 } from "../../../src/conans/conan2/commandBuilder";
import { configCommandPackageSchemaDefault } from "../../../src/conans/command/configCommand";

jest.mock("vscode", () => vscode, { virtual: true });

let commandBuilder: CommandBuilderConan2;

beforeAll(() => {
    commandBuilder = new CommandBuilderConan2();
});

describe("Conan 2 Package method", () => {
    it("should return undefined (no package command in Conan 2)", () => {
        const cfg = configCommandPackageSchemaDefault.parse({});
        const cmd = commandBuilder.buildCommandPackage("/home/user/ws", cfg);

        expect(cmd).toBe(undefined);
    });
});
