const { describe, it } = require('node:test');
const assert = require('assert');
const { mapDirectivesUsage } = require('../../../reverse_engineering/mappers/directiveUsage');
const { astNodeKind } = require('../../../reverse_engineering/constants/graphqlAST');

describe('mapDirectivesUsage', () => {
	it('should return an empty array when no directives are provided', () => {
		const result = mapDirectivesUsage({ directives: [] });
		assert.deepStrictEqual(result, []);
	});

	it('should map directive without arguments', () => {
		const mockDirective = {
			name: { value: 'deprecated' },
			arguments: [],
		};

		const expected = [
			{
				directiveFormat: 'Structured',
				directiveName: 'deprecated',
				argumentValueFormat: 'Raw',
				rawArgumentValues: '',
			},
		];

		const result = mapDirectivesUsage({ directives: [mockDirective] });
		assert.deepStrictEqual(result, expected);
	});

	it('should map directive with primitive argument values', () => {
		const mockDirective = {
			name: { value: 'test' },
			arguments: [
				{
					name: { value: 'intArg' },
					value: { astNodeKind: astNodeKind.INT, value: '42' },
				},
				{
					name: { value: 'stringArg' },
					value: { astNodeKind: astNodeKind.STRING, value: 'hello' },
				},
				{
					name: { value: 'boolArg' },
					value: { astNodeKind: astNodeKind.BOOLEAN, value: true },
				},
			],
		};

		const expected = [
			{
				directiveFormat: 'Structured',
				directiveName: 'test',
				argumentValueFormat: 'Raw',
				rawArgumentValues: 'intArg: 42, stringArg: "hello", boolArg: true',
			},
		];

		const result = mapDirectivesUsage({ directives: [mockDirective] });
		assert.deepStrictEqual(result, expected);
	});

	it('should map directive with complex argument values', () => {
		const mockDirective = {
			name: { value: 'complex' },
			arguments: [
				{
					name: { value: 'listArg' },
					value: {
						astNodeKind: astNodeKind.LIST,
						values: [
							{ astNodeKind: astNodeKind.INT, value: '1' },
							{ astNodeKind: astNodeKind.INT, value: '2' },
						],
					},
				},
				{
					name: { value: 'objectArg' },
					value: {
						astNodeKind: astNodeKind.OBJECT,
						fields: [
							{
								name: { value: 'field1' },
								value: { astNodeKind: astNodeKind.STRING, value: 'value1' },
							},
						],
					},
				},
			],
		};

		const expected = [
			{
				directiveFormat: 'Structured',
				directiveName: 'complex',
				argumentValueFormat: 'Raw',
				rawArgumentValues: 'listArg: [1, 2], objectArg: {field1: "value1"}',
			},
		];

		const result = mapDirectivesUsage({ directives: [mockDirective] });
		assert.deepStrictEqual(result, expected);
	});

	it('should map directive with variable and enum values', () => {
		const mockDirective = {
			name: { value: 'test' },
			arguments: [
				{
					name: { value: 'varArg' },
					value: { astNodeKind: astNodeKind.VARIABLE, name: { value: 'var' } },
				},
				{
					name: { value: 'enumArg' },
					value: { astNodeKind: astNodeKind.ENUM, value: 'ENUM_VALUE' },
				},
			],
		};

		const expected = [
			{
				directiveFormat: 'Structured',
				directiveName: 'test',
				argumentValueFormat: 'Raw',
				rawArgumentValues: 'varArg: $var, enumArg: ENUM_VALUE',
			},
		];

		const result = mapDirectivesUsage({ directives: [mockDirective] });
		assert.deepStrictEqual(result, expected);
	});
});
