module.exports = {
    extends: ['eslint:recommended'],
    env: {
        node: true,
        es2021: true,
    },
    rules: {
        'no-var': 'error',
    },
    parserOptions: {
        sourceType: 'module',
    },
};
