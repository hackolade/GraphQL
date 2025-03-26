const { describe, it, mock, afterEach } = require('node:test');
const assert = require('assert');

// Mock dependencies
const sortByNameMock = mock.fn(({ items }) => items);
mock.module('../../../../reverse_engineering/helpers/sortByName', {
	namedExports: {
		sortByName: sortByNameMock,
	},
});

const mapDirectivesUsageMock = mock.fn(() => []);
mock.module('../../../../reverse_engineering/mappers/directiveUsage', {
	namedExports: {
		mapDirectivesUsage: mapDirectivesUsageMock,
	},
});

const mapFieldMock = mock.fn(({ field }) => ({
	name: field.name.value,
	required: field.type.kind === 'NON_NULL_TYPE',
}));
mock.module('../../../../reverse_engineering/mappers/field', {
	namedExports: {
		mapField: mapFieldMock,
	},
});

const { getInputObjectTypeDefinitions } = require('../../../../reverse_engineering/mappers/typeDefinitions/inputType');

describe('getInputObjectTypeDefinitions', () => {
	afterEach(() => {
		sortByNameMock.mock.resetCalls();
		mapDirectivesUsageMock.mock.resetCalls();
		mapFieldMock.mock.resetCalls();
	});

	it('should return an empty array when no input object types are provided', () => {
		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: [],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});
		assert.deepStrictEqual(result, []);
	});

	it('should correctly map a simple input object type with no fields', () => {
		const mockInputObjectType = {
			name: { value: 'EmptyInput' },
			fields: [],
			directives: [],
		};

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
		assert.strictEqual(sortByNameMock.mock.calls.length, 1);
		assert.strictEqual(mapFieldMock.mock.calls.length, 0);
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

		// Expected result with the properties based on the mocked mapField responses
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
		assert.strictEqual(sortByNameMock.mock.calls.length, 1);
		assert.strictEqual(mapFieldMock.mock.calls.length, 2);
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

		// Mock mapField to return field with default value
		mapFieldMock.mock.mockImplementation(({ field }) => ({
			name: field.name.value,
			required: field.type.kind === 'NON_NULL_TYPE',
			default: field.defaultValue ? field.defaultValue.value : undefined,
		}));

		const expected = [
			{
				type: 'input',
				name: 'FilterInput',
				properties: {
					limit: { name: 'limit', required: false, default: '10' },
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
		assert.strictEqual(sortByNameMock.mock.calls.length, 1);
		assert.strictEqual(mapFieldMock.mock.calls.length, 2);
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
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0], {
			directives: mockInputObjectType.directives,
		});
	});

	it('should correctly handle fields order', () => {
		const mockInputObjectType = {
			name: { value: 'OrderedInput' },
			fields: [
				{ name: { value: 'fieldB' }, type: { kind: 'NAMED_TYPE' }, directives: [] },
				{ name: { value: 'fieldA' }, type: { kind: 'NAMED_TYPE' }, directives: [] },
				{ name: { value: 'fieldC' }, type: { kind: 'NAMED_TYPE' }, directives: [] },
			],
			directives: [],
		};

		mapFieldMock.mock.mockImplementation(({ field }) => ({
			name: field.name.value,
			required: false,
		}));

		// Test both fieldsOrder options
		const testCases = [
			{
				fieldsOrder: 'alphabetical',
				expectedOrder: ['fieldA', 'fieldB', 'fieldC'], // Alphabetical order
			},
			{
				fieldsOrder: 'field',
				expectedOrder: ['fieldB', 'fieldA', 'fieldC'], // Original order
			},
		];

		for (const testCase of testCases) {
			sortByNameMock.mock.resetCalls();
			mapFieldMock.mock.resetCalls();

			// Mock sortByName to simulate behavior based on fieldsOrder value
			if (testCase.fieldsOrder === 'alphabetical') {
				// For 'alphabetical', sort alphabetically
				sortByNameMock.mock.mockImplementationOnce(({ items }) => {
					return [...items].sort((a, b) => a.name.localeCompare(b.name));
				});
			} else {
				// For 'field', maintain original order
				sortByNameMock.mock.mockImplementationOnce(({ items }) => items);
			}

			const result = getInputObjectTypeDefinitions({
				inputObjectTypes: [mockInputObjectType],
				definitionCategoryByNameMap: {},
				fieldsOrder: testCase.fieldsOrder,
			});

			// Check that sortByName was called correctly
			assert.strictEqual(sortByNameMock.mock.calls.length, 1);
			assert.strictEqual(sortByNameMock.mock.calls[0].arguments[0].fieldsOrder, testCase.fieldsOrder);

			// Verify the result structure
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].name, 'OrderedInput');

			const propertyNames = Object.keys(result[0].properties);

			// Verify the properties are in the expected order for this test case
			assert.deepStrictEqual(
				propertyNames,
				testCase.expectedOrder,
				`Field order should be ${testCase.expectedOrder.join(', ')} when fieldsOrder is "${testCase.fieldsOrder}"`,
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

		const result = getInputObjectTypeDefinitions({
			inputObjectTypes: mockInputObjectTypes,
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.strictEqual(result.length, 2);
		assert.strictEqual(result[0].name, 'Input1');
		assert.strictEqual(result[1].name, 'Input2');
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
	});

	it('should handle undefined fields', () => {
		const mockInputObjectType = {
			name: { value: 'InputWithoutFields' },
			// fields is undefined
			directives: [],
		};

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

		// Verify no fields were processed
		assert.strictEqual(mapFieldMock.mock.calls.length, 0);

		// Verify sortByName was still called (but with empty array)
		assert.strictEqual(sortByNameMock.mock.calls.length, 1);
		assert.deepStrictEqual(sortByNameMock.mock.calls[0].arguments[0].items, []);
	});

	it('should handle undefined directives', () => {
		const mockInputObjectType = {
			name: { value: 'InputWithoutDirectives' },
			fields: [],
			// directives is undefined
		};

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

		// Verify the mapDirectivesUsage was called with empty directives array
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0].directives, []);
	});

	it('should correctly handle input types with complex nested references', () => {
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

		// Mock mapField to return different types of fields
		mapFieldMock.mock.mockImplementationOnce(
			({ field }) => ({
				name: field.name.value,
				required: false,
				$ref: '#model/definitions/Input objects/NestedInput',
			}),
			0,
		);
		mapFieldMock.mock.mockImplementationOnce(
			({ field }) => ({
				name: field.name.value,
				required: false,
				type: 'List',
				items: [
					{
						$ref: '#model/definitions/Input objects/NestedInput',
						required: false,
					},
				],
			}),
			1,
		);

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
		assert.strictEqual(mapFieldMock.mock.calls.length, 2);
	});
});
