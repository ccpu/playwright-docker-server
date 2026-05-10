"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
exports.startHttpServer = startHttpServer;
exports.shutdown = shutdown;
exports.startTimeOut = startTimeOut;
const tslib_1 = require("tslib");
const node_http_1 = require("node:http");
const node_process_1 = tslib_1.__importDefault(require("node:process"));
const browser_1 = require("./browser");
const constants_1 = require("./constants");
const proxy_1 = require("./proxy");
const utils_1 = require("./utils");
exports.httpServer = (0, node_http_1.createServer)();
const browser = new browser_1.BrowserServer();
const TEST_ENV_KEY = '__TEST__';
const DEFAULT_HTTP_PORT = 3000;
const MILLISECONDS_IN_SECOND = 1000;
function startHttpServer() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            exports.httpServer
                .on('upgrade', (req, socket, head) => {
                (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const server = yield browser.launchServer((_a = req.url) !== null && _a !== void 0 ? _a : '', socket);
                    (0, proxy_1.setProxy)(req, socket, head, server.wsEndpoint());
                }))().catch((error) => {
                    console.error(error);
                });
            })
                .on('listening', () => {
                console.warn(`Running playwright ${(0, utils_1.getPlaywrightVersion)()}`);
                console.warn('Server listening...');
                resolve();
            })
                .on('close', () => {
                console.warn('http server closed');
            })
                .on('error', (err) => {
                console.error(err);
                reject(err);
            })
                .listen(DEFAULT_HTTP_PORT);
        });
    });
}
function shutdown() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            (0, proxy_1.killProxy)();
            yield browser.killAll();
            exports.httpServer.close();
            console.warn('Successful shutdown');
        }
        catch (error) {
            console.error(error);
        }
        node_process_1.default.removeAllListeners();
        if (node_process_1.default.env[TEST_ENV_KEY] !== 'true') {
            node_process_1.default.exit(0);
        }
    });
}
node_process_1.default.on('SIGINT', () => {
    shutdown().catch((error) => {
        console.error(error);
    });
});
function startTimeOut(timeout) {
    if (timeout === undefined || timeout <= 0) {
        return;
    }
    const milliseconds = timeout * MILLISECONDS_IN_SECOND;
    setTimeout(() => {
        console.warn('Timeout reached, shuting down the docker...');
        shutdown().catch((error) => {
            console.error(error);
        });
    }, milliseconds);
    console.warn(`Will shutdown after ${timeout} seconds.`);
}
const timeoutEnv = node_process_1.default.env[constants_1.DOCKER_TIMEOUT];
const timeout = timeoutEnv !== undefined ? Number.parseInt(timeoutEnv, 10) : undefined;
startTimeOut(timeout);
//# sourceMappingURL=server.js.map