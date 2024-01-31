import { Conan1API } from "../conan/api/conanAPI";
import { Conan2API } from "../conan2/api/conanAPI";
import { ConanAPI, ConanExecutionMode } from "./base/conanAPI";

export class ConanAPIManager {
    private _conanVersion: string = "1";
    private _conanApi: ConanAPI = {} as ConanAPI;

    public constructor(conanVersion: string = "1",
        pythonInterpreter: string = "python",
        conanExecutable: string = "conan",
        conanExecutionMode: ConanExecutionMode = ConanExecutionMode.python) {
        this.setApiInstance(conanVersion, pythonInterpreter, conanExecutable, conanExecutionMode);
    }

    public setApiInstance(conanVersion: string, pythonInterpreter: string, conanExecutable: string, conanExecutionMode: ConanExecutionMode) {
        if (conanVersion == "1") {
            this._conanApi = new Conan1API(pythonInterpreter, conanExecutable, conanExecutionMode);
        }
        else if (conanVersion == "2") {
            this._conanApi = new Conan2API(pythonInterpreter, conanExecutable, conanExecutionMode);
        }
        else {
            this._conanApi = {} as ConanAPI;
        }
    }

    public get conanVersion(): string {
        return this._conanVersion
    }

    public get conanApi(): ConanAPI {
        return this._conanApi;
    }

    public switchExecutionMode(mode: ConanExecutionMode): void {
        this.conanApi?.switchExecutionMode(mode);
    }

    public setPythonInterpreter(pythonInterpreter: string): void {
        this.conanApi?.setPythonInterpreter(pythonInterpreter);
    }

    public switchToPythonMode(pythonInterpreter: string): void {
        this.conanApi?.switchToPythonMode(pythonInterpreter);
    }

    public setConanExecutable(conanExecutable: string): void {
        this.conanApi?.setConanExecutable(conanExecutable);
    }

    public switchToConanExecutableMode(conanExecutable: string): void {
        this.conanApi?.switchToConanExecutableMode(conanExecutable);
    }
}