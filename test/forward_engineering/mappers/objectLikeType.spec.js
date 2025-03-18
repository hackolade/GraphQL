const { describe, it, mock, afterEach } = require('node:test');
const { strictEqual, deepStrictEqual } = require('assert');

const joinInlineStatementsMock = mock.fn();
const getDirectivesUsageStatementMock = mock.fn(() => '');
const getImplementsInterfacesStatementMock = mock.fn(() => '');

mock.module('../../../forward_engineering/helpers/feStatementJoinHelper', {
	namedExports: {
		joinInlineStatements: joinInlineStatementsMock,
	},
});
mock.module('../../../forward_engineering/mappers/directiveUsageStatements', {
	namedExports: {
		getDirectivesUsageStatement: getDirectivesUsageStatementMock,
	},
});
mock.module('../../../forward_engineering/mappers/implementsInterfaces', {
	namedExports: {
		getImplementsInterfacesStatement: getImplementsInterfacesStatementMock,
	},
});

// This require should be after the mocks to ensure that the mocks are applied before the module is required
const { getObjectLikeTypes } = require('../../../forward_engineering/mappers/objectLikeType');

describe('getObjectLikeTypes', () => {
	const definitionsIdToNameMap = {};

	afterEach(() => {
		joinInlineStatementsMock.mock.resetCalls();
		getDirectivesUsageStatementMock.mock.resetCalls();
		getImplementsInterfacesStatementMock.mock.resetCalls();
	});

	it('should map object types to FEStatements', () => {
		const objectTypes = {
			User: {
				description: 'A user object',
				isActivated: true,
				properties: {
					id: { type: 'ID', description: 'The user id', isActivated: true },
					name: { type: 'String', isActivated: false },
				},
				required: ['id'],
				typeDirectives: [{ directiveFormat: 'Raw', rawDirective: '@key' }],
				implementsInterfaces: ['Node'],
			},
		};

		getImplementsInterfacesStatementMock.mock.mockImplementationOnce(() => 'implements Node');
		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '@key');
		joinInlineStatementsMock.mock.mockImplementationOnce(({ statements }) => statements.filter(Boolean).join(' '));

		const result = getObjectLikeTypes({
			objectTypes,
			definitionsIdToNameMap,
			typeKeyword: 'type',
			// eslint-disable-next-line jsdoc/require-jsdoc
			getFieldsFunction: ({ fields, requiredFields }) =>
				Object.entries(fields).map(([name, fieldData]) => ({
					statement: `${name}: ${fieldData.type}${requiredFields.includes(name) ? '!' : ''}`,
					description: fieldData.description,
					isActivated: fieldData.isActivated,
				})),
		});

		strictEqual(result.length, 1);
		deepStrictEqual(result[0], {
			statement: 'type User implements Node @key',
			description: 'A user object',
			isActivated: true,
			nestedStatements: [
				{ statement: 'id: ID!', description: 'The user id', isActivated: true },
				{ statement: 'name: String', description: undefined, isActivated: false },
			],
		});
	});

	it('should map interface types to FEStatements', () => {
		const interfaceTypes = {
			Node: {
				description: 'A node interface',
				isActivated: true,
				properties: {
					id: { type: 'ID', isActivated: true },
				},
				required: ['id'],
				typeDirectives: [],
				implementsInterfaces: [],
			},
		};

		getImplementsInterfacesStatementMock.mock.mockImplementationOnce(() => '');
		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '');
		joinInlineStatementsMock.mock.mockImplementationOnce(({ statements }) => statements.filter(Boolean).join(' '));

		const result = getObjectLikeTypes({
			objectTypes: interfaceTypes,
			definitionsIdToNameMap,
			typeKeyword: 'interface',
			// eslint-disable-next-line jsdoc/require-jsdoc
			getFieldsFunction: ({ fields, requiredFields }) =>
				Object.entries(fields).map(([name, fieldData]) => ({
					statement: `${name}: ${fieldData.type}${requiredFields.includes(name) ? '!' : ''}`,
					description: fieldData.description,
					isActivated: fieldData.isActivated,
				})),
		});

		strictEqual(result.length, 1);
		deepStrictEqual(result[0], {
			statement: 'interface Node',
			description: 'A node interface',
			isActivated: true,
			nestedStatements: [{ statement: 'id: ID!', description: undefined, isActivated: true }],
		});
	});

	it('should map input types to FEStatements without implements statement', () => {
		const inputTypes = {
			UserInput: {
				description: 'A user input object',
				isActivated: true,
				properties: {
					name: { type: 'String', isActivated: true },
					age: { type: 'Int', isActivated: false },
				},
				required: ['name'],
				typeDirectives: [],
			},
		};

		getImplementsInterfacesStatementMock.mock.mockImplementationOnce(() => '');
		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '');
		joinInlineStatementsMock.mock.mockImplementationOnce(({ statements }) => statements.filter(Boolean).join(' '));

		const result = getObjectLikeTypes({
			objectTypes: inputTypes,
			definitionsIdToNameMap,
			typeKeyword: 'input',
			// eslint-disable-next-line jsdoc/require-jsdoc
			getFieldsFunction: ({ fields, requiredFields }) =>
				Object.entries(fields).map(([name, fieldData]) => ({
					statement: `${name}: ${fieldData.type}${requiredFields.includes(name) ? '!' : ''}`,
					description: fieldData.description,
					isActivated: fieldData.isActivated,
				})),
		});

		strictEqual(result.length, 1);
		deepStrictEqual(result[0], {
			statement: 'input UserInput',
			description: 'A user input object',
			isActivated: true,
			nestedStatements: [
				{ statement: 'name: String!', description: undefined, isActivated: true },
				{ statement: 'age: Int', description: undefined, isActivated: false },
			],
		});

		// verify that getImplementsInterfacesStatementMock was not called for input types
		strictEqual(getImplementsInterfacesStatementMock.mock.calls.length, 0);
	});
});
