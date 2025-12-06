import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig} */
export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: { ...globals.browser, React: 'readonly', NodeJS: 'readonly' },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            react: reactPlugin,
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            'no-unused-vars': 'off',
        },
    },
    {
        files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx', '**/__mocks__/**/*.ts', 'src/setupTests.ts'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node, ...globals.jest },
        },
    },
    {
        ignores: ['dist/', 'build/', 'node_modules/'],
    },
];