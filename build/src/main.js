"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const utils_1 = require("./utils");
require("./utils/trim-special-char");
const constants_1 = require("./constants");
if (process.env[constants_1.DISABLE_MESSAGES] === 'true') {
    console.log = function () { };
    console.debug = function () { };
}
utils_1.extractProcessEnvOptions();
server_1.startHttpServer();
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
//# sourceMappingURL=main.js.map