/**
 * @import {ArgumentsResultStatement, IdToNameMap, FEStatement, FEArgument} from "../../shared/types/types"
 */

const { getDirectivesUsageStatement } = require('./directiveUsageStatements');
const { getArgumentDefaultValue } = require('./argumentDefaultValue');
const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { formatFEStatement } = require('../helpers/feStatementFormatHelper');
const { addRequired } = require('../helpers/addRequiredHelper');
const { isUUID } = require('../helpers/isUUID');
const { MISSED_ARG_TYPE_COMMENT } = require('../constants/feScriptConstants');

const EMPTY_LIST = '[]';

/**
 * Gets the type of the argument with the required keyword.
 *
 * @param {object} args - Arguments object.
 * @param {FEArgument} args.graphqlArgument - The argument to map.
 * @param {IdToNameMap} [args.idToNameMap] - The ID to name map of all available types in model.
 * @returns {string} Returns the type of the argument with the required keyword
 */
const getArgumentType = ({ graphqlArgument, idToNameMap = {} }) => {
	let argumentType = idToNameMap[graphqlArgument.type] || getCheckedType({ type: graphqlArgument.type }) || '';

	if (argumentType === 'List') {
		const firstListItem = graphqlArgument.listItems?.[0] || {};
		const listTypeKey = firstListItem.type || '';
		const listItemType = idToNameMap[listTypeKey] || getCheckedType({ type: listTypeKey }) || '';

		if (!listItemType) {
			argumentType = EMPTY_LIST;
		} else {
			argumentType = `[${addRequired({ type: listItemType, required: firstListItem.required })}]`;
		}
	}

	return addRequired({ type: argumentType, required: graphqlArgument.required });
};

/**
 * Maps an argument to a string with all configured properties.
 *
 * @param {object} args - Arguments object.
 * @param {FEArgument} args.graphqlArgument - The argument to map.
 * @param {IdToNameMap} [args.idToNameMap] - The ID to name map of all available types in model.
 * @returns {FEStatement} Returns the argument as a FEStatement
 */
const mapArgument = ({ graphqlArgument, idToNameMap = {} }) => {
	const argumentName = `${graphqlArgument.name}:`;
	const argumentType = getArgumentType({ graphqlArgument, idToNameMap });
	const directivesStatement = getDirectivesUsageStatement({
		directives: graphqlArgument.directives,
		definitionsIdToNameMap: idToNameMap,
	});
	const defaultValue = graphqlArgument.default
		? `= ${getArgumentDefaultValue({ type: graphqlArgument.type, defaultValue: graphqlArgument.default })}`
		: '';

	const statement = joinInlineStatements({
		statements: [argumentName, argumentType, defaultValue, directivesStatement],
	});

	return {
		statement,
		description: graphqlArgument.description || '',
		comment: isTypeEmpty({ type: argumentType }) ? MISSED_ARG_TYPE_COMMENT : '',
	};
};

/**
 * Maps an array of arguments to a formatted string with all configured properties.
 *
 * @param {object} args - Arguments object.
 * @param {FEArgument[]} [args.graphqlArguments] - The arguments to map.
 * @param {IdToNameMap} [args.idToNameMap] - The ID to name map of all available types in model.
 * @returns {ArgumentsResultStatement} Returns an object containing the arguments as a formatted string and a warning
 *   comment if any.
 */
const getArguments = ({ graphqlArguments, idToNameMap = {} }) => {
	if (!Array.isArray(graphqlArguments) || graphqlArguments.length === 0) {
		return { argumentsStatement: '', argumentsWarningComment: '' };
	}
	const hasDescription = graphqlArguments.some(argument => argument.description);
	const argumentStatements = graphqlArguments
		.filter(argument => argument.name)
		.map(graphqlArgument => mapArgument({ graphqlArgument, idToNameMap }));

	if (argumentStatements.length === 0) {
		return { argumentsStatement: '', argumentsWarningComment: '' };
	}

	if (!hasDescription) {
		// For current state of code if arguments don't have any description we return them as a single line
		const argumentsWarningComment = argumentStatements.some(argument => argument.comment)
			? MISSED_ARG_TYPE_COMMENT
			: '';
		return {
			argumentsStatement: `(${argumentStatements.map(argument => argument.statement).join(', ')})`,
			argumentsWarningComment,
		};
	}

	const argumentsStatement = formatFEStatement({
		feStatement: {
			statement: '',
			nestedStatementsSeparator: ',\n',
			startNestedStatementsSign: '(',
			endNestedStatementsSign: ')',
			nestedStatements: argumentStatements,
		},
	});

	return { argumentsStatement, argumentsWarningComment: '' };
};

/**
 * @param {object} params
 * @param {string} params.type
 * @returns {string}
 */
function getCheckedType({ type }) {
	return isUUID(type) ? '' : type;
}

/**
 * @param {object} params
 * @param {string} params.type
 * @returns {boolean}
 */
function isTypeEmpty({ type }) {
	return !type || type === EMPTY_LIST || type === '!' || type === `${EMPTY_LIST}!`;
}

module.exports = {
	getArgumentType,
	mapArgument,
	getArguments,
};
