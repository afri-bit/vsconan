/**
 * Simple test to check data integrity
 */

import {
    commandContainerSchemaDefault,
    configCommandBuildSchemaDefault,
    configCommandCreateSchemaDefault,
    configCommandInstallSchemaDefault,
    configCommandPackageExportSchemaDefault,
    configCommandPackageSchemaDefault,
    configCommandSchemaDefault,
    configCommandSourceSchemaDefault
} from "../../src/conans/command/configCommand";

describe("Conan Config Command basic class ", () => {

    it("should return original value", () => {
        let cfgCommand = configCommandSchemaDefault.parse({});
        expect(cfgCommand.name).toBe("");
        expect(cfgCommand.description).toBe("");
        expect(cfgCommand.detail).toBe("");
        expect(cfgCommand.conanRecipe).toBe("conanfile.py");
    });

});

describe("Conan Create", () => {

    it("should return original value", () => {
        let cfg = configCommandCreateSchemaDefault.parse({});

        expect(cfg.name).toBe("create");
        expect(cfg.description).toBe("Create command");
        expect(cfg.detail).toBe("Create command detail");
        expect(cfg.profile).toBe("default");
        expect(cfg.user).toBe("");
        expect(cfg.channel).toBe("");
        expect(cfg.args.length).toBe(0);

    });

});

describe("Conan Install", () => {

    it("should return original value", () => {
        let cfg = configCommandInstallSchemaDefault.parse({});

        expect(cfg.name).toBe("install");
        expect(cfg.description).toBe("Install command");
        expect(cfg.detail).toBe("Install command detail");
        expect(cfg.installFolder).toBe("install");
        expect(cfg.profile).toBe("default");
        expect(cfg.user).toBe("");
        expect(cfg.channel).toBe("");
        expect(cfg.args.length).toBe(0);

    });

});

describe("Conan Build", () => {

    it("should return original value", () => {
        let cfg = configCommandBuildSchemaDefault.parse({});

        expect(cfg.name).toBe("build");
        expect(cfg.description).toBe("Build command");
        expect(cfg.detail).toBe("Build command detail");
        expect(cfg.installFolder).toBe("install");
        expect(cfg.buildFolder).toBe("build");
        expect(cfg.packageFolder).toBe("package");
        expect(cfg.sourceFolder).toBe("source");
        expect(cfg.args.length).toBe(0);

    });

});

describe("Conan Source", () => {

    it("should return original value", () => {
        let cfg = configCommandSourceSchemaDefault.parse({});

        expect(cfg.name).toBe("source");
        expect(cfg.description).toBe("Source command");
        expect(cfg.detail).toBe("Source command detail");
        expect(cfg.installFolder).toBe("install");
        expect(cfg.sourceFolder).toBe("source");
        expect(cfg.version).toBe("");
        expect(cfg.user).toBe("");
        expect(cfg.channel).toBe("");
        expect(cfg.args.length).toBe(0);

    });

});

describe("Conan Package", () => {

    it("should return original value", () => {
        let cfg = configCommandPackageSchemaDefault.parse({});

        expect(cfg.name).toBe("pkg");
        expect(cfg.description).toBe("Package command");
        expect(cfg.detail).toBe("Package command detail");
        expect(cfg.installFolder).toBe("install");
        expect(cfg.buildFolder).toBe("build");
        expect(cfg.packageFolder).toBe("package");
        expect(cfg.sourceFolder).toBe("source");
    });

});

describe("Conan Package Export", () => {

    it("should return original value", () => {
        let cfg = configCommandPackageExportSchemaDefault.parse({});

        expect(cfg.name).toBe("pkg_export");
        expect(cfg.description).toBe("Package export command");
        expect(cfg.detail).toBe("Package export command detail");
        expect(cfg.installFolder).toBe("install");
        expect(cfg.buildFolder).toBe("build");
        expect(cfg.packageFolder).toBe("package");
        expect(cfg.sourceFolder).toBe("source");
        expect(cfg.user).toBe("");
        expect(cfg.channel).toBe("");
        expect(cfg.args.length).toBe(0);
    });

});

describe("Conan Command Container", () => {

    it("should initialize with empty list", () => {
        let ctn = commandContainerSchemaDefault.parse({});

        expect(ctn.create?.length).toBe(0);
        expect(ctn.install?.length).toBe(0);
        expect(ctn.build?.length).toBe(0);
        expect(ctn.source?.length).toBe(0);
        expect(ctn.pkg?.length).toBe(0);
        expect(ctn.pkgExport?.length).toBe(0);

    });

    it("should have certain type of array", () => {
        let ctn = commandContainerSchemaDefault.parse({});

        expect(ctn.create?.length).toBe(0);
        expect(ctn.install?.length).toBe(0);
        expect(ctn.build?.length).toBe(0);
        expect(ctn.source?.length).toBe(0);
        expect(ctn.pkg?.length).toBe(0);
        expect(ctn.pkgExport?.length).toBe(0);
    });
});