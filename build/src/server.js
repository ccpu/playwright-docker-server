"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTimeOut = exports.shutdown = exports.startHttpServer = exports.httpServer = void 0;
const tslib_1 = require("tslib");
const proxy_1 = require("./proxy");
const http_1 = require("http");
const browser_1 = require("./browser");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
exports.httpServer = http_1.createServer();
const browser = new browser_1.BrowserServer();
const startHttpServer = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        exports.httpServer
            .on('upgrade', (req, socket, head) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const server = yield browser.launchServer(req.url, socket);
            if (server)
                proxy_1.setProxy(req, socket, head, server.wsEndpoint());
        }))
            .on('listening', () => {
            console.log(`Running playwright ${utils_1.getPlaywrightVersion()}`);
            console.log('Server listening...');
            resolve(null);
        })
            .on('close', () => {
            console.log('http server closed');
        })
            .on('error', (err) => {
            console.error(err);
            reject(err);
        })
            .listen(3000);
    });
});
exports.startHttpServer = startHttpServer;
const shutdown = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        proxy_1.killProxy();
        if (browser)
            yield browser.killAll();
        if (exports.httpServer)
            exports.httpServer.close();
        console.log('Successful shutdown');
    }
    catch (error) {
        console.log(error);
    }
    process.removeAllListeners();
    if (!process.env.__TEST__)
        process.exit(0);
});
exports.shutdown = shutdown;
process.on('SIGINT', function () {
    exports.shutdown();
});
const startTimeOut = (timeout) => {
    if (!timeout)
        return;
    const seconds = timeout * 1000;
    setTimeout(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        console.log('Timeout reached, shuting down the docker...');
        yield exports.shutdown();
    }), seconds);
    console.log('Will shutdown after ' + timeout + ' seconds.');
};
exports.startTimeOut = startTimeOut;
exports.startTimeOut(process.env[constants_1.DOCKER_TIMEOUT] && Number.parseInt(process.env[constants_1.DOCKER_TIMEOUT]));
//# sourceMappingURL=server.js.map