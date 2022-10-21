import { assert } from "chai";
import sinon from 'ts-sinon';
import { vsconan } from "../../src/utils/utils";

import * as os from "os";
import * as path from "path";

suite("Utility Tests", ()=>{
    test("vsconan utils", () =>{
        assert.equal("a", "a");

        var stub = sinon.stub(os, 'homedir').callsFake(()=>{return path.normalize("/home/user")});
        let abc = vsconan.getVSConanHomeDir();
        assert.equal(abc, path.normalize("/home/user/.vsconan"));
        stub.reset();
    })
})