"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFlags = void 0;
exports.makeFlags = (flagObject) => {
    return Object.keys(flagObject).reduce((newArr, flag) => {
        if (!['no-sandbox'].includes(flag))
            newArr.push('--' + flag + '=' + flagObject[flag]);
        return newArr;
    }, []);
};
//# sourceMappingURL=make-flags.js.map