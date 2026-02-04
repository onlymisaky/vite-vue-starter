/**
 * @link https://github.com/okonet/lint-staged
 * @link https://blog.csdn.net/oschina_41559824/article/details/136965327
 * @type {import('lint-staged').Configuration}
 */
export default {
  // '**/*.{js,jsx,ts,tsx,json}': ['npm run eslint'],
  // '**/*.{css,scss,sass,postcss}': ['npm run stylelint'],
  // '**/*.{vue}': ['npm run eslint', ' npm run stylelint'],
  '*.{js,jsx,ts,tsx,json}': 'eslint',
  '*.{css,scss,sass,postcss}': 'stylelint',
  '*.vue': ['eslint', 'stylelint'],
};
