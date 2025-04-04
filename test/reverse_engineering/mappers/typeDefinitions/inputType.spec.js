const { describe, it, mock, afterEach } = require('node:test');
const assert = require('assert');

// Mock dependencies
const mapDirectivesUsageMock = mock.fn(() => []);
mock.module('../../../../reverse_engineering/mappers/directiveUsage.js', {
	namedExports: {
		mapDirectivesUsage: mapDirectivesUsageMock,
	},
});

// Mock getFieldsSchema instead of mapField
const getFieldsSchemaMock = mock.fn(() => ({ properties: {}, required: [] }));
mock.module('../../../../reverse_engineering/mappers/field.js', {
	namedExports: {
		getFieldsSchema: getFieldsSchemaMock,
	},
});

const { getInputObjectTypeDefinitions } = require('../../../../reverse_engineering/mappers/typeDefinitions/inputType');

describe('getInputObjectTypeDefinitions', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
		getFieldsSchemaMock.mock.resetCalls();
	});

	it('should return an empty array when no input object types are provided', () => {
		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: [],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});
		assert.deepStrictEqual(result, []);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 0);
	});

	it('should correctly map a simple input object type with no fields', () => {
		const mockInputObjectType = {
			name: { value: 'EmptyInput' },
			fields: [],
			directives: [],
		};

		// Mock getFieldsSchema to return empty properties and required arrays
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

		const expected = [
			{
				type: 'input',
				name: 'EmptyInput',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [],
			},
		];

		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: [mockInputObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);

		// Verify the correct parameters were passed to getFieldsSchema
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.fields, []);
		assert.deepStrictEqual(fieldsSchemaParams.definitionCategoryByNameMap, {});
		assert.deepStrictEqual(fieldsSchemaParams.fieldsOrder, {});
	});

	it('should correctly map an input object type with fields', () => {
		const mockInputObjectType = {
			name: { value: 'UserInput' },
			description: { value: 'Input for creating a user' },
			fields: [
				{
					name: { value: 'username' },
					type: { kind: 'NON_NULL_TYPE' },
					directives: [],
				},
				{
					name: { value: 'email' },
					type: { kind: 'NAMED_TYPE' },
					directives: [],
				},
			],
			directives: [],
		};

		// Mock getFieldsSchema to return properties and required fields
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {
				username: { name: 'username', required: true },
				email: { name: 'email', required: false },
			},
			required: ['username'],
		}));

		const expected = [
			{
				type: 'input',
				name: 'UserInput',
				properties: {
					username: { name: 'username', required: true },
					email: { name: 'email', required: false },
				},
				required: ['username'],
				description: 'Input for creating a user',
				typeDirectives: [],
			},
		];

		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: [mockInputObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);

		// Verify that getFieldsSchema was called with the correct fields
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.fields, mockInputObjectType.fields);
	});

	it('should correctly map an input object type with fields with default values', () => {
		const mockInputObjectType = {
			name: { value: 'FilterInput' },
			fields: [
				{
					name: { value: 'limit' },
					type: { kind: 'NAMED_TYPE' },
					directives: [],
					defaultValue: { kind: 'IntValue', value: '10' },
				},
				{
					name: { value: 'sortBy' },
					type: { kind: 'NAMED_TYPE' },
					directives: [],
					defaultValue: { kind: 'StringValue', value: 'createdAt' },
				},
			],
			directives: [],
		};

		// Mock getFieldsSchema to return fields with default values
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {
				limit: { name: 'limit', required: false, default: 10 },
				sortBy: { name: 'sortBy', required: false, default: 'createdAt' },
			},
			required: [],
		}));

		const expected = [
			{
				type: 'input',
				name: 'FilterInput',
				properties: {
					limit: { name: 'limit', required: false, default: 10 },
					sortBy: { name: 'sortBy', required: false, default: 'createdAt' },
				},
				required: [],
				description: '',
				typeDirectives: [],
			},
		];

		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: [mockInputObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);

		// Verify getFieldsSchema received fields with default values
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.fields, mockInputObjectType.fields);
	});

	it('should correctly map an input object type with directives', () => {
		const mockDirectiveResult = [
			{ directiveName: '@deprecated', rawArgumentValues: 'reason: "Use NewInput instead"' },
		];
		mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockDirectiveResult);

		const mockInputObjectType = {
			name: { value: 'OldInput' },
			fields: [],
			directives: [
				{
					name: { value: 'deprecated' },
					arguments: [{ name: { value: 'reason' }, value: { value: 'Use NewInput instead' } }],
				},
			],
		};

		// Mock getFieldsSchema for empty fields
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

		const expected = [
			{
				type: 'input',
				name: 'OldInput',
				properties: {},
				required: [],
				description: '',
				typeDirectives: mockDirectiveResult,
			},
		];

		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: [mockInputObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(
			mapDirectivesUsageMock.mock.calls[0].arguments[0].directives,
			mockInputObjectType.directives,
		);
	});

	it('should correctly pass fields order to getFieldsSchema', () => {
		const mockInputObjectType = {
			name: { value: 'OrderedInput' },
			fields: [
				{ name: { value: 'fieldB' }, type: { kind: 'NAMED_TYPE' }, directives: [] },
				{ name: { value: 'fieldA' }, type: { kind: 'NAMED_TYPE' }, directives: [] },
				{ name: { value: 'fieldC' }, type: { kind: 'NAMED_TYPE' }, directives: [] },
			],
			directives: [],
		};

		// Test both fieldsOrder options
		const testCases = [
			{
				fieldsOrder: 'alphabetical',
				mockResult: {
					properties: {
						fieldA: { name: 'fieldA' },
						fieldB: { name: 'fieldB' },
						fieldC: { name: 'fieldC' },
					},
					required: [],
				},
			},
			{
				fieldsOrder: 'field',
				mockResult: {
					properties: {
						fieldB: { name: 'fieldB' },
						fieldA: { name: 'fieldA' },
						fieldC: { name: 'fieldC' },
					},
					required: [],
				},
			},
		];

		for (const testCase of testCases) {
			getFieldsSchemaMock.mock.resetCalls();

			// Mock getFieldsSchema to return properties in the correct order
			getFieldsSchemaMock.mock.mockImplementationOnce(() => testCase.mockResult);

			const result = getInputObjectTypeDefinitions({
				inputObjectTypes: [mockInputObjectType],
				definitionCategoryByNameMap: {},
				fieldsOrder: testCase.fieldsOrder,
			});

			// Verify the result matches what getFieldsSchema returned
			assert.deepStrictEqual(result[0].properties, testCase.mockResult.properties);

			// Verify that getFieldsSchema was called with the correct fieldsOrder
			assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);
			const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
			assert.strictEqual(
				fieldsSchemaParams.fieldsOrder,
				testCase.fieldsOrder,
				`getFieldsSchema should be called with fieldsOrder: "${testCase.fieldsOrder}"`,
			);
		}
	});

	it('should correctly map multiple input object types', () => {
		const mockInputObjectTypes = [
			{
				name: { value: 'Input1' },
				fields: [],
				directives: [],
			},
			{
				name: { value: 'Input2' },
				fields: [],
				directives: [],
			},
		];

		// Mock getFieldsSchema to return empty properties for both calls
		getFieldsSchemaMock.mock.mockImplementation(() => ({
			properties: {},
			required: [],
		}));

		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: mockInputObjectTypes,
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.strictEqual(result.length, 2);
		assert.strictEqual(result[0].name, 'Input1');
		assert.strictEqual(result[1].name, 'Input2');
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 2);
	});

	it('should handle undefined fields', () => {
		const mockInputObjectType = {
			name: { value: 'InputWithoutFields' },
			// fields is undefined
			directives: [],
		};

		// Mock getFieldsSchema to return empty properties
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

		const expected = [
			{
				type: 'input',
				name: 'InputWithoutFields',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [],
			},
		];

		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: [mockInputObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);

		// Verify getFieldsSchema was called with empty array
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.fields, []);
	});

	it('should handle undefined directives', () => {
		const mockInputObjectType = {
			name: { value: 'InputWithoutDirectives' },
			fields: [],
			// directives is undefined
		};

		// Mock getFieldsSchema to return empty properties
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

		const expected = [
			{
				type: 'input',
				name: 'InputWithoutDirectives',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [], // We expect an empty array since our mock returns []
			},
		];

		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: [mockInputObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);

		// Verify mapDirectivesUsage was called with empty directives array
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0].directives, []);
	});

	it('should correctly handle input types with complex field structures', () => {
		const mockInputObjectType = {
			name: { value: 'ComplexInput' },
			fields: [
				{
					name: { value: 'nestedInput' },
					type: { kind: 'NAMED_TYPE', name: { value: 'NestedInput' } },
					directives: [],
				},
				{
					name: { value: 'inputList' },
					type: {
						kind: 'LIST_TYPE',
						type: { kind: 'NAMED_TYPE', name: { value: 'NestedInput' } },
					},
					directives: [],
				},
			],
			directives: [],
		};

		// Mock getFieldsSchema to return a complex structure with references and lists
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {
				nestedInput: {
					name: 'nestedInput',
					required: false,
					$ref: '#model/definitions/Input objects/NestedInput',
				},
				inputList: {
					name: 'inputList',
					required: false,
					type: 'List',
					items: [
						{
							$ref: '#model/definitions/Input objects/NestedInput',
							required: false,
						},
					],
				},
			},
			required: [],
		}));

		const expected = [
			{
				type: 'input',
				name: 'ComplexInput',
				properties: {
					nestedInput: {
						name: 'nestedInput',
						required: false,
						$ref: '#model/definitions/Input objects/NestedInput',
					},
					inputList: {
						name: 'inputList',
						required: false,
						type: 'List',
						items: [
							{
								$ref: '#model/definitions/Input objects/NestedInput',
								required: false,
							},
						],
					},
				},
				required: [],
				description: '',
				typeDirectives: [],
			},
		];

		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: [mockInputObjectType],
			definitionCategoryByNameMap: {
				'NestedInput': 'Input objects',
			},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);

		// Verify getFieldsSchema received the right definition map
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.definitionCategoryByNameMap, { 'NestedInput': 'Input objects' });
	});
});
