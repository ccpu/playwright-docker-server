"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrowserType = getBrowserType;
function getBrowserType(url) {
    const lowerCaseUrl = url.toLowerCase();
    if (lowerCaseUrl.includes('chromium'))
        return 'chromium';
    if (lowerCaseUrl.includes('firefox'))
        return 'firefox';
    if (lowerCaseUrl.includes('webkit'))
        return 'webkit';
    return 'chromium';
}
//# sourceMappingURL=browser-type.js.map