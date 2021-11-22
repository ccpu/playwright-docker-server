"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.killProxy = exports.setProxy = exports.proxy = void 0;
const http_proxy_1 = require("http-proxy");
const server_1 = require("./server");
const constants_1 = require("./constants");
exports.proxy = (0, http_proxy_1.createProxyServer)({ ignorePath: true });
const setProxy = (req, socket, head, target) => {
    exports.proxy.ws(req, socket, head, { target });
    return exports.proxy;
};
exports.setProxy = setProxy;
const killProxy = () => {
    if (!exports.proxy)
        return;
    exports.proxy.removeAllListeners();
    exports.proxy.close();
};
exports.killProxy = killProxy;
exports.proxy.on('error', (err, _req, res) => {
    console.log(`Issue communicating with browser: "${err.message}"`);
    res.writeHead && res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Issue communicating with browser`);
});
exports.proxy.on('close', () => {
    if (process.env[constants_1.USE_ONCE] === 'true')
        (0, server_1.shutdown)();
});
//# sourceMappingURL=proxy.js.map