// zod-schemas.ts
import { z, ZodRawShape } from 'zod';

// --- Reusable Helper ---
export function createDualSchema<T extends ZodRawShape>(rawShape: T, defaults: Partial<Record<keyof T, any>> = {}) {
    const strictSchema = z.object(rawShape).strict();

    const shapeWithDefaults: ZodRawShape = { ...rawShape };

    for (const key in defaults) {
        if (shapeWithDefaults[key]) {
            shapeWithDefaults[key] = shapeWithDefaults[key].default(defaults[key]);
        }
    }

    const defaultSchema = z.object(shapeWithDefaults).strict();

    return {
        strictSchema,
        defaultSchema
    };
}

// --- Base Task Schema ---
const taskBaseShape = {
    name: z.string(),
    description: z.string(),
    command: z.string(),
    args: z.array(z.string()).optional(),
    continueOnError: z.boolean(),
    context: z.string().optional(),
    env: z.record(z.string()).optional()
};

const taskDefaults = {
    description: "",
    args: [],
    continueOnError: false
};

export const { strictSchema: taskSchema, defaultSchema: defaultTaskSchema } = createDualSchema(taskBaseShape, taskDefaults);

export const withTaskSchema = z.object({
    preTask: z.array(taskSchema).default([]),
    postTask: z.array(taskSchema).default([])
}).strict();

// --- Base Command Schema ---
const commandBaseShape = {
    name: z.string(),
    description: z.string().optional(),
    detail: z.string().optional(),
    conanRecipe: z.string()
};

const commandDefaults = {
    name: "",
    description: "",
    detail: "",
    conanRecipe: "conanfile.py"
};

export const { strictSchema: configCommandSchema, defaultSchema: configCommandSchemaDefault } = createDualSchema(commandBaseShape, commandDefaults);

// --- Command Variants ---
function createCommandVariant(base: typeof configCommandSchema, extraShape: ZodRawShape, defaults: Record<string, any>) {
    return createDualSchema(
        base.extend({ ...extraShape, ...withTaskSchema.shape }).shape,
        defaults
    );
}

export const { strictSchema: configCommandCreateSchema, defaultSchema: configCommandCreateSchemaDefault } = createCommandVariant(
    configCommandSchema,
    {
        profile: z.string(),
        user: z.string(),
        channel: z.string(),
        args: z.array(z.string())
    },
    {
        name: "create",
        description: "Create command",
        detail: "Create command detail",
        conanRecipe: "conanfile.py",
        profile: "default",
        user: "",
        channel: "",
        args: [],
        preTask: [],
        postTask: []
    }
);

export const { strictSchema: configCommandInstallSchema, defaultSchema: configCommandInstallSchemaDefault } = createCommandVariant(
    configCommandSchema,
    {
        installFolder: z.string(),
        profile: z.string(),
        user: z.string(),
        channel: z.string(),
        args: z.array(z.string())
    },
    {
        name: "install",
        description: "Install command",
        detail: "Install command detail",
        conanRecipe: "conanfile.py",
        installFolder: "install",
        profile: "default",
        user: "",
        channel: "",
        args: [],
        preTask: [],
        postTask: []
    }
);

export const { strictSchema: configCommandBuildSchema, defaultSchema: configCommandBuildSchemaDefault } = createCommandVariant(
    configCommandSchema,
    {
        installFolder: z.string(),
        buildFolder: z.string(),
        packageFolder: z.string(),
        sourceFolder: z.string(),
        args: z.array(z.string())
    },
    {
        name: "build",
        description: "Build command",
        detail: "Build command detail",
        conanRecipe: "conanfile.py",
        installFolder: "install",
        buildFolder: "build",
        packageFolder: "package",
        sourceFolder: "source",
        args: [],
        preTask: [],
        postTask: []
    }
);

export const { strictSchema: configCommandSourceSchema, defaultSchema: configCommandSourceSchemaDefault } = createCommandVariant(
    configCommandSchema,
    {
        installFolder: z.string(),
        sourceFolder: z.string(),
        version: z.string(),
        user: z.string(),
        channel: z.string(),
        args: z.array(z.string())
    },
    {
        name: "source",
        description: "Source command",
        detail: "Source command detail",
        conanRecipe: "conanfile.py",
        installFolder: "install",
        sourceFolder: "source",
        version: "",
        user: "",
        channel: "",
        args: [],
        preTask: [],
        postTask: []
    }
);

export const { strictSchema: configCommandPackageSchema, defaultSchema: configCommandPackageSchemaDefault } = createCommandVariant(
    configCommandSchema,
    {
        installFolder: z.string(),
        buildFolder: z.string(),
        packageFolder: z.string(),
        sourceFolder: z.string()
    },
    {
        name: "pkg",
        description: "Package command",
        detail: "Package command detail",
        conanRecipe: "conanfile.py",
        installFolder: "install",
        buildFolder: "build",
        packageFolder: "package",
        sourceFolder: "source",
        preTask: [],
        postTask: []
    }
);

export const { strictSchema: configCommandPackageExportSchema, defaultSchema: configCommandPackageExportSchemaDefault } = createCommandVariant(
    configCommandSchema,
    {
        installFolder: z.string(),
        buildFolder: z.string(),
        packageFolder: z.string(),
        sourceFolder: z.string(),
        user: z.string(),
        channel: z.string(),
        args: z.array(z.string())
    },
    {
        name: "pkg_export",
        description: "Package export command",
        detail: "Package export command detail",
        conanRecipe: "conanfile.py",
        installFolder: "install",
        buildFolder: "build",
        packageFolder: "package",
        sourceFolder: "source",
        user: "",
        channel: "",
        args: [],
        preTask: [],
        postTask: []
    }
);

export const commandContainerSchema = z.object({
    create: z.array(configCommandCreateSchema).optional(),
    install: z.array(configCommandInstallSchema).optional(),
    build: z.array(configCommandBuildSchema).optional(),
    source: z.array(configCommandSourceSchema).optional(),
    pkg: z.array(configCommandPackageSchema).optional(),
    pkgExport: z.array(configCommandPackageExportSchema).optional()
}).strict();

export const commandContainerSchemaDefault = z.object({
    create: z.array(configCommandCreateSchemaDefault).default([]),
    install: z.array(configCommandInstallSchemaDefault).default([]),
    build: z.array(configCommandBuildSchemaDefault).default([]),
    source: z.array(configCommandSourceSchemaDefault).default([]),
    pkg: z.array(configCommandPackageSchemaDefault).default([]),
    pkgExport: z.array(configCommandPackageExportSchemaDefault).default([])
}).strict();

// --- Types ---
export type ConfigCommand = z.infer<typeof configCommandSchemaDefault>;
export type ConfigCommandCreate = z.infer<typeof configCommandCreateSchemaDefault>;
export type ConfigCommandInstall = z.infer<typeof configCommandInstallSchemaDefault>;
export type ConfigCommandBuild = z.infer<typeof configCommandBuildSchemaDefault>;
export type ConfigCommandSource = z.infer<typeof configCommandSourceSchemaDefault>;
export type ConfigCommandPackage = z.infer<typeof configCommandPackageSchemaDefault>;
export type ConfigCommandPackageExport = z.infer<typeof configCommandPackageExportSchemaDefault>;
export type CommandContainer = z.infer<typeof commandContainerSchemaDefault>;
export type Task = z.infer<typeof taskSchema>;
