"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserServer = void 0;
const tslib_1 = require("tslib");
const playwright = (0, tslib_1.__importStar)(require("playwright"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
class BrowserServer {
    constructor() {
        this.instances = {};
    }
    launchServer(url, socket) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const browserType = (0, utils_1.getBrowserType)(url);
            console.log(`\n\nLaunching ${browserType}...`);
            const server = yield playwright[browserType].launchServer((0, utils_1.getLaunchOptions)(url));
            if (!server)
                return null;
            const endPoint = server.wsEndpoint();
            const guid = /((\w{4,12}-?)){5}/.exec(endPoint)[0];
            this.instances[endPoint] = {
                server,
                browserType,
                guid,
            };
            socket.on('close', () => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield this.kill(server);
            }));
            console.log(`${browserType} launched (${guid}).`);
            const timeout = process.env[constants_1.BROWSER_SERVER_TIMEOUT] &&
                Number.parseInt(process.env[constants_1.BROWSER_SERVER_TIMEOUT]);
            if (timeout) {
                console.log('Browser will close in ' + timeout + ' seconds.');
            }
            this.checkForTimeout(server, timeout);
            return server;
        });
    }
    getWsEndpoint(server) {
        return server.wsEndpoint();
    }
    checkForTimeout(server, timeout) {
        if (!timeout) {
            return;
        }
        timeout = timeout * 1000;
        this.instances[server.wsEndpoint()].timer = setTimeout(() => {
            console.log('Timeout reached, shuting down the browser server.');
            this.kill(server);
        }, timeout);
    }
    kill(server) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const endPoint = server.wsEndpoint();
            if (!this.instances[endPoint])
                return;
            const { browserType, guid } = this.instances[endPoint];
            clearTimeout(this.instances[endPoint].timer);
            console.log(`Terminating ${browserType} (${guid}) ...`);
            delete this.instances[endPoint];
            yield server.close();
            console.log(`${browserType} terminated (${guid}).`);
        });
    }
    killAll() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { instances } = this;
            const keys = Object.keys(instances);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const info = instances[key];
                yield this.kill(info.server);
            }
        });
    }
}
exports.BrowserServer = BrowserServer;
//# sourceMappingURL=browser.js.map