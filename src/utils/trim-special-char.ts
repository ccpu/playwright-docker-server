const getIndex = (str: string) => {
  let index = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char.match(/[a-z-A-Z\[\]]/)) {
      index = i;
      break;
    }
  }
  return index;
};
Object.assign(String.prototype, {
  trimSpecialCharStart() {
    return this.substring(getIndex(this), this.length);
  },
  trimSpecialCharEnd() {
    const revStr = this.split('')
      .reverse()
      .join('');
    const endIndex = getIndex(revStr);
    return this.substring(0, this.length - endIndex);
  },
});
