/**
 * @link https://stylelint.io/user-guide/configure
 * @type {import('stylelint').Config}
 */
export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-html/html',
    'stylelint-config-html/vue',
    'stylelint-config-tailwindcss',
    'stylelint-config-tailwindcss/scss',
  ],
  plugins: ['stylelint-order'],
  rules: {
    'order/order': [],
    'order/properties-order': [],
    'color-function-notation': null,
    'alpha-value-notation': null,
  },
};
