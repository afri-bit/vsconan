
export class Config {
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

export class ConfigCommandCreate extends Config {
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

        super(name, description, detail)
        this.profile = profile;
        this.user = user;
        this.channel = channel;
        this.args = args;
    }
}

export class ConfigCommandInstall extends Config {
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

export class ConfigCommandBuild extends Config {
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

export class ConfigCommandSource extends Config {
    public installFolder: string;
    public sourceFolder: string;

    constructor(name: string = "source",
        description: string = "Source command",
        detail: string = "Source command detail",
        installFolder: string = "install",
        sourceFolder: string = "source") {
        super(name, description, detail);
        this.installFolder = installFolder;
        this.sourceFolder = sourceFolder;
    }
}

export class ConfigCommandPackage extends Config {
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

export class ConfigCommandPackageExport extends Config {
    public installFolder: string;
    public buildFolder: string;
    public packageFolder: string;
    public sourceFolder: string;
    public args: Array<string>;

    constructor(name: string = "pkg_export",
        description: string = "Package export command",
        detail: string = "Package export command detail",
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

export class ConfigCommand {
    public create: Array<ConfigCommandCreate>;
    public install: Array<ConfigCommandInstall>;
    public build: Array<ConfigCommandBuild>;
    public source: Array<ConfigCommandSource>;
    public pkg: Array<ConfigCommandPackage>;
    public pkg_export: Array<ConfigCommandPackageExport>;

    constructor(create: Array<ConfigCommandCreate> = [], 
        install: Array<ConfigCommandInstall> = [],
        build: Array<ConfigCommandBuild> = [], 
        source: Array<ConfigCommandSource> = [],
        pkg: Array<ConfigCommandPackage> = [],
        pkg_export: Array<ConfigCommandPackageExport> = []) {

        this.create = create;
        this.install = install;
        this.build = build;
        this.source = source;
        this.pkg = pkg;
        this.pkg_export = pkg_export;
    }
}


