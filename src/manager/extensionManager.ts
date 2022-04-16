import * as vscode from 'vscode';
import { Disposable } from "../utils/disposable";

export abstract class ExtensionManager extends Disposable {
    /**
	 * Register VS Code extension commands that are defined in the package.json
	 * @param command A unique identifier for the command.
	 * @param callback A command handler function.
	 */
	protected registerCommand(command: string, callback: (...args: any[]) => any) {
		this.registerDisposable(
			vscode.commands.registerCommand(command, (...args: any[]) => {
				callback(...args);
			})
		);
	} 
}
