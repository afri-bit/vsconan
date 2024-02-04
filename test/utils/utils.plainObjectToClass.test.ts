import { assert } from "chai";
import { ConanProfileConfiguration } from "../../src/extension/settings/model";
import { general } from "../../src/utils/utils";


suite("Plain Object to Class", () => {
    test("Convert plain object to class", () => {
        let plainObject: object = {
            "conanPythonInterpreter": "python",
            "conanExecutable": "conan",
            "conanExecutionMode": "conanExecutable",
            "conanVersion": "2",
        }

        let profile: ConanProfileConfiguration = general.plainObjectToClass(ConanProfileConfiguration, plainObject);

        assert.equal(profile.conanExecutable, "conan");
        assert.equal(profile.conanVersion, "2");
        assert.equal(profile.conanExecutionMode, "conanExecutable");
        assert.equal(profile.conanPythonInterpreter, "python");
        assert.equal(profile.conanUserHome, undefined);

        assert.isTrue(profile.isValid());
    });

    test("Overpacked attributes from plain object", () => {
        let plainObject: object = {
            "conanPythonInterpreter": "python",
            "conanExecutable": "conan",
            "conanExecutionMode": "conanExecutable",
            "conanVersion": "2",
            "externalAttribute": "someValue",
            "unwantedAttribute": "123"
        }

        let profile: ConanProfileConfiguration = general.plainObjectToClass(ConanProfileConfiguration, plainObject);

        assert.equal(profile.conanExecutable, "conan");
        assert.equal(profile.conanVersion, "2");
        assert.equal(profile.conanExecutionMode, "conanExecutable");
        assert.equal(profile.conanPythonInterpreter, "python");
        assert.equal(profile.conanUserHome, undefined);
    });
})