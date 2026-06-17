module.exports = {
  root: true,
  env: {
    es2022: true,
    browser: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended', 'prettier'],
  ignorePatterns: ['out', 'release', 'node_modules'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
