const { astNodeKind } = require('../constants/graphqlAST');

/**
 * @import { DirectiveNode, ArgumentNode, ValueNode } from "graphql"
 * @import { DirectiveUsage } from "../types/types"
 */

/**
 * Maps the directives usage
 * @param {Object} params
 * @param {DirectiveNode[]} params.directives - The directives
 * @returns {DirectiveUsage[]} The mapped directives usage
 */
function mapDirectivesUsage({ directives = [] }) {
	return directives.map(directive => {
		return {
			directiveFormat: 'Structured',
			directiveName: directive.name.value,
			argumentValueFormat: 'Raw',
			rawArgumentValues: getRawArguments({ argumentNodes: directive.arguments }),
		};
	});
}

/**
 * Gets the raw arguments
 * @param {Object} params
 * @param {ArgumentNode[]} params.argumentNodes - The arguments
 * @returns {string} The raw arguments
 */
function getRawArguments({ argumentNodes = [] }) {
	return argumentNodes.map(arg => `${arg.name.value}: ${getArgumentValue(arg.value)}`).join(', ');
}

/**
 * Gets the string representation of an argument value
 * @param {ValueNode} value - The value node
 * @returns {string} The string representation of the value
 */
function getArgumentValue(value) {
	switch (value.astNodeKind) {
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
		case astNodeKind.OBJECT:
			return `{${value.fields.map(field => `${field.name.value}: ${getArgumentValue(field.value)}`).join(', ')}}`;
		case astNodeKind.VARIABLE:
			return `$${value.name.value}`;
		default:
			return '';
	}
}

module.exports = {
	mapDirectivesUsage,
};
