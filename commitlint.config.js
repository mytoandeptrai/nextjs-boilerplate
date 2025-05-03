module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'test', // Adding or modifying tests
        'chore', // Changes to build process or auxiliary tools
        'perf', // Performance improvements
        'ci', // CI configuration changes
        'revert', // Revert a previous commit
      ],
    ],
  },
};
