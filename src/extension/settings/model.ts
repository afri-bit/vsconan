
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
     * Public function of the model to escaping the whitespace inside that path string.
     */
    public escapeWhitespace(): void {
        if (this.conanPythonInterpreter) {
            this.conanPythonInterpreter = this.conanPythonInterpreter.replace(/ /g, "\\ ");
        }

        if (this.conanExecutable) {
            this.conanExecutable = this.conanExecutable.replace(/ /g, "\\ ");
        }

        if (this.conanUserHome) {
            this.conanUserHome = this.conanUserHome.replace(/ /g, "\\ ");
        }
    }
}
