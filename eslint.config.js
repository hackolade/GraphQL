const globals = require('globals');
const prettierPlugin = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');
const jsdocPlugin = require('eslint-plugin-jsdoc');
const noAmbiguousReturnTypes = require('./.eslint/noAmbiguousReturnTypes');

const customRulesConfig = {
	rules: {
		'no-ambiguous-return-types': noAmbiguousReturnTypes,
	},
};

/**
 * @type {import('eslint').Linter.Config[]}
 */
module.exports = [
	jsdocPlugin.configs['flat/recommended'],
	{
		plugins: {
			'import': importPlugin,
			'jsdoc': jsdocPlugin,
			'unused-imports': unusedImportsPlugin,
			'prettier': prettierPlugin,
			'custom': customRulesConfig,
		},
	},
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
				...globals.es2025,
			},
		},
	},
	{
		ignores: ['.git', '.vscode', '.idea', '.sonarlint', 'node_modules', 'release'],
	},
	{
		files: ['**/*.{js,cjs,mjs}'],
		rules: {
			...eslintConfigPrettier.rules,
			'custom/no-ambiguous-return-types': 'error',
			'jsdoc/require-jsdoc': [
				'error',
				{
					'publicOnly': false,
					'require': {
						'FunctionDeclaration': true,
						'FunctionExpression': true,
						'ArrowFunctionExpression': true,
						'MethodDefinition': true,
					},
					'contexts': [
						'FunctionDeclaration',
						'FunctionExpression',
						'ArrowFunctionExpression',
						'MethodDefinition',
					],
				},
			],
			'jsdoc/tag-lines': 'off', // disabled due to conflict with prettier
			'jsdoc/require-param-description': 'off',
			'jsdoc/require-returns-description': 'off',
			'no-cond-assign': 'error',
			'no-const-assign': 'error',
			'no-dupe-args': 'error',
			'no-dupe-keys': 'error',
			'no-duplicate-case': 'error',
			'no-unreachable': 'error',
			'eqeqeq': 'error',
			'no-var': 'error',
			'no-undef': 'error',
			'no-bitwise': 'warn',
			'import/no-unresolved': ['error'],
			'import/named': 'error',
			'import/default': 'error',
			'import/no-self-import': 'error',
			'no-unused-vars': 'error',
			'unused-imports/no-unused-imports': 'error',
			'no-debugger': 'error',
		},
	},
];
