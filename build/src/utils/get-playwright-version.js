"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaywrightVersion = getPlaywrightVersion;
const tslib_1 = require("tslib");
const node_fs_1 = require("node:fs");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_process_1 = require("node:process");
function getPlaywrightVersion() {
    var _a, _b, _c;
    const packagePath = node_path_1.default.resolve((0, node_process_1.cwd)(), 'package.json');
    const packageRaw = (0, node_fs_1.readFileSync)(packagePath, 'utf8');
    const packageJson = JSON.parse(packageRaw);
    return (_c = (_b = (_a = packageJson.dependencies) === null || _a === void 0 ? void 0 : _a.playwright) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '';
}
//# sourceMappingURL=get-playwright-version.js.map