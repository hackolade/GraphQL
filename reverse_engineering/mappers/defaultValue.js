/**
 * @import {ValueNode} from "graphql"
 * @import {InputFieldDefaultValue} from "./../../shared/types/types"
 */

const { astNodeKind } = require('../constants/graphqlAST');

/**
 * Parses a default value from a ValueNode into a string representation
 *
 * @param {ValueNode} defaultValue - The default value node to parse
 * @param {boolean} [isNested] - Whether this value is nested inside an object or list. Default is `false`
 * @returns {InputFieldDefaultValue} String representation of the default value
 */
function parseDefaultValue(defaultValue, isNested = false) {
	switch (defaultValue.kind) {
		case astNodeKind.INT:
			return parseInt(defaultValue.value);
		case astNodeKind.FLOAT:
			return parseFloat(defaultValue.value);
		case astNodeKind.ENUM:
			return defaultValue.value;
		case astNodeKind.STRING:
			// Add quotes only if the string is nested in an object or list
			return isNested ? `"${defaultValue.value}"` : defaultValue.value;
		case astNodeKind.BOOLEAN:
			return defaultValue.value.toString();
		case astNodeKind.NULL:
			return 'null';
		case astNodeKind.LIST: {
			const listValues = defaultValue.values.map(value => parseDefaultValue(value, true));
			return `[${listValues.join(', ')}]`;
		}
		case astNodeKind.OBJECT: {
			const objectFields = defaultValue.fields.map(
				field => `${field.name.value}: ${parseDefaultValue(field.value, true)}`,
			);
			return `{ ${objectFields.join(', ')} }`;
		}
		default:
			return '';
	}
}

module.exports = {
	parseDefaultValue,
};
