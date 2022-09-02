import "mocha";

import { assert } from "chai";

describe("Dummy test", () => {
    context("Some dummy test", () => {
        it("must pass", () => {
            let a: number = 5 / 2;
            assert.approximately(a, 2.5, 0.01);
        });
    });
});