const { describe, it, mock, afterEach } = require('node:test');
const assert = require('assert');

// Mock dependencies
const mapDirectivesUsageMock = mock.fn(() => []);
mock.module('../../../reverse_engineering/mappers/directiveUsage', {
	namedExports: {
		mapDirectivesUsage: mapDirectivesUsageMock,
	},
});

const astNodeKindMock = {
	NAMED_TYPE: 'NamedType',
	NON_NULL_TYPE: 'NonNullType',
	LIST_TYPE: 'ListType',
	INT: 'IntValue',
	FLOAT: 'FloatValue',
	STRING: 'StringValue',
	BOOLEAN: 'BooleanValue',
	NULL: 'NullValue',
	ENUM: 'EnumValue',
	LIST: 'ListValue',
	OBJECT: 'ObjectValue',
	OBJECT_FIELD: 'ObjectField',
};

mock.module('../../../reverse_engineering/constants/graphqlAST', {
	namedExports: {
		astNodeKind: astNodeKindMock,
	},
});

// Mock parseDefaultValue
const parseDefaultValueMock = mock.fn(value => {
	// Simple default implementation that returns string values
	if (value.kind === astNodeKindMock.INT) {
		return parseInt(value.value);
	} else if (value.kind === astNodeKindMock.STRING) {
		return value.value;
	} else if (value.kind === astNodeKindMock.BOOLEAN) {
		return value.value.toString();
	}
	return 'default-value';
});

mock.module('../../../reverse_engineering/mappers/defaultValue', {
	namedExports: {
		parseDefaultValue: parseDefaultValueMock,
	},
});

const { getArguments } = require('../../../reverse_engineering/mappers/arguments');

describe('arguments', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
		parseDefaultValueMock.mock.resetCalls();
	});

	describe('getArguments', () => {
		it('should return an empty array when no arguments are provided', () => {
			const result = getArguments({ fieldArguments: [] });
			assert.deepStrictEqual(result, []);
			assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 0);
		});

		it('should return an empty array when fieldArguments parameter is undefined', () => {
			const result = getArguments({});
			assert.deepStrictEqual(result, []);
			assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 0);
		});

		it('should map a simple argument with a scalar type', () => {
			const fieldArguments = [
				{
					name: { value: 'name' },
					type: {
						kind: astNodeKindMock.NAMED_TYPE,
						name: { value: 'String' },
					},
					directives: [],
				},
			];

			const result = getArguments({ fieldArguments });

			assert.deepStrictEqual(result, [
				{
					name: 'name',
					type: 'String',
					description: '',
					directives: [],
					required: false,
				},
			]);
			assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		});

		it('should map multiple arguments', () => {
			const fieldArguments = [
				{
					name: { value: 'name' },
					type: {
						kind: astNodeKindMock.NAMED_TYPE,
						name: { value: 'String' },
					},
					directives: [],
				},
				{
					name: { value: 'age' },
					type: {
						kind: astNodeKindMock.NAMED_TYPE,
						name: { value: 'Int' },
					},
					directives: [],
				},
			];

			const result = getArguments({ fieldArguments });

			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].name, 'name');
			assert.strictEqual(result[0].type, 'String');
			assert.strictEqual(result[1].name, 'age');
			assert.strictEqual(result[1].type, 'Int');
			assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
		});

		it('should map an argument with a description', () => {
			const fieldArguments = [
				{
					name: { value: 'name' },
					description: { value: 'User name' },
					type: {
						kind: astNodeKindMock.NAMED_TYPE,
						name: { value: 'String' },
					},
					directives: [],
				},
			];

			const result = getArguments({ fieldArguments });

			assert.deepStrictEqual(result, [
				{
					name: 'name',
					type: 'String',
					description: 'User name',
					directives: [],
					required: false,
				},
			]);
		});

		it('should map an argument with directives', () => {
			const mockDirectives = [{ name: { value: 'deprecated' }, arguments: [] }];
			const mockMappedDirectives = [{ directiveName: '@deprecated', rawArgumentValues: '' }];
			mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockMappedDirectives);

			const fieldArguments = [
				{
					name: { value: 'oldArg' },
					type: {
						kind: astNodeKindMock.NAMED_TYPE,
						name: { value: 'String' },
					},
					directives: mockDirectives,
				},
			];

			const result = getArguments({ fieldArguments });

			assert.deepStrictEqual(result, [
				{
					name: 'oldArg',
					type: 'String',
					description: '',
					directives: mockMappedDirectives,
					required: false,
				},
			]);
			assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
			assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0], {
				directives: mockDirectives,
			});
		});

		it('should map an argument with a non-null type', () => {
			const fieldArguments = [
				{
					name: { value: 'id' },
					type: {
						kind: astNodeKindMock.NON_NULL_TYPE,
						type: {
							kind: astNodeKindMock.NAMED_TYPE,
							name: { value: 'ID' },
						},
					},
					directives: [],
				},
			];

			const result = getArguments({ fieldArguments });

			assert.deepStrictEqual(result, [
				{
					name: 'id',
					type: 'ID',
					description: '',
					directives: [],
					required: true,
				},
			]);
		});

		it('should map an argument with a list type', () => {
			const fieldArguments = [
				{
					name: { value: 'tags' },
					type: {
						kind: astNodeKindMock.LIST_TYPE,
						type: {
							kind: astNodeKindMock.NAMED_TYPE,
							name: { value: 'String' },
						},
					},
					directives: [],
				},
			];

			const result = getArguments({ fieldArguments });

			assert.deepStrictEqual(result, [
				{
					name: 'tags',
					type: 'List',
					description: '',
					directives: [],
					required: false,
					listItems: [
						{
							type: 'String',
							required: false,
						},
					],
				},
			]);
		});

		it('should map an argument with a non-null list of non-null types', () => {
			const fieldArguments = [
				{
					name: { value: 'requiredTags' },
					type: {
						kind: astNodeKindMock.NON_NULL_TYPE,
						type: {
							kind: astNodeKindMock.LIST_TYPE,
							type: {
								kind: astNodeKindMock.NON_NULL_TYPE,
								type: {
									kind: astNodeKindMock.NAMED_TYPE,
									name: { value: 'String' },
								},
							},
						},
					},
					directives: [],
				},
			];

			const result = getArguments({ fieldArguments });

			assert.deepStrictEqual(result, [
				{
					name: 'requiredTags',
					type: 'List',
					description: '',
					directives: [],
					required: true,
					listItems: [
						{
							type: 'String',
							required: true,
						},
					],
				},
			]);
		});

		it('should fallback to String for unknown type kinds', () => {
			const fieldArguments = [
				{
					name: { value: 'unknownType' },
					type: {
						kind: 'UnknownKind', // Not one of the recognized kinds
					},
					directives: [],
				},
			];

			const result = getArguments({ fieldArguments });

			assert.deepStrictEqual(result, [
				{
					name: 'unknownType',
					type: 'String', // Fallback to String
					description: '',
					directives: [],
					required: false,
				},
			]);
		});
	});
});
