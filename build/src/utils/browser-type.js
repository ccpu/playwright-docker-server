"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrowserType = void 0;
const getBrowserType = (url) => {
    const lowerCaseUrl = url.toLowerCase();
    if (lowerCaseUrl.indexOf('chromium') > -1)
        return 'chromium';
    if (lowerCaseUrl.indexOf('firefox') > -1)
        return 'firefox';
    if (lowerCaseUrl.indexOf('webkit') > -1)
        return 'webkit';
    return 'chromium';
};
exports.getBrowserType = getBrowserType;
//# sourceMappingURL=browser-type.js.map