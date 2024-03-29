module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    node: true,
  },
  rules: {
    'global-require': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-param-reassign': 'off',
  },
  overrides: [
    {
      files: ['src/**'],
      extends: 'plugin:vue/recommended',
      env: {
        browser: true,
      },
      plugins: [
        'html',
        'vue',
      ],
      rules: {
        'vue/no-v-html': 'off',
      },
    },
    {
      files: ['test/**'],
      env: {
        mocha: true,
      },
      globals: {
        expect: true,
      },
      rules: {
        'no-unused-expressions': 'off',
        'no-console': 'off',
      },
    },
  ],
};
