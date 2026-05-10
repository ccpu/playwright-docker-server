"use strict";
function getIndex(str) {
    let index = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char.match(/[-a-z[\]]/iu)) {
            index = i;
            break;
        }
    }
    return index;
}
function trimSpecialCharStart() {
    return this.substring(getIndex(this), this.length);
}
function trimSpecialCharEnd() {
    const revStr = this.split('').reverse().join('');
    const endIndex = getIndex(revStr);
    return this.substring(0, this.length - endIndex);
}
Object.assign(String.prototype, {
    trimSpecialCharEnd,
    trimSpecialCharStart,
});
//# sourceMappingURL=trim-special-char.js.map