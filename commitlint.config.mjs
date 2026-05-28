export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'perf', 'chore', 'docs', 'test', 'ci', 'build', 'revert'],
    ],
    'scope-enum': [
      2,
      'always',
      ['core', 'hud', 'settings', 'audio', 'vad', 'provider', 'tauri', 'ci', 'release', 'deps'],
    ],
    'subject-case': [0],
  },
};
