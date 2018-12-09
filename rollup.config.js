const babel = require('rollup-plugin-babel');
const pkg = require('./package');

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: `dist/${pkg.name}.js`,
      format: 'cjs',
    },
    {
      file: `dist/${pkg.name}.esm.js`,
      format: 'esm',
    },
  ],
  external: [
    'cheerio',
    'loader-utils',
    'markdown-it',
    'postcss',
  ],
  plugins: [
    babel(),
  ],
};
