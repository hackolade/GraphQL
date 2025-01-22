const { describe, it, mock } = require('node:test');
const { strictEqual, deepStrictEqual } = require('assert');

const getDirectivesUsageStatementMock = mock.fn(() => '');
const getDefaultValueMock = mock.fn(() => '');
const joinInlineStatementsMock = mock.fn(() => '');
const formatFEStatementMock = mock.fn(() => '');

mock.module('../../../forward_engineering/mappers/directives', {
	namedExports: {
		getDirectivesUsageStatement: getDirectivesUsageStatementMock,
	},
});
mock.module('../../../forward_engineering/mappers/argumentDefaultValue', {
	namedExports: {
		getArgumentDefaultValue: getDefaultValueMock,
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
	it('should return the argument type if type is definition ID', () => {
		const argument = { type: '1' };
		const idToNameMap = {
			'1': 'Date',
		};

		const result = getArgumentType(argument, idToNameMap);

		strictEqual(result, 'Date');
	});

	it('should return the argument type as it is if argument type value not exist in IdToNameMap', () => {
		const argument = { type: 'String' };

		const result = getArgumentType(argument);

		strictEqual(result, 'String');
	});

	it('should return the argument type without required keyword if not required property omitted', () => {
		const argument = { type: 'String' };

		const result = getArgumentType(argument);

		strictEqual(result, 'String');
	});

	it('should return the argument type without required keyword if not required: "<Type>"', () => {
		const argument = { type: 'String', required: '<Type>' };

		const result = getArgumentType(argument);

		strictEqual(result, 'String');
	});

	it('should return the argument type with required keyword if required value: "<Type>!"', () => {
		const argument = { type: 'String', required: '<Type>!' };

		const result = getArgumentType(argument);

		strictEqual(result, 'String!');
	});

	it('should return the argument type with required keyword if required value: "[<Type>]"', () => {
		const argument = { type: 'String', required: '[<Type>]' };

		const result = getArgumentType(argument);

		strictEqual(result, '[String]');
	});

	it('should return the argument type with required keyword if required value: "[<Type>!]"', () => {
		const argument = { type: 'String', required: '[<Type>!]' };

		const result = getArgumentType(argument);

		strictEqual(result, '[String!]');
	});

	it('should return the argument type with required keyword if required value: "[<Type>!]!"', () => {
		const argument = { type: 'String', required: '[<Type>!]!' };

		const result = getArgumentType(argument);

		strictEqual(result, '[String!]!');
	});
});

describe('mapArgument', () => {
	it('should map an argument to a string with all configured properties', () => {
		const argument = {
			name: 'arg1',
			type: 'String',
			required: '<Type>',
			default: 'default',
			description: 'desc',
		};

		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '@deprecated');
		getDefaultValueMock.mock.mockImplementationOnce(() => '"default"');
		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'arg1: String = "default" @deprecated');

		const result = mapArgument(argument);

		deepStrictEqual(result, {
			statement: 'arg1: String = "default" @deprecated',
			description: 'desc',
		});
	});
});

describe('getArguments', () => {
	it('should return arguments as a single line if no descriptions are present', () => {
		const arguments = [
			{ name: 'arg1', type: 'String' },
			{ name: 'arg2', type: 'Int' },
		];

		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'arg1: String', 1);
		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'arg2: Int', 2);

		const result = getArguments(arguments);

		strictEqual(formatFEStatementMock.mock.calls.length, 0);
		strictEqual(result, '(arg1: String, arg2: Int)');
	});

	it('should return formatted arguments if descriptions are present', () => {
		const arguments = [
			{ name: 'arg1', type: 'String', description: 'Argument description 1' },
			{ name: 'arg2', type: 'Int', description: 'Argument description 2' },
		];

		formatFEStatementMock.mock.mockImplementationOnce(() => '(arg1: String, arg2: Int)');

		const result = getArguments(arguments);

		strictEqual(formatFEStatementMock.mock.calls.length, 1);
		strictEqual(result, '(arg1: String, arg2: Int)');
	});
});
