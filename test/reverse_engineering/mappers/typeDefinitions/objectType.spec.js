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
	// Add other properties that mapField would return
}));
mock.module('../../../../reverse_engineering/mappers/field', {
	namedExports: {
		mapField: mapFieldMock,
	},
});

const { getObjectTypeDefinitions } = require('../../../../reverse_engineering/mappers/typeDefinitions/objectType');

describe('getObjectTypeDefinitions', () => {
	afterEach(() => {
		sortByNameMock.mock.resetCalls();
		mapDirectivesUsageMock.mock.resetCalls();
		mapFieldMock.mock.resetCalls();
	});

	it('should return an empty array when no object types are provided', () => {
		const result = getObjectTypeDefinitions({
			objectTypes: [],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});
		assert.deepStrictEqual(result, []);
	});

	it('should correctly map a simple object type with no fields', () => {
		const mockObjectType = {
			name: { value: 'EmptyType' },
			fields: [],
			directives: [],
		};

		const expected = [
			{
				type: 'object',
				name: 'EmptyType',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [],
			},
		];

		const result = getObjectTypeDefinitions({
			objectTypes: [mockObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.strictEqual(sortByNameMock.mock.calls.length, 1);
		assert.strictEqual(mapFieldMock.mock.calls.length, 0);
	});

	it('should correctly map an object type with fields', () => {
		const mockObjectType = {
			name: { value: 'User' },
			description: { value: 'A user object' },
			fields: [
				{
					name: { value: 'id' },
					type: { kind: 'NON_NULL_TYPE' },
					directives: [],
				},
				{
					name: { value: 'name' },
					type: { kind: 'NAMED_TYPE' },
					directives: [],
				},
			],
			directives: [],
		};

		// Setup the mapField mock to return expected values
		mapFieldMock.mock.mockImplementation(({ field }) => ({
			name: field.name.value,
			required: field.type.kind === 'NON_NULL_TYPE',
		}));

		// Expected result with the properties based on the mocked mapField responses
		const expected = [
			{
				type: 'object',
				name: 'User',
				properties: {
					id: { name: 'id', required: true },
					name: { name: 'name', required: false },
				},
				required: ['id'],
				description: 'A user object',
				typeDirectives: [],
			},
		];

		const result = getObjectTypeDefinitions({
			objectTypes: [mockObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.strictEqual(sortByNameMock.mock.calls.length, 1);
		assert.strictEqual(mapFieldMock.mock.calls.length, 2);
	});

	it('should correctly map an object type with directives', () => {
		const mockDirectiveResult = [{ directiveName: '@auth', rawArgumentValues: 'requires: "ADMIN"' }];
		mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockDirectiveResult);

		const mockObjectType = {
			name: { value: 'AdminType' },
			fields: [],
			directives: [
				{
					name: { value: 'auth' },
					arguments: [{ name: { value: 'requires' }, value: { value: 'ADMIN' } }],
				},
			],
		};

		const expected = [
			{
				type: 'object',
				name: 'AdminType',
				properties: {},
				required: [],
				description: '',
				typeDirectives: mockDirectiveResult,
			},
		];

		const result = getObjectTypeDefinitions({
			objectTypes: [mockObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0], {
			directives: mockObjectType.directives,
		});
	});

	it('should correctly handle fields order', () => {
		const mockObjectType = {
			name: { value: 'OrderedType' },
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
			// Reset mocks before each test case
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

			const result = getObjectTypeDefinitions({
				objectTypes: [mockObjectType],
				definitionCategoryByNameMap: {},
				fieldsOrder: testCase.fieldsOrder,
			});

			// Check that sortByName was called correctly
			assert.strictEqual(sortByNameMock.mock.calls.length, 1);
			assert.strictEqual(sortByNameMock.mock.calls[0].arguments[0].fieldsOrder, testCase.fieldsOrder);

			// Verify the result structure
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].name, 'OrderedType');

			const propertyNames = Object.keys(result[0].properties);

			// Verify the properties are in the expected order for this test case
			assert.deepStrictEqual(
				propertyNames,
				testCase.expectedOrder,
				`Field order should be ${testCase.expectedOrder.join(', ')} when fieldsOrder is "${testCase.fieldsOrder}"`,
			);
		}
	});

	it('should correctly map multiple object types', () => {
		const mockObjectTypes = [
			{
				name: { value: 'Type1' },
				fields: [],
				directives: [],
			},
			{
				name: { value: 'Type2' },
				fields: [],
				directives: [],
			},
		];

		const result = getObjectTypeDefinitions({
			objectTypes: mockObjectTypes,
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.strictEqual(result.length, 2);
		assert.strictEqual(result[0].name, 'Type1');
		assert.strictEqual(result[1].name, 'Type2');
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
	});

	it('should handle undefined fields', () => {
		const mockObjectType = {
			name: { value: 'TypeWithoutFields' },
			// fields is undefined
			directives: [],
		};

		const expected = [
			{
				type: 'object',
				name: 'TypeWithoutFields',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [],
			},
		];

		const result = getObjectTypeDefinitions({
			objectTypes: [mockObjectType],
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
		const mockObjectType = {
			name: { value: 'TypeWithoutDirectives' },
			fields: [],
			// directives is undefined
		};

		const expected = [
			{
				type: 'object',
				name: 'TypeWithoutDirectives',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [], // We expect an empty array since our mock returns []
			},
		];

		const result = getObjectTypeDefinitions({
			objectTypes: [mockObjectType],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);

		// Verify the mapDirectivesUsage was called with empty directives array
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0].directives, []);
	});
});
