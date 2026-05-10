"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserServer = void 0;
const tslib_1 = require("tslib");
const node_process_1 = tslib_1.__importDefault(require("node:process"));
const playwright = tslib_1.__importStar(require("playwright"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const GUID_REGEX = /(?:\w{4,12}-?){5}/u;
const MILLISECONDS_IN_SECOND = 1000;
class BrowserServer {
    constructor() {
        this.instances = {};
    }
    launchServer(url, socket) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const browserType = (0, utils_1.getBrowserType)(url);
            console.warn(`\n\nLaunching ${browserType}...`);
            const server = yield playwright[browserType].launchServer((0, utils_1.getLaunchOptions)(url));
            const endPoint = server.wsEndpoint();
            const guid = (_b = (_a = GUID_REGEX.exec(endPoint)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : endPoint;
            this.instances[endPoint] = {
                server,
                browserType,
                guid,
            };
            socket.on('close', () => {
                this.kill(server).catch((error) => {
                    console.error(error);
                });
            });
            console.warn(`${browserType} launched (${guid}).`);
            const timeoutRaw = node_process_1.default.env[constants_1.BROWSER_SERVER_TIMEOUT];
            const timeout = timeoutRaw !== undefined ? Number.parseInt(timeoutRaw, 10) : undefined;
            if (timeout !== undefined && Number.isFinite(timeout) && timeout > 0) {
                console.warn(`Browser will close in ${timeout} seconds.`);
            }
            this.checkForTimeout(server, timeout);
            return server;
        });
    }
    getWsEndpoint(server) {
        return server.wsEndpoint();
    }
    checkForTimeout(server, timeout) {
        if (timeout === undefined || timeout <= 0) {
            return;
        }
        const timeoutMs = timeout * MILLISECONDS_IN_SECOND;
        const instance = this.instances[server.wsEndpoint()];
        if (instance === undefined) {
            return;
        }
        instance.timer = setTimeout(() => {
            console.warn('Timeout reached, shuting down the browser server.');
            this.kill(server).catch((error) => {
                console.error(error);
            });
        }, timeoutMs);
    }
    kill(server) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const endPoint = server.wsEndpoint();
            const instance = this.instances[endPoint];
            if (instance === undefined) {
                return;
            }
            const { browserType, guid, timer } = instance;
            if (timer !== undefined) {
                clearTimeout(timer);
            }
            console.warn(`Terminating ${browserType} (${guid}) ...`);
            delete this.instances[endPoint];
            yield server.close();
            console.warn(`${browserType} terminated (${guid}).`);
        });
    }
    killAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const allInstances = Object.values(this.instances);
            yield Promise.all(allInstances.map((_a) => tslib_1.__awaiter(this, [_a], void 0, function* ({ server }) { return this.kill(server); })));
        });
    }
}
exports.BrowserServer = BrowserServer;
//# sourceMappingURL=browser.js.map