
export class ConfigCommand {
    public name: string;
    public description: string;
    public detail: string;
    public conanRecipe: string;

    constructor(name: string = "", description: string = "", detail: string = "", conanRecipe = "conanfile.py") {
        this.name = name;
        this.description = description;
        this.detail = detail;
        this.conanRecipe = conanRecipe;
    }
}

export class ConfigCommandCreate extends ConfigCommand {
    public profile: string;
    public user: string;
    public channel: string;
    public args: Array<string>;

    constructor(name: string = "create",
        description: string = "Create command",
        detail: string = "Create command detail",
        profile: string = "default",
        user: string = "",
        channel: string = "",
        args: Array<string> = []) {

        super(name, description, detail);
        this.profile = profile;
        this.user = user;
        this.channel = channel;
        this.args = args;
    }
}

export class ConfigCommandInstall extends ConfigCommand {
    public installFolder: string;
    public profile: string;
    public user: string;
    public channel: string;
    public args: Array<string>;

    constructor(name: string = "install",
        description: string = "Install command",
        detail: string = "Install command detail",
        installFolder: string = "install",
        profile: string = "default",
        user: string = "",
        channel: string = "",
        args: Array<string> = []) {
        super(name, description, detail);
        this.installFolder = installFolder;
        this.profile = profile;
        this.user = user;
        this.channel = channel;
        this.args = args;
    }
}

export class ConfigCommandBuild extends ConfigCommand {
    public installFolder: string;
    public buildFolder: string;
    public packageFolder: string;
    public sourceFolder: string;
    public args: Array<string>;

    constructor(name: string = "build",
        description: string = "Build command",
        detail: string = "Build command detail",
        installFolder: string = "install",
        buildFolder: string = "build",
        packageFolder: string = "package",
        sourceFolder: string = "source",
        args: Array<string> = []) {
        super(name, description, detail);
        this.installFolder = installFolder;
        this.buildFolder = buildFolder;
        this.packageFolder = packageFolder;
        this.sourceFolder = sourceFolder;
        this.args = args;
    }
}

export class ConfigCommandSource extends ConfigCommand {
    public installFolder: string;
    public sourceFolder: string;
    public version: string;
    public user: string;
    public channel: string;
    public args: Array<string>;

    constructor(name: string = "source",
        description: string = "Source command",
        detail: string = "Source command detail",
        installFolder: string = "install",
        sourceFolder: string = "source",
        version: string = "",
        user: string = "",
        channel: string = "",
        args: Array<string> = []) {
        super(name, description, detail);
        this.installFolder = installFolder;
        this.sourceFolder = sourceFolder;
        this.version = version;
        this.user = user;
        this.channel = channel;
        this.args = args;
    }
}

export class ConfigCommandPackage extends ConfigCommand {
    public installFolder: string;
    public buildFolder: string;
    public packageFolder: string;
    public sourceFolder: string;

    constructor(name: string = "pkg",
        description: string = "Package command",
        detail: string = "Package command detail",
        installFolder: string = "install",
        buildFolder: string = "build",
        packageFolder: string = "package",
        sourceFolder: string = "source") {
        super(name, description, detail);
        this.installFolder = installFolder;
        this.buildFolder = buildFolder;
        this.packageFolder = packageFolder;
        this.sourceFolder = sourceFolder;
    }
}

export class ConfigCommandPackageExport extends ConfigCommand {
    public installFolder: string;
    public buildFolder: string;
    public packageFolder: string;
    public sourceFolder: string;
    public user: string;
    public channel: string;
    public args: Array<string>;

    constructor(name: string = "pkg_export",
        description: string = "Package export command",
        detail: string = "Package export command detail",
        installFolder: string = "install",
        buildFolder: string = "build",
        packageFolder: string = "package",
        sourceFolder: string = "source",
        user: string = "",
        channel: string = "",
        args: Array<string> = []) {
        super(name, description, detail);
        this.installFolder = installFolder;
        this.buildFolder = buildFolder;
        this.packageFolder = packageFolder;
        this.sourceFolder = sourceFolder;
        this.user = user;
        this.channel = channel;
        this.args = args;
    }
}

export class CommandContainer {
    public create: Array<ConfigCommandCreate>;
    public install: Array<ConfigCommandInstall>;
    public build: Array<ConfigCommandBuild>;
    public source: Array<ConfigCommandSource>;
    public pkg: Array<ConfigCommandPackage>;
    public pkgExport: Array<ConfigCommandPackageExport>;

    constructor(create: Array<ConfigCommandCreate> = [],
        install: Array<ConfigCommandInstall> = [],
        build: Array<ConfigCommandBuild> = [],
        source: Array<ConfigCommandSource> = [],
        pkg: Array<ConfigCommandPackage> = [],
        pkgExport: Array<ConfigCommandPackageExport> = []) {

        this.create = create;
        this.install = install;
        this.build = build;
        this.source = source;
        this.pkg = pkg;
        this.pkgExport = pkgExport;
    }
}