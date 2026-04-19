
import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { conan } from "../../src/utils/utils";

/** Mutable cwd for vscode mock (read at runtime when readEnvFromConan runs). */
const readEnvWorkspacePathHolder = { path: "" };

jest.mock("vscode", () => ({
    workspace: {
        get workspaceFolders() {
            return [{ uri: { fsPath: readEnvWorkspacePathHolder.path } }];
        },
    },
    window: {
        showErrorMessage: jest.fn(),
    },
}), { virtual: true });

function conanAvailable(): boolean {
    try {
        execSync("conan --version", { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

const describeReadEnv = conanAvailable() ? describe : describe.skip;

describeReadEnv("readEnvFromConan", () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vsconan-readenv-"));
        readEnvWorkspacePathHolder.path = tempDir;
        execSync("conan new basic --force", { cwd: tempDir, stdio: "inherit" });
    });

    afterEach(() => {
        readEnvWorkspacePathHolder.path = "";
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it("should return the env including PATH", async () => {
        const env = await conan.readEnvFromConan(conan.ConanEnv.buildEnv, "python", ["conanfile.py"]);
        expect(env).toBeInstanceOf(Array);
        expect(env.some((pair) => pair[0] === "PATH")).toBe(true);
    });

    it("should contain custom settings", async () => {
        const conanfilePath = path.join(tempDir, "conanfile.py");
        fs.appendFileSync(
            conanfilePath,
            "    def configure(self):\n" +
                '        self.buildenv.define("FOO", "BAR")\n' +
                '        self.runenv.define("BAR", "BAZ")\n'
        );

        const buildenv = await conan.readEnvFromConan(conan.ConanEnv.buildEnv, "python", ["conanfile.py"]);
        expect(buildenv.find((p) => p[0] === "FOO")).toEqual(["FOO", "BAR"]);

        const runenv = await conan.readEnvFromConan(conan.ConanEnv.runEnv, "python", ["conanfile.py"]);
        expect(runenv.find((p) => p[0] === "BAR")).toEqual(["BAR", "BAZ"]);
    });
});
