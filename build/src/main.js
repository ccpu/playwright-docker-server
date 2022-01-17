"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
require("./utils/trim-special-char");
const constants_1 = require("./constants");
if (process.env[constants_1.DISABLE_MESSAGES] === 'true') {
    console.log = function () { };
    console.debug = function () { };
}
(0, server_1.startHttpServer)();
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
//# sourceMappingURL=main.js.map