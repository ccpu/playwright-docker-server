"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLaunchOptions = exports.extractProcessEnvOptions = void 0;
const tslib_1 = require("tslib");
const make_flags_1 = require("./make-flags");
const browser_type_1 = require("./browser-type");
const chromiumDefaultArgs = ['--disable-dev-shm-usage', '--no-sandbox'];
const extractOptions = (obj, startsWith, browserType) => {
    const optionKeys = Object.keys(obj);
    const options = optionKeys.reduce((newObj, key) => {
        const envKey = key.split('_').join('-').trim();
        const parts = envKey.split('--');
        const optionKey = parts[1];
        const keyParts = parts[0].split('-');
        const keyPart = keyParts[0];
        if (keyPart.toLowerCase() === startsWith.toLowerCase() &&
            (keyParts.length === 1 || keyParts[1] === browserType)) {
            const envVal = obj[key];
            if (envVal.trimSpecialCharStart().startsWith('[') &&
                envVal.trimSpecialCharStart().endsWith(']')) {
                const arrVal = JSON.parse(envVal);
                newObj[optionKey] = arrVal;
            }
            else {
                newObj[optionKey] = envVal;
            }
        }
        return newObj;
    }, {});
    return options;
};
function extractProcessEnvOptions(browserType) {
    const envLaunchOptions = extractOptions(process.env, 'server', browserType);
    const envFlags = extractOptions(process.env, 'flag', browserType);
    const flags = (0, make_flags_1.makeFlags)(envFlags);
    const { args: launchOptionsArgs } = envLaunchOptions, restOfEnvLaunchOptions = (0, tslib_1.__rest)(envLaunchOptions, ["args"]);
    const allFlags = [...flags, ...(launchOptionsArgs ? launchOptionsArgs : [])];
    return Object.assign(Object.assign({}, (allFlags && allFlags.length ? { args: allFlags } : undefined)), restOfEnvLaunchOptions);
}
exports.extractProcessEnvOptions = extractProcessEnvOptions;
const getLaunchOptions = (url) => {
    const browserType = (0, browser_type_1.getBrowserType)(url);
    const launchOptions = extractProcessEnvOptions(browserType);
    let launchOptionsCopy = launchOptions;
    if (browserType === 'chromium') {
        launchOptionsCopy = Object.assign(Object.assign({}, launchOptions), { args: [
                ...(launchOptions.args ? launchOptions.args : []),
                ...chromiumDefaultArgs,
            ] });
    }
    const queryStringStartPosition = url.indexOf('?');
    if (queryStringStartPosition === -1) {
        if (Object.keys(launchOptionsCopy).length > 0) {
            console.log('Launch options:');
            console.log(JSON.stringify(launchOptionsCopy, null, ' '));
        }
        return launchOptionsCopy;
    }
    const paramsString = url.substring(url.indexOf('?'), url.length);
    const searchParams = new URLSearchParams(paramsString);
    const queries = {};
    searchParams.forEach((val, key) => {
        queries[key] = val;
    });
    const urlLaunchOptions = extractOptions(queries, 'server', browserType);
    const urlFlags = (0, make_flags_1.makeFlags)(extractOptions(queries, 'flag', browserType));
    const { args: urlArgs } = urlLaunchOptions, restOfUrlLaunchOptions = (0, tslib_1.__rest)(urlLaunchOptions, ["args"]);
    let newArgs = launchOptionsCopy.args;
    newArgs = [
        ...(newArgs ? newArgs : []),
        ...urlFlags,
        ...(urlArgs ? urlArgs : []),
    ];
    const newOptions = Object.assign(Object.assign(Object.assign({}, launchOptionsCopy), (newArgs ? { args: [...new Set(newArgs)] } : {})), restOfUrlLaunchOptions);
    if (Object.keys(newOptions).length > 0) {
        console.log('Launch options:');
        console.log(JSON.stringify(launchOptions, null, ' '));
    }
    return newOptions;
};
exports.getLaunchOptions = getLaunchOptions;
//# sourceMappingURL=launch-options.js.map