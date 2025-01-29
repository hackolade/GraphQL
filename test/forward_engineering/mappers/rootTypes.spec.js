const { describe, it, mock, afterEach } = require('node:test');
const { strictEqual, deepStrictEqual } = require('assert');

const formatFEStatementMock = mock.fn();
const getRootTypeFieldsMock = mock.fn();

mock.module('../../../forward_engineering/helpers/feStatementFormatHelper', {
	namedExports: {
		formatFEStatement: formatFEStatementMock,
	},
});
mock.module('../../../forward_engineering/mappers/fields', {
	namedExports: {
		getRootTypeFields: getRootTypeFieldsMock,
	},
});

// This require should be after the mocks to ensure that the mocks are applied before the module is required
const {
	getSchemaRootTypeStatements,
	getRootSchemaStatement,
	getRootTypeNames,
	getRootTypes,
	getRootType,
} = require('../../../forward_engineering/mappers/rootTypes');

describe('getRootTypeNames', () => {
	it('should return default root type names if no containers are provided', () => {
		const result = getRootTypeNames({ containers: [] });
		deepStrictEqual(result, {
			query: 'Query',
			mutation: 'Mutation',
			subscription: 'Subscription',
		});
	});

	it('should return trimmed root type names from containers', () => {
		const containers = [
			{
				containerData: [
					{
						schemaRootTypes: {
							rootQuery: ' CustomQuery ',
							rootMutation: 'CustomMutation',
							rootSubscription: ' CustomSubscription ',
						},
					},
				],
			},
		];
		const result = getRootTypeNames({ containers });
		deepStrictEqual(result, {
			query: 'CustomQuery',
			mutation: 'CustomMutation',
			subscription: 'CustomSubscription',
		});
	});

	it('should ignore empty root type names from containers', () => {
		const containers = [
			{
				containerData: [
					{
						schemaRootTypes: {
							rootQuery: ' ',
							rootMutation: '',
							rootSubscription: ' CustomSubscription ',
						},
					},
				],
			},
		];
		const result = getRootTypeNames({ containers });
		deepStrictEqual(result, {
			query: 'Query',
			mutation: 'Mutation',
			subscription: 'CustomSubscription',
		});
	});
});

describe('getRootSchemaStatement', () => {
	it('should return null if all root types have default values', () => {
		const rootTypeNames = {
			query: 'Query',
			mutation: 'Mutation',
			subscription: 'Subscription',
		};
		const result = getRootSchemaStatement({ rootTypeNames });
		strictEqual(result, null);
	});

	it('should return schema statement with custom root types', () => {
		const rootTypeNames = {
			query: 'CustomQuery',
			mutation: 'Mutation',
			subscription: 'CustomSubscription',
		};
		const result = getRootSchemaStatement({ rootTypeNames });
		deepStrictEqual(result, {
			statement: 'schema',
			nestedStatements: [{ statement: 'query: CustomQuery' }, { statement: 'subscription: CustomSubscription' }],
		});
	});
});

describe('getRootTypes', () => {
	afterEach(() => {
		getRootTypeFieldsMock.mock.resetCalls();
	});

	it('should return an array of root types', () => {
		const containers = [
			{
				jsonSchema: {
					entity1: JSON.stringify({
						properties: {
							field1: { type: 'String' },
						},
						required: ['field1'],
					}),
				},
				entityData: {
					entity1: [{ operationType: 'Query' }],
				},
			},
		];
		const rootTypeNames = {
			query: 'CustomQuery',
			mutation: 'Mutation',
			subscription: 'Subscription',
		};
		getRootTypeFieldsMock.mock.mockImplementation(() => [{ statement: 'field1: String!' }]);

		const result = getRootTypes({
			containers,
			rootTypeNames,
			definitionsIdToNameMap: {},
		});

		deepStrictEqual(result, [
			{
				statement: 'type CustomQuery',
				nestedStatements: [{ statement: 'field1: String!' }],
			},
		]);
	});
});

describe('getRootType', () => {
	afterEach(() => {
		getRootTypeFieldsMock.mock.resetCalls();
	});

	it('should return null if no entities match the root type', () => {
		const containers = [
			{
				jsonSchema: {
					entity1: JSON.stringify({
						properties: {
							field1: { type: 'String' },
						},
						required: ['field1'],
					}),
				},
				entityData: {
					entity1: [{ operationType: 'Mutation' }],
				},
			},
		];
		const result = getRootType({
			containers,
			rootTypeName: 'CustomQuery',
			definitionsIdToNameMap: {},
			rootType: 'Query',
		});
		strictEqual(result, null);
	});

	it('should return root type with nested statements', () => {
		const containers = [
			{
				jsonSchema: {
					entity1: JSON.stringify({
						properties: {
							field1: { type: 'String' },
						},
						required: ['field1'],
					}),
				},
				entityData: {
					entity1: [{ operationType: 'Query' }],
				},
			},
		];
		getRootTypeFieldsMock.mock.mockImplementation(() => [{ statement: 'field1: String!' }]);

		const result = getRootType({
			containers,
			rootTypeName: 'CustomQuery',
			definitionsIdToNameMap: {},
			rootType: 'Query',
		});
		deepStrictEqual(result, {
			statement: 'type CustomQuery',
			nestedStatements: [{ statement: 'field1: String!' }],
		});
	});

	it('should deactivate fields if container or entity is deactivated', () => {
		const containers = [
			{
				containerData: [{ isActivated: false }],
				jsonSchema: {
					entity1: JSON.stringify({
						properties: {
							field1: { type: 'String', isActivated: true },
						},
						required: ['field1'],
					}),
				},
				entityData: {
					entity1: [{ operationType: 'Query' }],
				},
			},
		];
		getRootTypeFieldsMock.mock.mockImplementation(() => [{ statement: 'field1: String!', isActivated: true }]);

		const result = getRootType({
			containers,
			rootTypeName: 'CustomQuery',
			definitionsIdToNameMap: {},
			rootType: 'Query',
		});
		deepStrictEqual(result, {
			statement: 'type CustomQuery',
			nestedStatements: [{ statement: 'field1: String!', isActivated: false }],
		});
	});
});

describe('getSchemaRootTypeStatements', () => {
	afterEach(() => {
		formatFEStatementMock.mock.resetCalls();
		getRootTypeFieldsMock.mock.resetCalls();
	});

	it('should return formatted root type statements', () => {
		const containers = [
			{
				jsonSchema: {
					entity1: JSON.stringify({
						properties: {
							field1: { type: 'String' },
						},
						required: ['field1'],
					}),
				},
				entityData: {
					entity1: [{ operationType: 'Query' }],
				},
			},
		];
		const definitionsIdToNameMap = {};
		getRootTypeFieldsMock.mock.mockImplementation(() => [{ statement: 'field1: String!' }]);
		formatFEStatementMock.mock.mockImplementation(
			({ feStatement }) =>
				feStatement.statement +
				'\n' +
				feStatement.nestedStatements.map(({ statement }) => statement).join('\n'),
		);

		const result = getSchemaRootTypeStatements({ containers, definitionsIdToNameMap });

		strictEqual(result, 'type Query\nfield1: String!');
	});
});
