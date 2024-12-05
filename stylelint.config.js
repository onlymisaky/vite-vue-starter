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
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['deep'],
    }],
    'function-no-unknown': [true, {
      ignoreFunctions: ['v-bind'],
    }],
    'scss/function-no-unknown': [true, {
      ignoreFunctions: ['v-bind'],
    }],
    // 'selector-pseudo-element-no-unknown': [true, {
    //   ignorePseudoElements: ['v-deep', ':deep'],
    // }],
  },
};
