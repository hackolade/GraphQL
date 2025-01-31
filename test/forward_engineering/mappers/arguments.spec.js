const { describe, it, mock, afterEach } = require('node:test');
const { strictEqual, deepStrictEqual } = require('assert');

const getDirectivesUsageStatementMock = mock.fn(() => '');
const getArgumentDefaultValueMock = mock.fn(() => '');
const joinInlineStatementsMock = mock.fn(() => '');
const formatFEStatementMock = mock.fn(() => '');

mock.module('../../../forward_engineering/mappers/directiveUsageStatements', {
	namedExports: {
		getDirectivesUsageStatement: getDirectivesUsageStatementMock,
	},
});
mock.module('../../../forward_engineering/mappers/argumentDefaultValue', {
	namedExports: {
		getArgumentDefaultValue: getArgumentDefaultValueMock,
	},
});
mock.module('../../../forward_engineering/helpers/feStatementJoinHelper', {
	namedExports: {
		joinInlineStatements: joinInlineStatementsMock,
	},
});
mock.module('../../../forward_engineering/helpers/feStatementFormatHelper', {
	namedExports: {
		formatFEStatement: formatFEStatementMock,
	},
});

// This require should be after the mocks to ensure that the mocks are applied before the module is required
const { getArguments, getArgumentType, mapArgument } = require('../../../forward_engineering/mappers/arguments');

describe('getArgumentType', () => {
	afterEach(() => {
		getDirectivesUsageStatementMock.mock.resetCalls();
		getArgumentDefaultValueMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		formatFEStatementMock.mock.resetCalls();
	});

	it('should return the argument type if type is definition ID', () => {
		const graphqlArgument = { type: '1' };
		const idToNameMap = {
			'1': 'Date',
		};

		const result = getArgumentType({ graphqlArgument, idToNameMap });

		strictEqual(result, 'Date');
	});

	it('should return the argument type as it is if argument type value not exist in IdToNameMap', () => {
		const graphqlArgument = { type: 'String' };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, 'String');
	});

	it('should return the argument type without required keyword if not required property omitted', () => {
		const graphqlArgument = { type: 'String' };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, 'String');
	});

	it('should return the argument type without required keyword if not required', () => {
		const graphqlArgument = { type: 'String', required: false };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, 'String');
	});

	it('should return the argument type with required keyword if required value', () => {
		const graphqlArgument = { type: 'String', required: true };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, 'String!');
	});

	it('should return the argument type without required option for List and List item', () => {
		const graphqlArgument = { type: 'List', required: false, listItems: [{ type: 'String', required: false }] };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, '[String]');
	});

	it('should return the argument type with required option only for List item', () => {
		const graphqlArgument = { type: 'List', required: false, listItems: [{ type: 'String', required: true }] };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, '[String!]');
	});

	it('should return the argument type with required option if List and List item are required"', () => {
		const graphqlArgument = { type: 'List', required: true, listItems: [{ type: 'String', required: true }] };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, '[String!]!');
	});

	it('should return the argument type without required option if List and List item have omit required property"', () => {
		const graphqlArgument = { type: 'List', listItems: [{ type: 'String' }] };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, '[String]');
	});

	it('should return the argument type with empty array symbol when listItems are missed"', () => {
		const graphqlArgument = { type: 'List' };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, '[]');
	});

	it('should return the argument type with empty array symbol when listItems has missed type name"', () => {
		const graphqlArgument = { type: 'List', listItems: [{ required: true }] };

		const result = getArgumentType({ graphqlArgument });

		strictEqual(result, '[]');
	});
});

describe('mapArgument', () => {
	afterEach(() => {
		getDirectivesUsageStatementMock.mock.resetCalls();
		getArgumentDefaultValueMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		formatFEStatementMock.mock.resetCalls();
	});

	it('should map an argument to a string with all configured properties', () => {
		const graphqlArgument = {
			name: 'arg1',
			type: 'String',
			required: false,
			default: 'default',
			description: 'desc',
		};

		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '@deprecated');
		getArgumentDefaultValueMock.mock.mockImplementationOnce(() => '"default"');
		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'arg1: String = "default" @deprecated');

		const result = mapArgument({ graphqlArgument });

		deepStrictEqual(result, {
			statement: 'arg1: String = "default" @deprecated',
			description: 'desc',
		});
	});

	it("should map an argument to an empty string when an argument doesn't have name", () => {
		const graphqlArgument = {
			type: 'String',
			required: false,
		};

		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '');
		getArgumentDefaultValueMock.mock.mockImplementationOnce(() => '');
		joinInlineStatementsMock.mock.mockImplementationOnce(() => '');

		const result = mapArgument({ graphqlArgument });

		deepStrictEqual(result, {
			statement: '',
			description: '',
		});
	});
});

describe('getArguments', () => {
	afterEach(() => {
		getDirectivesUsageStatementMock.mock.resetCalls();
		getArgumentDefaultValueMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		formatFEStatementMock.mock.resetCalls();
	});

	it('should return arguments as a single line if no descriptions are present', () => {
		const graphqlArguments = [
			{ name: 'arg1', type: 'String' },
			{ name: 'arg2', type: 'Int' },
		];

		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'arg1: String', 0);
		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'arg2: Int', 1);

		const result = getArguments({ graphqlArguments });

		strictEqual(formatFEStatementMock.mock.calls.length, 0);
		strictEqual(result, '(arg1: String, arg2: Int)');
	});

	it('should return formatted arguments if descriptions are present', () => {
		const graphqlArguments = [
			{ name: 'arg1', type: 'String', description: 'Argument description 1' },
			{ name: 'arg2', type: 'Int', description: 'Argument description 2' },
		];

		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'arg1: String', 0);
		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'arg2: Int', 1);

		formatFEStatementMock.mock.mockImplementationOnce(() => '(arg1: String, arg2: Int)');

		const result = getArguments({ graphqlArguments });

		strictEqual(formatFEStatementMock.mock.calls.length, 1);
		strictEqual(result, '(arg1: String, arg2: Int)');
	});

	it("should skip arguments which don't have name or type or both", () => {
		const graphqlArguments = [
			{ type: 'String' }, // missing name
			{ name: 'arg2' }, // missing type
			{ description: 'Argument description 3' }, // missing name and type
			{ name: 'arg1', type: 'String', description: 'Argument description 1' }, // valid
		];

		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'arg1: String', 0);
		formatFEStatementMock.mock.mockImplementationOnce(() => '(arg1: String)');

		const result = getArguments({ graphqlArguments });

		strictEqual(formatFEStatementMock.mock.calls.length, 1);
		strictEqual(result, '(arg1: String)');
	});

	it('should return empty string if arguments is empty list', () => {
		const graphqlArguments = [];
		const result = getArguments({ graphqlArguments });
		strictEqual(result, '');
	});

	it('should return empty string if arguments is undefined', () => {
		const graphqlArguments = undefined;
		const result = getArguments({ graphqlArguments });
		strictEqual(result, '');
	});

	it('should return empty string if arguments is not an array', () => {
		const graphqlArguments = {};
		const result = getArguments({ graphqlArguments });
		strictEqual(result, '');
	});

	it("should return empty string if all arguments don't have required properties", () => {
		const graphqlArguments = [
			{ name: 'arg1' }, // missing type
			{ type: 'String' }, // missing name
		];
		const result = getArguments({ graphqlArguments });
		strictEqual(result, '');
	});
});
