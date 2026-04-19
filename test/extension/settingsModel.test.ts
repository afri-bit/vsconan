import { ConanProfileConfiguration } from "../../src/extension/settings/model";

describe("ConanProfileConfiguration", () => {
    it("should be valid for Conan 1 with conanExecutable", () => {
        const p = new ConanProfileConfiguration();
        p.conanVersion = "1";
        p.conanExecutionMode = "conanExecutable";
        expect(p.isValid()).toBe(true);
    });

    it("should be valid for Conan 2 with pythonInterpreter", () => {
        const p = new ConanProfileConfiguration();
        p.conanVersion = "2";
        p.conanExecutionMode = "pythonInterpreter";
        expect(p.isValid()).toBe(true);
    });

    it("should be invalid for unsupported conan version", () => {
        const p = new ConanProfileConfiguration();
        p.conanVersion = "3";
        p.conanExecutionMode = "conanExecutable";
        expect(p.isValid()).toBe(false);
    });

    it("should be invalid for unsupported execution mode", () => {
        const p = new ConanProfileConfiguration();
        p.conanVersion = "2";
        p.conanExecutionMode = "pip";
        expect(p.isValid()).toBe(false);
    });

    it("should be invalid when version is empty", () => {
        const p = new ConanProfileConfiguration();
        p.conanExecutionMode = "conanExecutable";
        expect(p.isValid()).toBe(false);
    });

    it("should JSON-encode path fields in escapeWhitespace", () => {
        const p = new ConanProfileConfiguration();
        p.conanPythonInterpreter = "/opt/my python/bin/python3";
        p.conanExecutable = "/usr/local/bin/conan";
        p.conanUserHome = "/home/user/.conan2";

        p.escapeWhitespace();

        expect(p.conanPythonInterpreter).toBe(JSON.stringify("/opt/my python/bin/python3"));
        expect(p.conanExecutable).toBe(JSON.stringify("/usr/local/bin/conan"));
        expect(p.conanUserHome).toBe(JSON.stringify("/home/user/.conan2"));
    });
});
