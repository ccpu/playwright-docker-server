Object.assign(String.prototype, {
  trimSpecialCharStart() {
    let index = 0;
    for (let i = 0; i < this.length; i++) {
      const char = this[i];
      if (char.match(/^[^a-zA-Z-/\[/]/g)) {
        index = i;
        break;
      }
    }
    console.log('------', index);
    return this.replace(/^[^a-zA-Z-/\[/]/g, '');
  },
  trimSpecialCharEnd() {
    return this.replace(/[^a-zA-Z-/\]/]+$/g, '');
  },
});
