import * as vscode from "../mocks/vscode";
import { ConanCommandExecutor, ConanCommand } from "../../src/conans/command/commandExecutor";
import { CommandBuilder } from "../../src/conans/command/commandBuilder";
import { CommandBuilderConan2 } from "../../src/conans/conan2/commandBuilder";
import { configCommandBuildSchemaDefault } from "../../src/conans/command/configCommand";
import * as utils from "../../src/utils/utils";

jest.mock("vscode", () => vscode, { virtual: true });
jest.mock("../../src/utils/utils");

describe("ConanCommandExecutor", () => {
    let commandBuilder: CommandBuilder;
    let channel: ReturnType<typeof vscode.window.createOutputChannel>;
    const wsPath = "/home/user/ws";

    beforeEach(() => {
        commandBuilder = new CommandBuilderConan2();
        channel = vscode.window.createOutputChannel("Test Channel");
    });

    it("should execute preTask, conan command, and postTask", async () => {
        const config = configCommandBuildSchemaDefault.parse({
            preTask: [{ name: "pre-task", command: "echo", args: ["pre-task"] }],
            postTask: [{ name: "post-task", command: "echo", args: ["post-task"] }]
        });

        const executor = new ConanCommandExecutor(
            wsPath,
            "conan",
            ConanCommand.build,
            config,
            commandBuilder,
            channel
        );

        utils.vsconan.cmd.executeCommand = jest.fn().mockResolvedValue(undefined);

        await executor.run();

        expect(utils.vsconan.cmd.executeCommand).toHaveBeenCalledWith(
            "echo",
            ["pre-task"],
            channel,
            expect.objectContaining({ cwd: wsPath })
        );
        expect(utils.vsconan.cmd.executeCommand).toHaveBeenCalledWith(
            "conan build",
            expect.anything(),
            channel,
            expect.objectContaining({ cwd: wsPath })
        );
        expect(utils.vsconan.cmd.executeCommand).toHaveBeenCalledWith(
            "echo",
            ["post-task"],
            channel,
            expect.objectContaining({ cwd: wsPath })
        );
    });

    it("should stop execution if preTask fails", async () => {
        const config = configCommandBuildSchemaDefault.parse({
            preTask: [{ name: "pre-task", command: "echo", args: ["pre-task"] }]
        });

        const executor = new ConanCommandExecutor(
            wsPath,
            "conan",
            ConanCommand.build,
            config,
            commandBuilder,
            channel
        );

        utils.vsconan.cmd.executeCommand = jest.fn().mockRejectedValue(new Error("pre-task error"));

        await expect(executor.run()).rejects.toThrow(/pre-task error/);

        expect(utils.vsconan.cmd.executeCommand).toHaveBeenCalledWith(
            "echo",
            ["pre-task"],
            channel,
            expect.objectContaining({ cwd: wsPath })
        );
        expect(utils.vsconan.cmd.executeCommand).not.toHaveBeenCalledWith(
            "conan build",
            expect.anything(),
            channel,
            expect.anything()
        );
    });

    it("should continue execution if preTask fails but continueOnError is true", async () => {
        const config = configCommandBuildSchemaDefault.parse({
            preTask: [{ name: "pre-task", command: "echo", args: ["pre-task"], continueOnError: true }],
            postTask: [{ name: "post-task", command: "echo", args: ["post-task"] }]
        });

        const executor = new ConanCommandExecutor(
            wsPath,
            "conan",
            ConanCommand.build,
            config,
            commandBuilder,
            channel
        );

        utils.vsconan.cmd.executeCommand = jest.fn()
            .mockRejectedValueOnce(new Error("pre-task error"))
            .mockResolvedValue(undefined);

        await executor.run();

        expect(utils.vsconan.cmd.executeCommand).toHaveBeenCalledWith(
            "echo",
            ["pre-task"],
            channel,
            expect.objectContaining({ cwd: wsPath })
        );
        expect(utils.vsconan.cmd.executeCommand).toHaveBeenCalledWith(
            "conan build",
            expect.anything(),
            channel,
            expect.objectContaining({ cwd: wsPath })
        );
        expect(utils.vsconan.cmd.executeCommand).toHaveBeenCalledWith(
            "echo",
            ["post-task"],
            channel,
            expect.objectContaining({ cwd: wsPath })
        );
    });
});
