import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig} */
export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
            },
            globals: globals.node,
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            'no-unused-vars': 'off',
        },
    },
    {
        files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
        languageOptions: {
            globals: { ...globals.node, ...globals.jest },
        },
    },
    {
        ignores: ['dist/', 'build/', 'node_modules/'],
    },
];
