import { CommandBuilderConan1 } from "../conan/commandBuilder";
import { CommandBuilderConan2 } from "../conan2/commandBuilder";
import { CommandBuilder } from "./commandBuilder";

export class CommandBuilderFactory {

    public static getCommandBuilder(conanVersion: string): CommandBuilder | undefined {
        if (conanVersion == "1") {
            return new CommandBuilderConan1();
        }
        else if (conanVersion == "2") {
            return new CommandBuilderConan2();
        }
        else {
            return undefined;
        }
    }
}