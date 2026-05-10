"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxy = void 0;
exports.setProxy = setProxy;
exports.killProxy = killProxy;
const tslib_1 = require("tslib");
const node_process_1 = tslib_1.__importDefault(require("node:process"));
const httpxy_1 = require("httpxy");
const constants_1 = require("./constants");
const server_1 = require("./server");
const PROXY_ERROR_STATUS = 500;
exports.proxy = (0, httpxy_1.createProxyServer)({ ignorePath: true });
function setProxy(req, socket, head, target) {
    Promise.resolve(exports.proxy.ws(req, socket, { target }, head)).catch((error) => {
        console.error(error);
    });
    return exports.proxy;
}
function killProxy() {
    exports.proxy.removeAllListeners();
    exports.proxy.close();
}
exports.proxy.on('error', (err, _req, res) => {
    var _a, _b;
    console.warn(`Issue communicating with browser: "${err.message}"`);
    if (res !== null && typeof res === 'object') {
        const httpResponse = res;
        (_a = httpResponse.writeHead) === null || _a === void 0 ? void 0 : _a.call(httpResponse, PROXY_ERROR_STATUS, { 'Content-Type': 'text/plain' });
        (_b = httpResponse.end) === null || _b === void 0 ? void 0 : _b.call(httpResponse, 'Issue communicating with browser');
    }
});
exports.proxy.on('close', () => {
    if (node_process_1.default.env[constants_1.USE_ONCE] === 'true') {
        (0, server_1.shutdown)().catch((error) => {
            console.error(error);
        });
    }
});
//# sourceMappingURL=proxy.js.map