import { z } from 'zod';

const configCommandSchema = z.object({
    name: z.string().default(""),
    description: z.string().default(""),
    detail: z.string().default(""),
    conanRecipe: z.string().default("conanfile.py")
});

const configCommandCreateSchema = configCommandSchema.extend({
    name: z.string().default("create"),
    description: z.string().default("Create command"),
    detail: z.string().default("Create command detail"),
    profile: z.string().default("default"),
    user: z.string().default(""),
    channel: z.string().default(""),
    args: z.array(z.string()).default([])
});

const configCommandInstallSchema = configCommandSchema.extend({
    name: z.string().default("install"),
    description: z.string().default("Install command"),
    detail: z.string().default("Install command detail"),
    installFolder: z.string().default("install"),
    profile: z.string().default("default"),
    user: z.string().default(""),
    channel: z.string().default(""),
    args: z.array(z.string()).default([])
});

const configCommandBuildSchema = configCommandSchema.extend({
    name: z.string().default("build"),
    description: z.string().default("Build command"),
    detail: z.string().default("Build command detail"),
    installFolder: z.string().default("install"),
    buildFolder: z.string().default("build"),
    packageFolder: z.string().default("package"),
    sourceFolder: z.string().default("source"),
    args: z.array(z.string()).default([])
});

const configCommandSourceSchema = configCommandSchema.extend({
    name: z.string().default("source"),
    description: z.string().default("Source command"),
    detail: z.string().default("Source command detail"),
    installFolder: z.string().default("install"),
    sourceFolder: z.string().default("source"),
    version: z.string().default(""),
    user: z.string().default(""),
    channel: z.string().default(""),
    args: z.array(z.string()).default([])
});

const configCommandPackageSchema = configCommandSchema.extend({
    name: z.string().default("pkg"),
    description: z.string().default("Package command"),
    detail: z.string().default("Package command detail"),
    installFolder: z.string().default("install"),
    buildFolder: z.string().default("build"),
    packageFolder: z.string().default("package"),
    sourceFolder: z.string().default("source")
});

const configCommandPackageExportSchema = configCommandSchema.extend({
    name: z.string().default("pkg_export"),
    description: z.string().default("Package export command"),
    detail: z.string().default("Package export command detail"),
    installFolder: z.string().default("install"),
    buildFolder: z.string().default("build"),
    packageFolder: z.string().default("package"),
    sourceFolder: z.string().default("source"),
    user: z.string().default(""),
    channel: z.string().default(""),
    args: z.array(z.string()).default([])
});

const commandContainerSchema = z.object({
    create: z.array(configCommandCreateSchema).default([]),
    install: z.array(configCommandInstallSchema).default([]),
    build: z.array(configCommandBuildSchema).default([]),
    source: z.array(configCommandSourceSchema).default([]),
    pkg: z.array(configCommandPackageSchema).default([]),
    pkgExport: z.array(configCommandPackageExportSchema).default([])
});

type ConfigCommand = z.infer<typeof configCommandSchema>;
type ConfigCommandCreate = z.infer<typeof configCommandCreateSchema>;
type ConfigCommandInstall = z.infer<typeof configCommandInstallSchema>;
type ConfigCommandBuild = z.infer<typeof configCommandBuildSchema>;
type ConfigCommandSource = z.infer<typeof configCommandSourceSchema>;
type ConfigCommandPackage = z.infer<typeof configCommandPackageSchema>;
type ConfigCommandPackageExport = z.infer<typeof configCommandPackageExportSchema>;
type CommandContainer = z.infer<typeof commandContainerSchema>;

export {
    configCommandSchema,
    configCommandCreateSchema,
    configCommandInstallSchema,
    configCommandBuildSchema,
    configCommandSourceSchema,
    configCommandPackageSchema,
    configCommandPackageExportSchema,
    commandContainerSchema,
    ConfigCommand,
    ConfigCommandCreate,
    ConfigCommandInstall,
    ConfigCommandBuild,
    ConfigCommandSource,
    ConfigCommandPackage,
    ConfigCommandPackageExport,
    CommandContainer
};