
export class ConanProfileConfiguration {
    conanVersion: string = "";
    conanPythonInterpreter: string = "";
    conanExecutable: string = "";
    conanExecutionMode: string = "";
    conanUserHome: string | null | undefined = undefined;

    public isValid(): boolean {
        let valid: boolean = false;

        if ((this.conanVersion === "1" || this.conanVersion === "2") &&
            (this.conanExecutionMode === "conanExecutable" || this.conanExecutionMode === "pythonInterpreter")) {
            valid = true;
        }

        return valid;
    }

    /**
     * Normalizes profile path fields after loading from settings.
     * Paths must stay raw (no JSON/string shell quoting): Conan runs via execFile(argv), not a shell.
     * Shell-based commands (workspace output channel) quote paths where needed.
     */
    public escapeWhitespace(): void {
        this.conanPythonInterpreter = normalizeProfilePath(this.conanPythonInterpreter);
        this.conanExecutable = normalizeProfilePath(this.conanExecutable);
        this.conanUserHome = this.conanUserHome
            ? normalizeProfilePath(this.conanUserHome)
            : this.conanUserHome;
    }
}

/** Undo legacy JSON.stringify wrapping and trim (older VSConan quoted paths for execSync + shell). */
function normalizeProfilePath(value: string): string {
    const t = value.trim();
    if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) {
        try {
            const parsed = JSON.parse(t) as unknown;
            if (typeof parsed === "string") {
                return parsed;
            }
        } catch {
            return t.slice(1, -1);
        }
    }
    return t;
}
