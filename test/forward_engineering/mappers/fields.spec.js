const { describe, it, mock, afterEach } = require('node:test');
const { strictEqual, deepStrictEqual } = require('assert');

const joinInlineStatementsMock = mock.fn();
const getDefinitionNameFromReferencePathMock = mock.fn(() => '');
const getArgumentsMock = mock.fn(() => ({ argumentsStatement: '', argumentsWarningComment: '' }));
const getDirectivesUsageStatementMock = mock.fn(() => '');
const getFieldDefaultValueStatementMock = mock.fn(() => '');

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
mock.module('../../../forward_engineering/mappers/directiveUsageStatements', {
	namedExports: {
		getDirectivesUsageStatement: getDirectivesUsageStatementMock,
	},
});
mock.module('../../../forward_engineering/mappers/fieldDefaultValue', {
	namedExports: {
		getFieldDefaultValueStatement: getFieldDefaultValueStatementMock,
	},
});

// This require should be after the mocks to ensure that the mocks are applied before the module is required
const {
	getObjectTypeFields,
	getInterfaceTypeFields,
	getInputTypeFields,
	mapField,
	getFieldType,
} = require('../../../forward_engineering/mappers/fields');

describe('mapField', () => {
	afterEach(() => {
		getDirectivesUsageStatementMock.mock.resetCalls();
		getDefinitionNameFromReferencePathMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		getArgumentsMock.mock.resetCalls();
		getFieldDefaultValueStatementMock.mock.resetCalls();
	});

	it('should map a field to an FEStatement', () => {
		const name = 'field1';
		const fieldData = { type: 'String', description: 'A string field', isActivated: true };
		const required = true;
		const definitionsIdToNameMap = {};

		getArgumentsMock.mock.mockImplementationOnce(() => ({ argumentsStatement: '', argumentsWarningComment: '' }));
		joinInlineStatementsMock.mock.mockImplementationOnce(() => name, 0);
		joinInlineStatementsMock.mock.mockImplementationOnce(() => `${name}: String`, 1);
		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '');

		const result = mapField({
			name,
			fieldData,
			required,
			definitionsIdToNameMap,
			addArguments: true,
			addDefaultValue: false,
		});

		deepStrictEqual(result, {
			statement: `${name}: String`,
			description: 'A string field',
			isActivated: true,
			comment: '',
		});
	});

	it('should map a field to an FEStatement with default value', () => {
		const name = 'field1';
		const fieldData = {
			type: 'String',
			description: 'A string field',
			isActivated: true,
			default: 'defaultString',
		};
		const required = false;
		const definitionsIdToNameMap = {};

		joinInlineStatementsMock.mock.mockImplementationOnce(() => name, 0);
		joinInlineStatementsMock.mock.mockImplementationOnce(() => `${name}: String`, 1);
		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '');
		getFieldDefaultValueStatementMock.mock.mockImplementationOnce(() => '= "defaultString"');

		const result = mapField({
			name,
			fieldData,
			required,
			definitionsIdToNameMap,
			addArguments: false,
			addDefaultValue: true,
		});

		deepStrictEqual(result, {
			statement: `${name}: String`,
			description: 'A string field',
			isActivated: true,
			comment: '',
		});

		// Verify that joinInlineStatementsMock was called with the correct default value
		deepStrictEqual(joinInlineStatementsMock.mock.calls[1].arguments[0].statements, [
			`${name}: String`,
			'= "defaultString"',
			'',
		]);
	});
});

describe('getObjectTypeFields', () => {
	afterEach(() => {
		getDirectivesUsageStatementMock.mock.resetCalls();
		getDefinitionNameFromReferencePathMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		getArgumentsMock.mock.resetCalls();
	});

	it('should return an array of FEStatements for object type fields', () => {
		const fields = {
			field1: { type: 'String' },
			field2: { type: 'Int' },
		};
		const requiredFields = ['field1'];
		const definitionsIdToNameMap = {};

		const result = getObjectTypeFields({ fields, requiredFields, definitionsIdToNameMap });

		strictEqual(Array.isArray(result), true);
		strictEqual(result.length, 2);
	});
});

describe('getInterfaceTypeFields', () => {
	afterEach(() => {
		getDirectivesUsageStatementMock.mock.resetCalls();
		getDefinitionNameFromReferencePathMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		getArgumentsMock.mock.resetCalls();
	});

	it('should return an array of FEStatements for interface type fields', () => {
		const fields = {
			field1: { type: 'String' },
			field2: { type: 'Int' },
		};
		const requiredFields = ['field1'];
		const definitionsIdToNameMap = {};

		const result = getInterfaceTypeFields({ fields, requiredFields, definitionsIdToNameMap });

		strictEqual(Array.isArray(result), true);
		strictEqual(result.length, 2);
	});
});

describe('getInputTypeFields', () => {
	afterEach(() => {
		getDirectivesUsageStatementMock.mock.resetCalls();
		getDefinitionNameFromReferencePathMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		getArgumentsMock.mock.resetCalls();
	});

	it('should return an array of FEStatements for input type fields', () => {
		const fields = {
			field1: { type: 'String', default: 'defaultString' },
			field2: { type: 'Int', default: 0 },
		};
		const requiredFields = ['field1'];
		const definitionsIdToNameMap = {};

		const result = getInputTypeFields({ fields, requiredFields, definitionsIdToNameMap });

		strictEqual(Array.isArray(result), true);
		strictEqual(result.length, 2);
	});
});

describe('getFieldType', () => {
	afterEach(() => {
		getDirectivesUsageStatementMock.mock.resetCalls();
		getDefinitionNameFromReferencePathMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		getArgumentsMock.mock.resetCalls();
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
