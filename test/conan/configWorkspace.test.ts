import { commandContainerSchema } from "../../src/conans/command/configCommand";
import { configWorkspaceSchema } from "../../src/conans/workspace/configWorkspace";

describe("configWorkspaceSchema", () => {
    it("should parse valid workspace with empty command container", () => {
        const container = commandContainerSchema.parse({});
        const workspace = configWorkspaceSchema.parse({ commandContainer: container });

        expect(workspace.commandContainer).toEqual(container);
    });

    it("should reject unknown top-level keys (strict)", () => {
        const valid = configWorkspaceSchema.parse({
            commandContainer: commandContainerSchema.parse({}),
        });

        expect(() =>
            configWorkspaceSchema.parse(
                Object.assign({}, valid, { notAllowed: "x" })
            )
        ).toThrow();
    });
});
