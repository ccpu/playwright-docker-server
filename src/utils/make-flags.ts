export const makeFlags = (flagObject: {}) => {
  return Object.keys(flagObject).reduce((newArr, flag) => {
    if (!['no-sandbox'].includes(flag))
      newArr.push('--' + flag + '=' + flagObject[flag]);
    return newArr;
  }, []);
};
