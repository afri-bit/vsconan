import { commandContainerSchema } from "../command/configCommand";

import { z } from 'zod';

/**
 * Parent schema for workspace configuration
 */
const configWorkspaceSchema = z.object({
    commandContainer: commandContainerSchema,
}).strict();

type ConfigWorkspace = z.infer<typeof configWorkspaceSchema>;

export { 
    configWorkspaceSchema,
    ConfigWorkspace
};

