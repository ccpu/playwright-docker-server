function quoteFile(file) {
  return `"${file.replaceAll('"', '\\"')}"`;
}

function joinFiles(files) {
  return files.map(quoteFile).join(' ');
}

module.exports = {
  '*.{ts,tsx,js,jsx,mjs,cjs}': (files) => {
    const targets = joinFiles(files);
    return [
      `pnpm exec eslint --fix ${targets}`,
      `pnpm exec prettier --write ${targets}`,
    ];
  },
  '*.{json,md,yml,yaml}': (files) => {
    const targets = joinFiles(files);
    return [`pnpm exec prettier --write ${targets}`];
  },
};
