module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  settings: {
    'import/resolver': { node: { extensions: ['.ts'], moduleDirectory: ['src', 'node_modules'] } },
    'import/extensions': ['.ts'],
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
    '@typescript-eslint/no-this-alias': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
    'consistent-this': ['error', 'me'],
    'no-param-reassign': ['off'],
    'class-methods-use-this': ['off'],
    'no-plusplus': ['off'],
    'no-bitwise': ['off'],
    'no-console': ['off'],
    'no-template-curly-in-string': ['off'],
    'no-nested-ternary': ['off'],
    'no-underscore-dangle': ['off'],
    'import/no-cycle': ['off'],
    'import/prefer-default-export': ['off'],
  },
};
