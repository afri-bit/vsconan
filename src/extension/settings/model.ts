
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
}
