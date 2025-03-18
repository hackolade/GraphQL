/**
 * @import {DirectiveNode, ArgumentNode, ValueNode} from "graphql"
 * @import {DirectiveUsage} from "../../shared/types/types"
 */

const { astNodeKind } = require('../constants/graphqlAST');
const { DIRECTIVE_FORMAT, ARGUMENT_VALUE_FORMAT } = require('../constants/properties');

/**
 * Maps the directives usage
 *
 * @param {object} params
 * @param {DirectiveNode[]} [params.directives] - The directives
 * @returns {DirectiveUsage[]} The mapped directives usage
 */
function mapDirectivesUsage({ directives = [] }) {
	return directives.map(directive => {
		return {
			directiveFormat: DIRECTIVE_FORMAT.structured,
			directiveName: directive.name.value,
			argumentValueFormat: ARGUMENT_VALUE_FORMAT.raw,
			rawArgumentValues: getRawArguments({ argumentNodes: [...(directive.arguments || [])] }),
		};
	});
}

/**
 * Gets the raw arguments
 *
 * @param {object} params
 * @param {ArgumentNode[]} [params.argumentNodes] - The arguments
 * @returns {string} The raw arguments
 */
function getRawArguments({ argumentNodes = [] }) {
	return argumentNodes.map(arg => `${arg.name.value}: ${getArgumentValue(arg.value)}`).join(', ');
}

/**
 * Gets the string representation of an argument value
 *
 * @param {ValueNode} value - The value node
 * @returns {string} The string representation of the value
 */
function getArgumentValue(value) {
	switch (value.kind) {
		case astNodeKind.INT:
		case astNodeKind.FLOAT:
			return value.value;
		case astNodeKind.STRING:
			return `"${value.value}"`;
		case astNodeKind.BOOLEAN:
			return value.value.toString();
		case astNodeKind.NULL:
			return 'null';
		case astNodeKind.ENUM:
			return value.value;
		case astNodeKind.LIST:
			return `[${value.values.map(getArgumentValue).join(', ')}]`;
		case astNodeKind.OBJECT: {
			const fieldStrings = value.fields.map(field => {
				const fieldName = field.name.value;
				const fieldValue = getArgumentValue(field.value);
				return `${fieldName}: ${fieldValue}`;
			});
			return `{${fieldStrings.join(', ')}}`;
		}
		case astNodeKind.VARIABLE:
			return `$${value.name.value}`;
		default:
			return '';
	}
}

module.exports = {
	mapDirectivesUsage,
};
