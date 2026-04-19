import { randomUUID } from "crypto";
import * as os from "os";
import * as path from "path";
import * as constants from "../../utils/constants";

/**
 * Unique path under VSConan temp dir to avoid overlapping Conan 1 --json outputs when calls run concurrently.
 */
export function newConanTempPath(prefix: string, ext: string): string {
    const tempDir = path.join(os.homedir(), constants.VSCONAN_FOLDER, constants.TEMP_FOLDER);
    return path.join(tempDir, `${prefix}-${randomUUID()}${ext}`);
}
