const { describe, it, mock, afterEach } = require('node:test');
const { strictEqual, deepStrictEqual } = require('assert');

const joinInlineStatementsMock = mock.fn();
const getDefinitionNameFromReferencePathMock = mock.fn(() => '');
const getArgumentsMock = mock.fn(() => '');
const getDirectivesUsageStatementMock = mock.fn(() => '');

mock.module('../../../forward_engineering/helpers/feStatementJoinHelper', {
	namedExports: {
		joinInlineStatements: joinInlineStatementsMock,
	},
});
mock.module('../../../forward_engineering/helpers/referencesHelper', {
	namedExports: {
		getDefinitionNameFromReferencePath: getDefinitionNameFromReferencePathMock,
	},
});
mock.module('../../../forward_engineering/mappers/arguments', {
	namedExports: {
		getArguments: getArgumentsMock,
	},
});
mock.module('../../../forward_engineering/mappers/directives', {
	namedExports: {
		getDirectivesUsageStatement: getDirectivesUsageStatementMock,
	},
});

// This require should be after the mocks to ensure that the mocks are applied before the module is required
const { getFields, mapField, getFieldType } = require('../../../forward_engineering/mappers/fields');

describe('mapField', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('should map a field to an FEStatement', () => {
		const name = 'field1';
		const fieldData = { type: 'String', description: 'A string field', isActivated: true };
		const required = true;
		const definitionsIdToNameMap = {};

		getArgumentsMock.mock.mockImplementationOnce(() => '');
		joinInlineStatementsMock.mock.mockImplementationOnce(() => name, 0);
		joinInlineStatementsMock.mock.mockImplementationOnce(() => `${name}: String`, 1);
		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '');

		const result = mapField({ name, fieldData, required, definitionsIdToNameMap });

		deepStrictEqual(result, {
			statement: `${name}: String`,
			description: 'A string field',
			isActivated: true,
		});
	});
});

describe('getFields', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('should return an array of FEStatements', () => {
		const fields = {
			field1: { type: 'String' },
			field2: { type: 'Int' },
		};
		const requiredFields = ['field1'];
		const definitionsIdToNameMap = {};

		const result = getFields({ fields, requiredFields, definitionsIdToNameMap });

		strictEqual(Array.isArray(result), true);
		strictEqual(result.length, 2);
	});
});

describe('getFieldType', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('should return the field type with required indicator for reference fields', () => {
		const field = { $ref: '1' };
		const required = true;

		getDefinitionNameFromReferencePathMock.mock.mockImplementationOnce(() => 'DefinitionName');

		const result = getFieldType({ field, required });

		strictEqual(result, 'DefinitionName!');
	});

	it('should return the field type with required indicator for list fields', () => {
		const field = { type: 'List', items: { type: 'String', required: true } };
		const required = true;

		const result = getFieldType({ field, required });

		strictEqual(result, '[String!]!');
	});

	it('should return the field type for nested array items', () => {
		const field = { type: 'List', items: { type: 'List', required: true, items: [{ type: 'Float' }] } };
		const required = false;

		const result = getFieldType({ field, required });

		strictEqual(result, '[[Float]!]');
	});

	it('should return the field type with required indicator for regular fields', () => {
		const field = { type: 'String' };
		const required = true;

		const result = getFieldType({ field, required });

		strictEqual(result, 'String!');
	});
});
