import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

import * as sinon from "ts-sinon";

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));

	});

	test("Mocked Object", ()=>{
		class Test {
			method() { return "original" }
		}
		
		const test = new Test();
		const testStub = sinon.stubObject<Test>(test, { method: "original" });

		assert.equal(testStub.method(), test.method());
	})
});
