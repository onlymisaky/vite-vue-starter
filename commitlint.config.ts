import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

/**
 * @link https://commitlint.js.org/
 */
const Configuration: UserConfig = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      ['chore', 'build', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'],
    ],
    'scope-empty': [RuleConfigSeverity.Disabled, 'always' as const],
    'scope-case': [
      RuleConfigSeverity.Error,
      'always',
      ['pascal-case', 'camel-case', 'kebab-case'],
    ],
  },
  // ignores: [(commit) => commit.includes('init')],
};

export default Configuration;
