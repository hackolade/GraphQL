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

const mapImplementsInterfacesMock = mock.fn(() => []);
mock.module('../../../../reverse_engineering/mappers/implementsInterfaces.js', {
	namedExports: {
		mapImplementsInterfaces: mapImplementsInterfacesMock,
	},
});

const { getInterfaceDefinitions } = require('../../../../reverse_engineering/mappers/typeDefinitions/interface');

describe('getInterfaceDefinitions', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
		getFieldsSchemaMock.mock.resetCalls();
		mapImplementsInterfacesMock.mock.resetCalls();
	});

	it('should return an empty array when no interface types are provided', () => {
		const result = getInterfaceDefinitions({
			interfaces: [],
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});
		assert.deepStrictEqual(result, []);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 0);
	});

	it('should correctly map a simple interface with no fields', () => {
		const mockInterface = {
			name: { value: 'EmptyInterface' },
			fields: [],
			directives: [],
			interfaces: [],
		};

		// Mock getFieldsSchema to return empty properties and required arrays
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

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
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);
		assert.strictEqual(mapImplementsInterfacesMock.mock.calls.length, 1);

		// Verify the correct parameters were passed to getFieldsSchema
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.fields, []);
		assert.deepStrictEqual(fieldsSchemaParams.definitionCategoryByNameMap, {});
		assert.deepStrictEqual(fieldsSchemaParams.fieldsOrder, {});
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

		// Mock getFieldsSchema to return properties and required fields
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {
				id: { name: 'id', required: true },
				name: { name: 'name', required: false },
			},
			required: ['id'],
		}));

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
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);
		assert.strictEqual(mapImplementsInterfacesMock.mock.calls.length, 1);

		// Verify that getFieldsSchema was called with the correct fields
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.fields, mockInterface.fields);
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

		// Mock getFieldsSchema for empty fields
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

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
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0].directives, mockInterface.directives);
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

		// Mock getFieldsSchema for empty fields
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

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

	it('should correctly pass fields order to getFieldsSchema', () => {
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
			mapImplementsInterfacesMock.mock.resetCalls();

			// Mock getFieldsSchema to return properties in the correct order
			getFieldsSchemaMock.mock.mockImplementationOnce(() => testCase.mockResult);

			const result = getInterfaceDefinitions({
				interfaces: [mockInterface],
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

			// Verify property order in the result
			const propertyNames = Object.keys(result[0].properties);
			const expectedOrder = Object.keys(testCase.mockResult.properties);

			assert.deepStrictEqual(
				propertyNames,
				expectedOrder,
				`Field order should be ${expectedOrder.join(', ')} when fieldsOrder is "${testCase.fieldsOrder}"`,
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

		// Mock getFieldsSchema to return empty properties for both calls
		getFieldsSchemaMock.mock.mockImplementation(() => ({
			properties: {},
			required: [],
		}));

		const result = getInterfaceDefinitions({
			interfaces: mockInterfaces,
			definitionCategoryByNameMap: {},
			fieldsOrder: {},
		});

		assert.strictEqual(result.length, 2);
		assert.strictEqual(result[0].name, 'Interface1');
		assert.strictEqual(result[1].name, 'Interface2');
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 2);
		assert.strictEqual(mapImplementsInterfacesMock.mock.calls.length, 2);
	});

	it('should handle undefined fields', () => {
		const mockInterface = {
			name: { value: 'InterfaceWithoutFields' },
			// fields is undefined
			directives: [],
			interfaces: [],
		};

		// Mock getFieldsSchema to return empty properties
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

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

		// Verify getFieldsSchema was called with empty array
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.fields, []);
	});

	it('should handle undefined directives', () => {
		const mockInterface = {
			name: { value: 'InterfaceWithoutDirectives' },
			fields: [],
			// directives is undefined
			interfaces: [],
		};

		// Mock getFieldsSchema to return empty properties
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

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

		// Verify mapDirectivesUsage was called with empty directives array
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

		// Mock getFieldsSchema to return empty properties
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {},
			required: [],
		}));

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

	it('should correctly handle interfaces with complex field structures', () => {
		const mockInterface = {
			name: { value: 'ComplexInterface' },
			fields: [
				{
					name: { value: 'reference' },
					type: { kind: 'NAMED_TYPE', name: { value: 'SomeType' } },
					directives: [],
				},
				{
					name: { value: 'list' },
					type: {
						kind: 'LIST_TYPE',
						type: { kind: 'NAMED_TYPE', name: { value: 'OtherType' } },
					},
					directives: [],
				},
			],
			directives: [],
			interfaces: [],
		};

		// Mock getFieldsSchema to return a complex structure with references and lists
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {
				reference: {
					name: 'reference',
					required: false,
					$ref: '#model/definitions/Objects/SomeType',
				},
				list: {
					name: 'list',
					required: false,
					type: 'List',
					items: [
						{
							$ref: '#model/definitions/Objects/OtherType',
							required: false,
						},
					],
				},
			},
			required: [],
		}));

		const expected = [
			{
				type: 'interface',
				name: 'ComplexInterface',
				properties: {
					reference: {
						name: 'reference',
						required: false,
						$ref: '#model/definitions/Objects/SomeType',
					},
					list: {
						name: 'list',
						required: false,
						type: 'List',
						items: [
							{
								$ref: '#model/definitions/Objects/OtherType',
								required: false,
							},
						],
					},
				},
				required: [],
				description: '',
				typeDirectives: [],
				implementsInterfaces: [],
			},
		];

		const result = getInterfaceDefinitions({
			interfaces: [mockInterface],
			definitionCategoryByNameMap: {
				SomeType: 'Objects',
				OtherType: 'Objects',
			},
			fieldsOrder: {},
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);

		// Verify getFieldsSchema received the right definition map
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.definitionCategoryByNameMap, {
			SomeType: 'Objects',
			OtherType: 'Objects',
		});
	});
});
