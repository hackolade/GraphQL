const { describe, it, mock, afterEach } = require('node:test');
const assert = require('assert');

// Mock dependencies
const mapDirectivesUsageMock = mock.fn(() => []);
mock.module('../../../reverse_engineering/mappers/directiveUsage', {
	namedExports: {
		mapDirectivesUsage: mapDirectivesUsageMock,
	},
});

// Mock getFieldsSchema
const getFieldsSchemaMock = mock.fn(() => ({ properties: {}, required: [] }));
mock.module('../../../reverse_engineering/mappers/field', {
	namedExports: {
		getFieldsSchema: getFieldsSchemaMock,
	},
});

const { mapRootTypesToEntities } = require('../../../reverse_engineering/mappers/rootTypes');

describe('mapRootTypesToEntities', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
		getFieldsSchemaMock.mock.resetCalls();
	});

	it('should return an empty array when rootTypeNodes is not provided', () => {
		const result = mapRootTypesToEntities({
			rootTypeNodes: undefined,
			schemaRootTypesMap: ['Query', 'Mutation', 'Subscription'],
			definitionCategoryByNameMap: {},
			fieldsOrder: 'alphabetical',
		});
		assert.deepStrictEqual(result, []);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 0);
	});

	it('should return an empty array when rootTypeNodes is an empty array', () => {
		const result = mapRootTypesToEntities({
			rootTypeNodes: [],
			schemaRootTypesMap: ['Query', 'Mutation', 'Subscription'],
			definitionCategoryByNameMap: {},
			fieldsOrder: 'alphabetical',
		});
		assert.deepStrictEqual(result, []);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 0);
	});

	it('should correctly map a query root type', () => {
		const mockQueryType = {
			name: { value: 'Query' },
			fields: [
				{
					name: { value: 'user' },
					type: { kind: 'NAMED_TYPE', name: { value: 'User' } },
					directives: [],
				},
			],
			directives: [],
			description: { value: 'Root Query type' },
		};

		// Mock getFieldsSchema to return user field
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {
				user: {
					name: 'user',
					$ref: '#model/definitions/Objects/User',
					required: false,
				},
			},
			required: [],
		}));

		const expected = [
			{
				name: 'Query',
				data: {
					type: 'object',
					description: 'Root Query type',
					operationType: 'Query',
					typeDirectives: [],
					properties: {
						user: {
							name: 'user',
							$ref: '#model/definitions/Objects/User',
							required: false,
						},
					},
					required: [],
				},
			},
		];

		const result = mapRootTypesToEntities({
			rootTypeNodes: [mockQueryType],
			schemaRootTypesMap: ['Query', 'Mutation', 'Subscription'],
			definitionCategoryByNameMap: { User: 'Objects' },
			fieldsOrder: 'alphabetical',
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);

		// Verify the correct parameters were passed to getFieldsSchema
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.fields, mockQueryType.fields);
		assert.deepStrictEqual(fieldsSchemaParams.definitionCategoryByNameMap, { User: 'Objects' });
		assert.strictEqual(fieldsSchemaParams.fieldsOrder, 'alphabetical');
	});

	it('should correctly map a mutation root type', () => {
		const mockMutationType = {
			name: { value: 'Mutation' },
			fields: [
				{
					name: { value: 'createUser' },
					type: { kind: 'NAMED_TYPE', name: { value: 'User' } },
					directives: [],
				},
			],
			directives: [],
		};

		// Mock getFieldsSchema to return createUser field
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {
				createUser: {
					name: 'createUser',
					$ref: '#model/definitions/Objects/User',
					required: false,
				},
			},
			required: [],
		}));

		const expected = [
			{
				name: 'Mutation',
				data: {
					type: 'object',
					description: '',
					operationType: 'Mutation',
					typeDirectives: [],
					properties: {
						createUser: {
							name: 'createUser',
							$ref: '#model/definitions/Objects/User',
							required: false,
						},
					},
					required: [],
				},
			},
		];

		const result = mapRootTypesToEntities({
			rootTypeNodes: [mockMutationType],
			schemaRootTypesMap: ['Query', 'Mutation', 'Subscription'],
			definitionCategoryByNameMap: { User: 'Objects' },
			fieldsOrder: 'alphabetical',
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
	});

	it('should correctly map a subscription root type', () => {
		const mockSubscriptionType = {
			name: { value: 'Subscription' },
			fields: [
				{
					name: { value: 'userUpdated' },
					type: { kind: 'NAMED_TYPE', name: { value: 'User' } },
					directives: [],
				},
			],
			directives: [],
		};

		// Mock getFieldsSchema to return userUpdated field
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {
				userUpdated: {
					name: 'userUpdated',
					$ref: '#model/definitions/Objects/User',
					required: false,
				},
			},
			required: [],
		}));

		const expected = [
			{
				name: 'Subscription',
				data: {
					type: 'object',
					description: '',
					operationType: 'Subscription',
					typeDirectives: [],
					properties: {
						userUpdated: {
							name: 'userUpdated',
							$ref: '#model/definitions/Objects/User',
							required: false,
						},
					},
					required: [],
				},
			},
		];

		const result = mapRootTypesToEntities({
			rootTypeNodes: [mockSubscriptionType],
			schemaRootTypesMap: ['Query', 'Mutation', 'Subscription'],
			definitionCategoryByNameMap: { User: 'Objects' },
			fieldsOrder: 'alphabetical',
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
	});

	it('should correctly map a root type with custom name', () => {
		const mockQueryType = {
			name: { value: 'CustomQuery' },
			fields: [],
			directives: [],
		};

		// Test with custom schema root types map
		const result = mapRootTypesToEntities({
			rootTypeNodes: [mockQueryType],
			schemaRootTypesMap: ['CustomQuery', 'CustomMutation', 'CustomSubscription'],
			definitionCategoryByNameMap: {},
			fieldsOrder: 'alphabetical',
		});

		assert.strictEqual(result[0].data.operationType, 'Query');
	});

	it('should correctly map multiple root types', () => {
		const mockQueryType = {
			name: { value: 'Query' },
			fields: [],
			directives: [],
		};

		const mockMutationType = {
			name: { value: 'Mutation' },
			fields: [],
			directives: [],
		};

		const result = mapRootTypesToEntities({
			rootTypeNodes: [mockQueryType, mockMutationType],
			schemaRootTypesMap: ['Query', 'Mutation', 'Subscription'],
			definitionCategoryByNameMap: {},
			fieldsOrder: 'alphabetical',
		});

		assert.strictEqual(result.length, 2);
		assert.strictEqual(result[0].name, 'Query');
		assert.strictEqual(result[0].data.operationType, 'Query');
		assert.strictEqual(result[1].name, 'Mutation');
		assert.strictEqual(result[1].data.operationType, 'Mutation');
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 2);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
	});

	it('should correctly map a root type with directives', () => {
		const mockDirectiveResult = [{ directiveName: '@deprecated', rawArgumentValues: 'reason: "Use new API"' }];
		mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockDirectiveResult);

		const mockQueryType = {
			name: { value: 'Query' },
			fields: [],
			directives: [
				{
					name: { value: 'deprecated' },
					arguments: [{ name: { value: 'reason' }, value: { value: 'Use new API' } }],
				},
			],
		};

		const result = mapRootTypesToEntities({
			rootTypeNodes: [mockQueryType],
			schemaRootTypesMap: ['Query', 'Mutation', 'Subscription'],
			definitionCategoryByNameMap: {},
			fieldsOrder: 'alphabetical',
		});

		assert.deepStrictEqual(result[0].data.typeDirectives, mockDirectiveResult);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0].directives, mockQueryType.directives);
	});

	it('should correctly map a root type with complex field structures', () => {
		const mockQueryType = {
			name: { value: 'Query' },
			fields: [
				{
					name: { value: 'user' },
					type: { kind: 'NAMED_TYPE', name: { value: 'User' } },
					directives: [],
				},
				{
					name: { value: 'users' },
					type: {
						kind: 'LIST_TYPE',
						type: { kind: 'NAMED_TYPE', name: { value: 'User' } },
					},
					directives: [],
				},
			],
			directives: [],
		};

		// Mock getFieldsSchema to return complex field structure
		getFieldsSchemaMock.mock.mockImplementationOnce(() => ({
			properties: {
				user: {
					name: 'user',
					$ref: '#model/definitions/Objects/User',
					required: false,
				},
				users: {
					name: 'users',
					required: false,
					type: 'List',
					items: [
						{
							$ref: '#model/definitions/Objects/User',
							required: false,
						},
					],
				},
			},
			required: [],
		}));

		const expected = [
			{
				name: 'Query',
				data: {
					type: 'object',
					description: '',
					operationType: 'Query',
					typeDirectives: [],
					properties: {
						user: {
							name: 'user',
							$ref: '#model/definitions/Objects/User',
							required: false,
						},
						users: {
							name: 'users',
							required: false,
							type: 'List',
							items: [
								{
									$ref: '#model/definitions/Objects/User',
									required: false,
								},
							],
						},
					},
					required: [],
				},
			},
		];

		const result = mapRootTypesToEntities({
			rootTypeNodes: [mockQueryType],
			schemaRootTypesMap: ['Query', 'Mutation', 'Subscription'],
			definitionCategoryByNameMap: { User: 'Objects' },
			fieldsOrder: 'alphabetical',
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(getFieldsSchemaMock.mock.calls.length, 1);

		// Verify getFieldsSchema received the right definition map
		const fieldsSchemaParams = getFieldsSchemaMock.mock.calls[0].arguments[0];
		assert.deepStrictEqual(fieldsSchemaParams.definitionCategoryByNameMap, { User: 'Objects' });
	});
});
