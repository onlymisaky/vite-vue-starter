import antfu from '@antfu/eslint-config';

/** @link https://github.com/antfu/eslint-config */
/** @type {import('eslint').Linter.Config[]} */
export default antfu({
  vue: true,
  rules: {
    'style/arrow-parens': 'off',
    'style/semi': ['error', 'always'],
    'style/quote-props': 'off',
    'node/prefer-global/process': 'off',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  },
  ignores: [
    '**/tsconfig.*.json',
    '**/tsconfig.json',
  ],
});
