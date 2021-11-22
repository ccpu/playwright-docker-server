"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaywrightVersion = void 0;
const tslib_1 = require("tslib");
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const process_1 = require("process");
const getPlaywrightVersion = () => {
    const packagePath = path_1.default.resolve((0, process_1.cwd)(), 'package.json');
    const version = require(packagePath).dependencies['playwright'].toString();
    return version;
};
exports.getPlaywrightVersion = getPlaywrightVersion;
//# sourceMappingURL=get-playwright-version.js.map