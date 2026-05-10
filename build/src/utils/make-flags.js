"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFlags = makeFlags;
function makeFlags(flagObject) {
    return Object.keys(flagObject).reduce((newArr, flag) => {
        if (flag !== 'no-sandbox') {
            newArr.push(`--${flag}=${String(flagObject[flag])}`);
        }
        return newArr;
    }, []);
}
//# sourceMappingURL=make-flags.js.map