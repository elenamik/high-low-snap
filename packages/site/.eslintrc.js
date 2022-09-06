module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        'jsdoc/require-jsdoc': 0,
        'prettier/prettier': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-case-declarations': 'off',
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', 'build/'],
};
