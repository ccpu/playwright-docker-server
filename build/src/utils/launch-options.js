"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLaunchOptions = exports.extractProcessEnvOptions = exports.launchOptions = void 0;
const tslib_1 = require("tslib");
const make_flags_1 = require("./make-flags");
const browser_type_1 = require("./browser-type");
const extractOptions = (obj, startsWith) => {
    const options = Object.keys(obj).reduce((newObj, key) => {
        const envKey = key.split('_').join('-').trim();
        if (envKey.toLowerCase().startsWith(startsWith + '-')) {
            const envVal = obj[key];
            const optionKey = envKey
                .replace(startsWith.toUpperCase() + '-', '')
                .replace(startsWith.toLowerCase() + '-', '');
            const val = typeof envVal === 'string' &&
                envVal.trimSpecialCharStart().startsWith('[')
                ? JSON.parse(envVal
                    .trimSpecialCharStart()
                    .trimSpecialCharEnd()
                    .split("'")
                    .join('"'))
                : envVal;
            if (optionKey)
                newObj[optionKey] = val;
        }
        return newObj;
    }, {});
    return options;
};
const chromiumDefaultArgs = ['--disable-dev-shm-usage', '--no-sandbox'];
exports.launchOptions = {};
function extractProcessEnvOptions() {
    const envLaunchOptions = extractOptions(process.env, 'server');
    const envFlags = extractOptions(process.env, 'flag');
    const flags = (0, make_flags_1.makeFlags)(envFlags);
    const { args: launchOptionsArgs } = envLaunchOptions, restOfEnvLaunchOptions = (0, tslib_1.__rest)(envLaunchOptions, ["args"]);
    const allFlags = [...flags, ...(launchOptionsArgs ? launchOptionsArgs : [])];
    exports.launchOptions = Object.assign(Object.assign({}, (allFlags && allFlags.length ? { args: allFlags } : undefined)), restOfEnvLaunchOptions);
    if (Object.keys(exports.launchOptions).length > 0) {
        console.log('Launch options:');
        console.log(JSON.stringify(exports.launchOptions, null, ' '));
    }
}
exports.extractProcessEnvOptions = extractProcessEnvOptions;
const getLaunchOptions = (url) => {
    const browserType = (0, browser_type_1.getBrowserType)(url);
    const dataArr = decodeURI(url)
        .split('/')
        .filter((x) => x)
        .slice(1);
    let launchOptionsCopy = exports.launchOptions;
    if (browserType === 'chromium') {
        launchOptionsCopy = Object.assign(Object.assign({}, exports.launchOptions), { args: [
                ...(exports.launchOptions.args ? exports.launchOptions.args : []),
                ...chromiumDefaultArgs,
            ] });
    }
    if (dataArr.length === 0)
        return launchOptionsCopy;
    const queryStringObj = dataArr.reduce((newObj, queryString) => {
        const qualSymbolIndex = queryString.indexOf('=');
        if (qualSymbolIndex === -1) {
            newObj[queryString] = true;
            return newObj;
        }
        const key = queryString.substring(0, qualSymbolIndex).trim();
        const value = queryString
            .substring(qualSymbolIndex + 1, queryString.length)
            .trim();
        newObj[key] = value;
        return newObj;
    }, {});
    const urlLaunchOptions = extractOptions(queryStringObj, 'server');
    const urlFlags = (0, make_flags_1.makeFlags)(extractOptions(queryStringObj, 'flag'));
    const { args: urlArgs } = urlLaunchOptions, restOfUrlLaunchOptions = (0, tslib_1.__rest)(urlLaunchOptions, ["args"]);
    let newArgs = launchOptionsCopy.args;
    newArgs = [
        ...(newArgs ? newArgs : []),
        ...urlFlags,
        ...(urlArgs ? urlArgs : []),
    ];
    const newOptions = Object.assign(Object.assign(Object.assign({}, launchOptionsCopy), (newArgs ? { args: [...new Set(newArgs)] } : {})), restOfUrlLaunchOptions);
    console.log(JSON.stringify(newOptions, null, ' '));
    return newOptions;
};
exports.getLaunchOptions = getLaunchOptions;
//# sourceMappingURL=launch-options.js.map