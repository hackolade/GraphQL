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
	getRootSchemaStatement,
	getRootTypeNames,
	getRootTypes,
	getRootType,
} = require('../../../forward_engineering/mappers/rootTypes');

describe('getRootTypeNames', () => {
	it('should return default root type names if no container properties are provided', () => {
		const result = getRootTypeNames({ containerProperties: [] });
		deepStrictEqual(result, {
			query: 'Query',
			mutation: 'Mutation',
			subscription: 'Subscription',
		});
	});

	it('should return trimmed root type names from container properties', () => {
		const containerProperties = {
			schemaRootTypes: {
				rootQuery: ' CustomQuery ',
				rootMutation: 'CustomMutation',
				rootSubscription: ' CustomSubscription ',
			},
		};
		const result = getRootTypeNames({ containerProperties });
		deepStrictEqual(result, {
			query: 'CustomQuery',
			mutation: 'CustomMutation',
			subscription: 'CustomSubscription',
		});
	});

	it('should ignore empty root type names from container properties', () => {
		const containerProperties = {
			schemaRootTypes: {
				rootQuery: ' ',
				rootMutation: '',
				rootSubscription: ' CustomSubscription ',
			},
		};
		const result = getRootTypeNames({ containerProperties });
		deepStrictEqual(result, {
			query: 'Query',
			mutation: 'Mutation',
			subscription: 'CustomSubscription',
		});
	});
});

describe('getRootSchemaStatement', () => {
	it('should return schema with all present root types', () => {
		const rootTypeNames = {
			query: 'Query',
			mutation: 'Mutation',
			subscription: 'Subscription',
		};
		const rootTypeStatements = [
			{ statement: 'type Query' },
			{ statement: 'type Mutation' },
			{ statement: 'type Subscription' },
		];
		const result = getRootSchemaStatement({ rootTypeNames, rootTypeStatements });
		deepStrictEqual(result, {
			statement: 'schema',
			description: '',
			nestedStatements: [
				{ statement: 'query: Query' },
				{ statement: 'mutation: Mutation' },
				{ statement: 'subscription: Subscription' },
			],
		});
	});

	it('should return schema statement with custom root types', () => {
		const rootTypeNames = {
			query: 'CustomQuery',
			mutation: 'Mutation',
			subscription: 'CustomSubscription',
		};
		const rootTypeStatements = [
			{ statement: 'type CustomQuery' },
			{ statement: 'type Mutation' },
			{ statement: 'type CustomSubscription' },
		];
		const result = getRootSchemaStatement({ rootTypeNames, rootTypeStatements });
		deepStrictEqual(result, {
			statement: 'schema',
			description: '',
			nestedStatements: [
				{ statement: 'query: CustomQuery' },
				{ statement: 'mutation: Mutation' },
				{ statement: 'subscription: CustomSubscription' },
			],
		});
	});

	it('should return schema statement with only present custom root types', () => {
		const rootTypeNames = {
			query: 'CustomQuery',
			mutation: 'Mutation',
			subscription: 'CustomSubscription',
		};
		const rootTypeStatements = [{ statement: 'type CustomQuery' }];
		const result = getRootSchemaStatement({
			rootTypeNames,
			rootTypeStatements,
			containerProperties: { description: 'Graph description' },
		});
		deepStrictEqual(result, {
			statement: 'schema',
			description: 'Graph description',
			nestedStatements: [{ statement: 'query: CustomQuery' }],
		});
	});

	it('should return null if no root types are present', () => {
		const rootTypeNames = {
			query: 'CustomQuery',
			mutation: 'Mutation',
			subscription: 'CustomSubscription',
		};
		const rootTypeStatements = [];
		const result = getRootSchemaStatement({ rootTypeNames, rootTypeStatements });
		strictEqual(result, null);
	});
});

describe('getRootTypes', () => {
	afterEach(() => {
		getRootTypeFieldsMock.mock.resetCalls();
	});

	it('should return an array of root types', () => {
		const entitiesJsonSchema = {
			entity1: JSON.stringify({
				properties: {
					field1: { type: 'String' },
				},
				required: ['field1'],
			}),
		};
		const entityProperties = {
			entity1: [{ operationType: 'Query' }],
		};
		const rootTypeNames = {
			query: 'CustomQuery',
			mutation: 'Mutation',
			subscription: 'Subscription',
		};
		getRootTypeFieldsMock.mock.mockImplementation(() => [{ statement: 'field1: String!' }]);

		const result = getRootTypes({
			entitiesJsonSchema,
			entityProperties,
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
		const entitiesJsonSchema = {
			entity1: JSON.stringify({
				properties: {
					field1: { type: 'String' },
				},
				required: ['field1'],
			}),
		};
		const entityProperties = {
			entity1: [{ operationType: 'Mutation' }],
		};
		const result = getRootType({
			entitiesJsonSchema,
			entityProperties,
			rootTypeName: 'CustomQuery',
			definitionsIdToNameMap: {},
			rootType: 'Query',
		});
		strictEqual(result, null);
	});

	it('should return root type with nested statements', () => {
		const entitiesJsonSchema = {
			entity1: JSON.stringify({
				properties: {
					field1: { type: 'String' },
				},
				required: ['field1'],
			}),
		};
		const entityProperties = {
			entity1: [{ operationType: 'Query' }],
		};
		getRootTypeFieldsMock.mock.mockImplementation(() => [{ statement: 'field1: String!' }]);

		const result = getRootType({
			entitiesJsonSchema,
			entityProperties,
			rootTypeName: 'CustomQuery',
			definitionsIdToNameMap: {},
			rootType: 'Query',
		});
		deepStrictEqual(result, {
			statement: 'type CustomQuery',
			nestedStatements: [{ statement: 'field1: String!' }],
		});
	});

	it('should deactivate fields if entity is deactivated', () => {
		const entitiesJsonSchema = {
			entity1: JSON.stringify({
				properties: {
					field1: { type: 'String', isActivated: true },
				},
				required: ['field1'],
				isActivated: false,
			}),
		};
		const entityProperties = {
			entity1: [{ operationType: 'Query' }],
		};
		getRootTypeFieldsMock.mock.mockImplementation(() => [{ statement: 'field1: String!', isActivated: true }]);

		const result = getRootType({
			entitiesJsonSchema,
			entityProperties,
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

// describe('getSchemaRootTypeStatements', () => {
// 	afterEach(() => {
// 		formatFEStatementMock.mock.resetCalls();
// 		getRootTypeFieldsMock.mock.resetCalls();
// 	});
//
// 	it('should return formatted root type statements', () => {
// 		const containerProperties = [];
// 		const entitiesJsonSchema = {
// 			entity1: JSON.stringify({
// 				properties: {
// 					field1: { type: 'String' },
// 				},
// 				required: ['field1'],
// 			}),
// 		};
// 		const entityProperties = {
// 			entity1: [{ operationType: 'Query' }],
// 		};
// 		const definitionsIdToNameMap = {};
// 		getRootTypeFieldsMock.mock.mockImplementation(() => [{ statement: 'field1: String!' }]);
// 		formatFEStatementMock.mock.mockImplementation(
// 			({ feStatement }) =>
// 				feStatement.statement +
// 				'\n' +
// 				feStatement.nestedStatements.map(({ statement }) => statement).join('\n'),
// 		);
//
// 		const result = getSchemaRootTypeStatements({
// 			containerProperties,
// 			entitiesJsonSchema,
// 			entityProperties,
// 			definitionsIdToNameMap,
// 		});
//
// 		strictEqual(result, 'schema\nquery: Query\n\ntype Query\nfield1: String!');
// 	});
// });
