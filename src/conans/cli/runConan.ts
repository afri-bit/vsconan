import * as childProcess from "child_process";
import { ConanExecutionMode } from "../api/base/conanAPI";

export interface RunConanExecOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    maxBuffer?: number;
}

const DEFAULT_MAX_BUFFER = 50 * 1024 * 1024;

function execFileAsync(
    file: string,
    args: readonly string[],
    options: childProcess.ExecFileOptionsWithStringEncoding
): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        childProcess.execFile(file, args, options, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

/**
 * Run Conan CLI without a shell. Uses `python -m conans.conan` or the conan executable per profile mode.
 */
export async function runConan(
    args: string[],
    executionMode: ConanExecutionMode,
    pythonInterpreter: string,
    conanExecutable: string,
    options?: RunConanExecOptions
): Promise<{ stdout: string; stderr: string }> {
    const execOpts: Parameters<typeof execFileAsync>[2] = {
        cwd: options?.cwd,
        env: options?.env ?? { ...process.env },
        maxBuffer: options?.maxBuffer ?? DEFAULT_MAX_BUFFER,
        encoding: "utf8",
    };

    try {
        if (executionMode === ConanExecutionMode.python) {
            return (await execFileAsync(pythonInterpreter, ["-m", "conans.conan", ...args], execOpts)) as {
                stdout: string;
                stderr: string;
            };
        }
        return (await execFileAsync(conanExecutable, args, execOpts)) as { stdout: string; stderr: string };
    } catch (err) {
        const e = err as NodeJS.ErrnoException;
        if (e?.code === "ENOENT") {
            const target = executionMode === ConanExecutionMode.python ? pythonInterpreter : conanExecutable;
            const role = executionMode === ConanExecutionMode.python ? "Python interpreter" : "Conan executable";
            throw new Error(
                `VSConan: ${role} not found: ${target}. Check Settings → VSConan → Conan profile. (${e.message})`
            );
        }
        throw err;
    }
}

export { newConanTempPath } from "./conanTempPaths";
