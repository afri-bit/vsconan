import * as vscode from "../mocks/vscode";

import { CommandBuilderFactory } from "../../src/conans/command/commandBuilderFactory";
import { CommandBuilderConan1 } from "../../src/conans/conan/commandBuilder";
import { CommandBuilderConan2 } from "../../src/conans/conan2/commandBuilder";

jest.mock('vscode', () => vscode, { virtual: true });

describe("Test factory method for command builder", () => {
    it("should create command builder for conan version 1", () => {

        let cmdBuilder = CommandBuilderFactory.getCommandBuilder("1");

        expect(cmdBuilder).toBeInstanceOf(CommandBuilderConan1);

    });

    it("should create command builder for conan version 2", () => {

        let cmdBuilder = CommandBuilderFactory.getCommandBuilder("2");

        expect(cmdBuilder).toBeInstanceOf(CommandBuilderConan2);

    });

    it("should return undefined", () => {

        let cmdBuilder = CommandBuilderFactory.getCommandBuilder("3");

        expect(cmdBuilder).toBe(undefined);

    });



});