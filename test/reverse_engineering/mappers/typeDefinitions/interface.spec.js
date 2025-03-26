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

const mapImplementsInterfacesMock = mock.fn(() => []);
mock.module('../../../../reverse_engineering/mappers/implementsInterfaces', {
	namedExports: {
		mapImplementsInterfaces: mapImplementsInterfacesMock,
	},
});

const { getInterfaceDefinitions } = require('../../../../reverse_engineering/mappers/typeDefinitions/interface');

describe('getInterfaceDefinitions', () => {
	afterEach(() => {
		sortByNameMock.mock.resetCalls();
		mapDirectivesUsageMock.mock.resetCalls();
		mapFieldMock.mock.resetCalls();
		mapImplementsInterfacesMock.mock.resetCalls();
	});

	it('should return an empty array when no interface types are provided', () => {
		const result = getInterfaceDefinitions({
			interfaces: [],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});
		assert.deepStrictEqual(result, []);
	});

	it('should correctly map a simple interface with no fields', () => {
		const mockInterface = {
			name: { value: 'EmptyInterface' },
			fields: [],
			directives: [],
			interfaces: [],
		};

		const expected = [
			{
				type: 'interface',
				name: 'EmptyInterface',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [],
				implementsInterfaces: [],
			},
		];

		const result = getInterfaceDefinitions({
			interfaces: [mockInterface],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.strictEqual(sortByNameMock.mock.calls.length, 1);
		assert.strictEqual(mapFieldMock.mock.calls.length, 0);
		assert.strictEqual(mapImplementsInterfacesMock.mock.calls.length, 1);
	});

	it('should correctly map an interface with fields', () => {
		const mockInterface = {
			name: { value: 'Node' },
			description: { value: 'An interface for objects with an ID' },
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
			interfaces: [],
		};

		// Expected result with the properties based on the mocked mapField responses
		const expected = [
			{
				type: 'interface',
				name: 'Node',
				properties: {
					id: { name: 'id', required: true },
					name: { name: 'name', required: false },
				},
				required: ['id'],
				description: 'An interface for objects with an ID',
				typeDirectives: [],
				implementsInterfaces: [],
			},
		];

		const result = getInterfaceDefinitions({
			interfaces: [mockInterface],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.strictEqual(sortByNameMock.mock.calls.length, 1);
		assert.strictEqual(mapFieldMock.mock.calls.length, 2);
		assert.strictEqual(mapImplementsInterfacesMock.mock.calls.length, 1);
	});

	it('should correctly map an interface with directives', () => {
		const mockDirectiveResult = [{ directiveName: '@deprecated', rawArgumentValues: 'reason: "Use Node instead"' }];
		mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockDirectiveResult);

		const mockInterface = {
			name: { value: 'OldInterface' },
			fields: [],
			directives: [
				{
					name: { value: 'deprecated' },
					arguments: [{ name: { value: 'reason' }, value: { value: 'Use Node instead' } }],
				},
			],
			interfaces: [],
		};

		const expected = [
			{
				type: 'interface',
				name: 'OldInterface',
				properties: {},
				required: [],
				description: '',
				typeDirectives: mockDirectiveResult,
				implementsInterfaces: [],
			},
		];

		const result = getInterfaceDefinitions({
			interfaces: [mockInterface],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0], {
			directives: mockInterface.directives,
		});
		assert.strictEqual(mapImplementsInterfacesMock.mock.calls.length, 1);
	});

	it('should correctly handle inherited interfaces', () => {
		const mockInterface = {
			name: { value: 'ExtendedNode' },
			fields: [],
			directives: [],
			interfaces: [{ name: { value: 'Node' } }, { name: { value: 'Entity' } }],
		};

		const mockImplementsResult = [{ interface: 'Node' }, { interface: 'Entity' }];
		mapImplementsInterfacesMock.mock.mockImplementationOnce(() => mockImplementsResult);

		const expected = [
			{
				type: 'interface',
				name: 'ExtendedNode',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [],
				implementsInterfaces: mockImplementsResult,
			},
		];

		const result = getInterfaceDefinitions({
			interfaces: [mockInterface],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapImplementsInterfacesMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapImplementsInterfacesMock.mock.calls[0].arguments[0], {
			implementsInterfaces: mockInterface.interfaces,
		});
	});

	it('should correctly handle fields order', () => {
		const mockInterface = {
			name: { value: 'OrderedInterface' },
			fields: [
				{ name: { value: 'fieldB' }, type: { kind: 'NAMED_TYPE' }, directives: [] },
				{ name: { value: 'fieldA' }, type: { kind: 'NAMED_TYPE' }, directives: [] },
				{ name: { value: 'fieldC' }, type: { kind: 'NAMED_TYPE' }, directives: [] },
			],
			directives: [],
			interfaces: [],
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
			mapImplementsInterfacesMock.mock.resetCalls();

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

			const result = getInterfaceDefinitions({
				interfaces: [mockInterface],
				definitionCategoryByNameMap: {},
				fieldsOrder: testCase.fieldsOrder,
			});

			// Check that sortByName was called correctly
			assert.strictEqual(sortByNameMock.mock.calls.length, 1);
			assert.strictEqual(sortByNameMock.mock.calls[0].arguments[0].fieldsOrder, testCase.fieldsOrder);

			// Verify the result structure
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].name, 'OrderedInterface');

			const propertyNames = Object.keys(result[0].properties);

			// Verify the properties are in the expected order for this test case
			assert.deepStrictEqual(
				propertyNames,
				testCase.expectedOrder,
				`Field order should be ${testCase.expectedOrder.join(', ')} when fieldsOrder is "${testCase.fieldsOrder}"`,
			);
		}
	});

	it('should correctly map multiple interface types', () => {
		const mockInterfaces = [
			{
				name: { value: 'Interface1' },
				fields: [],
				directives: [],
				interfaces: [],
			},
			{
				name: { value: 'Interface2' },
				fields: [],
				directives: [],
				interfaces: [],
			},
		];

		const result = getInterfaceDefinitions({
			interfaces: mockInterfaces,
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.strictEqual(result.length, 2);
		assert.strictEqual(result[0].name, 'Interface1');
		assert.strictEqual(result[1].name, 'Interface2');
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
		assert.strictEqual(mapImplementsInterfacesMock.mock.calls.length, 2);
	});

	it('should handle undefined fields', () => {
		const mockInterface = {
			name: { value: 'InterfaceWithoutFields' },
			// fields is undefined
			directives: [],
			interfaces: [],
		};

		const expected = [
			{
				type: 'interface',
				name: 'InterfaceWithoutFields',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [],
				implementsInterfaces: [],
			},
		];

		const result = getInterfaceDefinitions({
			interfaces: [mockInterface],
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
		const mockInterface = {
			name: { value: 'InterfaceWithoutDirectives' },
			fields: [],
			// directives is undefined
			interfaces: [],
		};

		const expected = [
			{
				type: 'interface',
				name: 'InterfaceWithoutDirectives',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [], // We expect an empty array since our mock returns []
				implementsInterfaces: [],
			},
		];

		const result = getInterfaceDefinitions({
			interfaces: [mockInterface],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);

		// Verify the mapDirectivesUsage was called with empty directives array
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0].directives, []);
	});

	it('should handle undefined interfaces', () => {
		const mockInterface = {
			name: { value: 'InterfaceWithoutImplements' },
			fields: [],
			directives: [],
			// interfaces is undefined
		};

		const expected = [
			{
				type: 'interface',
				name: 'InterfaceWithoutImplements',
				properties: {},
				required: [],
				description: '',
				typeDirectives: [],
				implementsInterfaces: [], // We expect an empty array since our mock returns []
			},
		];

		const result = getInterfaceDefinitions({
			interfaces: [mockInterface],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);

		// Verify mapImplementsInterfaces was called with empty array
		assert.strictEqual(mapImplementsInterfacesMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapImplementsInterfacesMock.mock.calls[0].arguments[0].implementsInterfaces, []);
	});
});
