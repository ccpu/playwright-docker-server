"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractProcessEnvOptions = extractProcessEnvOptions;
exports.getLaunchOptions = getLaunchOptions;
const tslib_1 = require("tslib");
const node_process_1 = tslib_1.__importDefault(require("node:process"));
const browser_type_1 = require("./browser-type");
const make_flags_1 = require("./make-flags");
const chromiumDefaultArgs = ['--disable-dev-shm-usage', '--no-sandbox'];
function extractOptions(obj, startsWith, browserType) {
    var _a;
    const options = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            const envKey = key.split('_').join('-').trim();
            const parts = envKey.split('--');
            const optionKey = (_a = parts[1]) === null || _a === void 0 ? void 0 : _a.trim();
            if (optionKey !== undefined && optionKey.length > 0) {
                const keyParts = parts[0].split('-');
                const keyPart = keyParts[0];
                if (keyPart.toLowerCase() === startsWith.toLowerCase() &&
                    (keyParts.length === 1 || keyParts[1] === browserType)) {
                    const trimmedValue = value.trimSpecialCharStart();
                    if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
                        try {
                            const parsed = JSON.parse(value);
                            options[optionKey] = parsed;
                        }
                        catch (_b) {
                            options[optionKey] = value;
                        }
                    }
                    else {
                        options[optionKey] = value;
                    }
                }
            }
        }
    }
    return options;
}
function extractProcessEnvOptions(browserType) {
    const envLaunchOptions = extractOptions(node_process_1.default.env, 'server', browserType);
    const envFlags = extractOptions(node_process_1.default.env, 'flag', browserType);
    const flags = (0, make_flags_1.makeFlags)(envFlags);
    const launchOptionsArgs = Array.isArray(envLaunchOptions.args)
        ? envLaunchOptions.args
        : undefined;
    const { args: _args } = envLaunchOptions, restOfEnvLaunchOptions = tslib_1.__rest(envLaunchOptions, ["args"]);
    const allFlags = [...flags, ...(launchOptionsArgs !== null && launchOptionsArgs !== void 0 ? launchOptionsArgs : [])];
    return Object.assign(Object.assign({}, (allFlags.length > 0 ? { args: allFlags } : {})), restOfEnvLaunchOptions);
}
function getLaunchOptions(url) {
    const browserType = (0, browser_type_1.getBrowserType)(url);
    const launchOptions = extractProcessEnvOptions(browserType);
    let launchOptionsCopy = launchOptions;
    if (browserType === 'chromium') {
        const existingArgs = Array.isArray(launchOptions.args)
            ? launchOptions.args
            : [];
        launchOptionsCopy = Object.assign(Object.assign({}, launchOptions), { args: [...existingArgs, ...chromiumDefaultArgs] });
    }
    const queryStringStartPosition = url.indexOf('?');
    if (queryStringStartPosition === -1) {
        if (Object.keys(launchOptionsCopy).length > 0) {
            console.warn('Launch options:');
            console.warn(JSON.stringify(launchOptionsCopy, null, ' '));
        }
        return launchOptionsCopy;
    }
    const paramsString = url.substring(queryStringStartPosition, url.length);
    const searchParams = new URLSearchParams(paramsString);
    const queries = {};
    searchParams.forEach((val, key) => {
        queries[key] = val;
    });
    const urlLaunchOptions = extractOptions(queries, 'server', browserType);
    const urlFlags = (0, make_flags_1.makeFlags)(extractOptions(queries, 'flag', browserType));
    const urlArgs = Array.isArray(urlLaunchOptions.args)
        ? urlLaunchOptions.args
        : [];
    const { args: _urlArgs } = urlLaunchOptions, restOfUrlLaunchOptions = tslib_1.__rest(urlLaunchOptions, ["args"]);
    const launchOptionArgs = Array.isArray(launchOptionsCopy.args)
        ? launchOptionsCopy.args
        : [];
    const newArgs = [...launchOptionArgs, ...urlFlags, ...urlArgs];
    const newOptions = Object.assign(Object.assign(Object.assign({}, launchOptionsCopy), (newArgs.length > 0 ? { args: [...new Set(newArgs)] } : {})), restOfUrlLaunchOptions);
    if (Object.keys(newOptions).length > 0) {
        console.warn('Launch options:');
        console.warn(JSON.stringify(newOptions, null, ' '));
    }
    return newOptions;
}
//# sourceMappingURL=launch-options.js.map