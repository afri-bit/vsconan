import * as vscode from "../mocks/vscode";

import { CommandBuilderFactory } from "../../src/conans/command/commandBuilderFactory";
import { CommandBuilderConan1 } from "../../src/conans/conan/commandBuilder";
import { CommandBuilderConan2 } from "../../src/conans/conan2/commandBuilder";
import { ConfigCommandBuild, ConfigCommandCreate } from "../../src/conans/command/configCommand";

jest.mock('vscode', () => vscode, { virtual: true });


describe("Conan 1 Create method", () => {
    let cfgCreate = new ConfigCommandCreate();

    it("should return true", () => {
        expect(true).toBe(true);
    });

});