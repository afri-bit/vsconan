
import { execSync } from "child_process";
import {
    conan
} from "../../src/utils/utils";
import path = require("path");
import fs = require('fs');


jest.mock('vscode', () => ({
    workspace: {
        workspaceFolders: [{ uri: { fsPath: __dirname } }],
    }
}), { virtual: true });


describe("readEnvFromConan ", () => {
    it("should return the env including PATH", async () => {
        execSync(`cd ${__dirname} && conan new basic --force`);
        let env = await conan.readEnvFromConan(conan.ConanEnv.buildEnv, "python", ["conanfile.py"]);
        expect(env).toBeInstanceOf(Array);
        expect(env[0]).toContain("PATH");
    });

    it("should contain custom settings", async () => {
        execSync(`cd ${__dirname} && conan new basic --force`);
        fs.appendFileSync(path.join(__dirname, "conanfile.py"),
            '    def configure(self):\n' +
            '        self.buildenv.define("FOO", "BAR")\n' +
            '        self.runenv.define("BAR", "BAZ")\n');
        const buildenv = await conan.readEnvFromConan(conan.ConanEnv.buildEnv, "python", ["conanfile.py"]);
        expect(buildenv[0]).toStrictEqual(["FOO", "BAR"]);
        const runenv = await conan.readEnvFromConan(conan.ConanEnv.runEnv, "python", ["conanfile.py"]);
        expect(runenv[0]).toStrictEqual(["BAR", "BAZ"]);
    });
});
