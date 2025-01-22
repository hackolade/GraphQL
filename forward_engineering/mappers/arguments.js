/**
 * @import { Argument, IdToNameMap, FEStatement } from "../types/types"
 */

const { getDirectivesUsageStatement } = require('./directiveUsageStatements');
const { getArgumentDefaultValue } = require('./argumentDefaultValue');
const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { formatFEStatement } = require('../helpers/feStatementFormatHelper');

/**
 * Gets the type of the argument with the required keyword.
 * @param {Object} args - arguments object.
 * @param {Argument} args.argument - The argument to map.
 * @param {IdToNameMap} [args.idToNameMap] - The ID to name map of all available types in model.
 * @returns {string} returns the type of the argument with the required keyword
 */
const getArgumentType = ({ argument, idToNameMap = {} }) => {
	const argumentType = idToNameMap[argument.type] || argument.type;
	return argument.required ? argument.required.replace('<Type>', argumentType) : argumentType;
};

/**
 * Maps an argument to a string with all configured properties.
 * @param {Object} args - arguments object.
 * @param {Argument} args.argument - The argument to map.
 * @param {IdToNameMap} [args.idToNameMap] - The ID to name map of all available types in model.
 * @returns {FEStatement} returns the argument as a FEStatement
 */
const mapArgument = ({ argument, idToNameMap = {} }) => {
	const argumentName = `${argument.name}:`;
	const argumentType = getArgumentType({ argument, idToNameMap });
	const directivesStatement = getDirectivesUsageStatement({ directives: argument.directives });
	const defaultValue = argument.default
		? `= ${getArgumentDefaultValue({ type: argument.type, defaultValue: argument.default })}`
		: '';

	const statement = joinInlineStatements({
		statements: [argumentName, argumentType, defaultValue, directivesStatement],
	});

	return {
		statement,
		description: argument.description,
	};
};

/**
 * Maps an array of arguments to a formated string with all configured properties.
 * @param {Object} args - arguments object.
 * @param {Argument[]} args.arguments - The arguments to map.
 * @param {IdToNameMap} [args.idToNameMap] - The ID to name map of all available types in model.
 * @returns {string} - returns the arguments list as a formated string
 */
const getArguments = ({ arguments = [], idToNameMap = {} }) => {
	if (arguments.length === 0) {
		return '';
	}

	const hasDescription = arguments.some(argument => argument.description);
	const argumentStatements = arguments.map(argument => mapArgument({ argument, idToNameMap }));

	if (!hasDescription) {
		// For current state of code if arguments don't have any description we return them as a single line
		return `(${argumentStatements.map(argument => argument.statement).join(', ')})`;
	}

	return formatFEStatement({
		feStatement: {
			statement: '',
			nestedStatementsSeparator: ',\n',
			startNestedStatementsSign: '(',
			endNestedStatementsSign: ')',
			nestedStatements: argumentStatements,
		},
	});
};

module.exports = {
	getArgumentType,
	mapArgument,
	getArguments,
};
