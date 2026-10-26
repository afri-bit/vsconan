import { ConfigWorkspace } from "../../src/conans/workspace/configWorkspace";
import { CommandContainer } from "../../src/conans/command/configCommand";

describe("Workspace configuration", () => {
    it("should default to an empty command container and no presets", () => {
        const configWorkspace = new ConfigWorkspace();

        expect(configWorkspace.commandContainer).toEqual(new CommandContainer());
        expect(configWorkspace.presetContainer).toBeUndefined();
    });

    it("should use shared arguments unless a command-specific override is defined", () => {
        const configWorkspace = ConfigWorkspace.fromJson(JSON.stringify({
            commandContainer: {
                create: [],
                install: [],
                build: [],
                source: [],
                pkg: [],
                pkgExport: []
            },
            presetContainer: {
                "linuxRelease": {
                    description: "Linux release workflow",
                    conanRecipe: "recipes/conanfile.py",
                    args: ["-s", "build_type=Release"],
                    buildArgs: ["--build=missing"],
                    installArgs: ["--output-folder=build"]
                }
            }
        }));

        expect(configWorkspace.commandContainer.create).toHaveLength(1);
        expect(configWorkspace.commandContainer.create[0].name).toBe("linuxRelease");
        expect(configWorkspace.commandContainer.create[0].conanRecipe).toBe("recipes/conanfile.py");
        expect(configWorkspace.commandContainer.create[0].args).toEqual(["-s", "build_type=Release"]);
        expect(configWorkspace.commandContainer.install[0].args).toEqual(["--output-folder=build"]);
        expect(configWorkspace.commandContainer.build[0].args).toEqual(["--build=missing"]);
    });

    it("should retain the legacy command array format", () => {
        const configWorkspace = ConfigWorkspace.fromJson(JSON.stringify({
            commandContainer: {
                create: [{ name: "create", args: [] }],
                install: [],
                build: [],
                source: [],
                pkg: [],
                pkgExport: []
            }
        }));

        expect(configWorkspace.commandContainer.create[0].name).toBe("create");
    });

    it("should retain legacy commands when expanding presets", () => {
        const configWorkspace = ConfigWorkspace.fromJson(JSON.stringify({
            commandContainer: {
                create: [{ name: "legacy-create", args: [] }],
                install: [],
                build: [],
                source: [],
                pkg: [],
                pkgExport: []
            },
            presetContainer: {
                preset: { args: [] }
            }
        }));

        expect(configWorkspace.commandContainer.create.map(command => command.name)).toEqual(["legacy-create", "preset"]);
    });

    it("should default each command list to an empty array when the commandContainer omits it", () => {
        const configWorkspace = ConfigWorkspace.fromJson(JSON.stringify({
            commandContainer: {},
            presetContainer: {
                preset: { args: [] }
            }
        }));

        expect(configWorkspace.commandContainer.create.map(command => command.name)).toEqual(["preset"]);
        expect(configWorkspace.commandContainer.install).toHaveLength(1);
        expect(configWorkspace.commandContainer.build).toHaveLength(1);
        expect(configWorkspace.commandContainer.source).toHaveLength(1);
        expect(configWorkspace.commandContainer.pkg).toHaveLength(1);
        expect(configWorkspace.commandContainer.pkgExport).toHaveLength(1);
    });

    it("should default to an empty args list when a preset omits shared arguments", () => {
        const configWorkspace = ConfigWorkspace.fromJson(JSON.stringify({
            commandContainer: {
                create: [], install: [], build: [], source: [], pkg: [], pkgExport: []
            },
            presetContainer: {
                preset: {}
            }
        }));

        expect(configWorkspace.commandContainer.create[0].args).toEqual([]);
        expect(configWorkspace.commandContainer.install[0].args).toEqual([]);
    });

    it("should default to an empty command container when expanding presets without an existing commandContainer", () => {
        const configWorkspace = ConfigWorkspace.fromJson(JSON.stringify({
            presetContainer: {
                preset: { args: [] }
            }
        }));

        expect(configWorkspace.commandContainer.create.map(command => command.name)).toEqual(["preset"]);
        expect(configWorkspace.commandContainer.install).toHaveLength(1);
        expect(configWorkspace.commandContainer.build).toHaveLength(1);
        expect(configWorkspace.commandContainer.source).toHaveLength(1);
        expect(configWorkspace.commandContainer.pkg).toHaveLength(1);
        expect(configWorkspace.commandContainer.pkgExport).toHaveLength(1);
    });

    it("should parse preset configurations with trailing commas", () => {
        const configWorkspace = ConfigWorkspace.fromJson(`{
            "presetContainer": {
                "desktop-debug": {
                    "args": ["-pr:h", "x64-linux"],
                }
            }
        }`);

        expect(configWorkspace.commandContainer.install[0].name).toBe("desktop-debug");
        expect(configWorkspace.commandContainer.install[0].args).toEqual(["-pr:h", "x64-linux"]);
    });
});
