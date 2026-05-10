"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_process_1 = tslib_1.__importDefault(require("node:process"));
const constants_1 = require("./constants");
const server_1 = require("./server");
require("./utils/trim-special-char");
function noop() {
}
if (node_process_1.default.env[constants_1.DISABLE_MESSAGES] === 'true') {
    globalThis.console.log = noop;
    globalThis.console.debug = noop;
}
(0, server_1.startHttpServer)().catch((error) => {
    console.error(error);
});
node_process_1.default.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
//# sourceMappingURL=main.js.map