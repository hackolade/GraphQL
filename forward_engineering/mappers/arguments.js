/**
 * @import { Argument, IdToNameMap, FEStatement } from "../types/types"
 */

const { getDirectivesUsageStatement } = require('./directiveUsageStatements');
const { getArgumentDefaultValue } = require('./argumentDefaultValue');
const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { formatFEStatement } = require('../helpers/feStatementFormatHelper');
const { addRequired } = require('../helpers/addRequiredHelper');

/**
 * Gets the type of the argument with the required keyword.
 * @param {Object} args - arguments object.
 * @param {Argument} args.argument - The argument to map.
 * @param {IdToNameMap} [args.idToNameMap] - The ID to name map of all available types in model.
 * @returns {string} returns the type of the argument with the required keyword
 */
const getArgumentType = ({ argument, idToNameMap = {} }) => {
	let argumentType = idToNameMap[argument.type] || argument.type;

	if (argumentType === 'List') {
		const firstListItem = argument.listItems?.[0] || {};
		const listItemType = idToNameMap[firstListItem.type] || firstListItem.type || '';

		if (!listItemType) {
			argumentType = '[]';
		} else {
			argumentType = `[${addRequired({ type: listItemType, required: firstListItem.required })}]`;
		}
	}

	return addRequired({ type: argumentType, required: argument.required });
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
		description: argument.description || '',
	};
};

/**
 * Maps an array of arguments to a formatted string with all configured properties.
 * @param {Object} args - arguments object.
 * @param {Argument[]} args.graphqlArguments - The arguments to map.
 * @param {IdToNameMap} [args.idToNameMap] - The ID to name map of all available types in model.
 * @returns {string} - returns the arguments list as a formatted string
 */
const getArguments = ({ graphqlArguments, idToNameMap = {} }) => {
	if (!Array.isArray(graphqlArguments) || graphqlArguments.length === 0) {
		return '';
	}
	const hasDescription = graphqlArguments.some(argument => argument.description);
	const argumentStatements = graphqlArguments
		.filter(argument => argument.name && argument.type)
		.map(argument => mapArgument({ argument, idToNameMap }));

	if (argumentStatements.length === 0) {
		return '';
	}

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
