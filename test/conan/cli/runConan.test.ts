import * as childProcess from "child_process";
import { ConanExecutionMode } from "../../../src/conans/api/base/conanAPI";
import { runConan } from "../../../src/conans/cli/runConan";

type ExecFileCb = (err: Error | null, stdout?: string | Buffer, stderr?: string | Buffer) => void;

function findExecFileCallback(args: unknown[]): ExecFileCb | undefined {
    return args.find((a): a is ExecFileCb => typeof a === "function");
}

describe("runConan", () => {
    let execFileSpy: jest.SpiedFunction<typeof childProcess.execFile>;

    beforeEach(() => {
        execFileSpy = jest.spyOn(childProcess, "execFile").mockImplementation(((...allArgs: unknown[]) => {
            const callback = findExecFileCallback(allArgs);
            if (callback) {
                process.nextTick(() => callback(null, "ok", ""));
            }
            return {} as childProcess.ChildProcess;
        }) as typeof childProcess.execFile);
    });

    afterEach(() => {
        execFileSpy.mockRestore();
    });

    it("invokes conan executable with argv when mode is conan", async () => {
        const result = await runConan(
            ["profile", "list", "--format", "json"],
            ConanExecutionMode.conan,
            "/usr/bin/python3",
            "/opt/conan"
        );

        expect(execFileSpy).toHaveBeenCalledWith(
            "/opt/conan",
            ["profile", "list", "--format", "json"],
            expect.objectContaining({ encoding: "utf8" }),
            expect.any(Function)
        );
        expect(result).toEqual({ stdout: "ok", stderr: "" });
    });

    it("invokes python -m conans.conan when mode is python", async () => {
        await runConan(
            ["search", "*", "--json", "/tmp/out.json"],
            ConanExecutionMode.python,
            "/venv/bin/python",
            "conan"
        );

        expect(execFileSpy).toHaveBeenCalledWith(
            "/venv/bin/python",
            ["-m", "conans.conan", "search", "*", "--json", "/tmp/out.json"],
            expect.objectContaining({ encoding: "utf8" }),
            expect.any(Function)
        );
    });

    it("forwards cwd and env to execFile", async () => {
        const env = { ...process.env, foo: "bar" };

        await runConan(
            ["cache", "path", "zlib/1.2.13"],
            ConanExecutionMode.conan,
            "py",
            "conan",
            { cwd: "/ws", env, maxBuffer: 1024 }
        );

        expect(execFileSpy).toHaveBeenCalledWith(
            "conan",
            ["cache", "path", "zlib/1.2.13"],
            expect.objectContaining({
                cwd: "/ws",
                env: expect.objectContaining({ foo: "bar" }),
                maxBuffer: 1024,
                encoding: "utf8",
            }),
            expect.any(Function)
        );
    });

    it("propagates execFile error (non-zero exit)", async () => {
        execFileSpy.mockImplementation(((...allArgs: unknown[]) => {
            const callback = findExecFileCallback(allArgs);
            const err = Object.assign(new Error("Command failed"), { code: 1 });
            if (callback) {
                process.nextTick(() => callback(err));
            }
            return {} as childProcess.ChildProcess;
        }) as typeof childProcess.execFile);

        await expect(
            runConan(["bad"], ConanExecutionMode.conan, "py", "conan")
        ).rejects.toMatchObject({ code: 1 });
    });

    it("wraps ENOENT with a VSConan hint", async () => {
        execFileSpy.mockImplementation(((...allArgs: unknown[]) => {
            const callback = findExecFileCallback(allArgs);
            const err = Object.assign(new Error("spawn /x ENOENT"), { code: "ENOENT" as const });
            if (callback) {
                process.nextTick(() => callback(err));
            }
            return {} as childProcess.ChildProcess;
        }) as typeof childProcess.execFile);

        await expect(
            runConan(["config", "home"], ConanExecutionMode.python, "/missing/python", "conan")
        ).rejects.toThrow(/VSConan: Python interpreter not found/);
    });
});
