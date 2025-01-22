/**
 * @import { FEStatement, DirectivePropertyData, ObjectTypeDefinition } from "../types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directives');
const { getFields } = require('./fields');

/**
 * @typedef {Object.<string, EnumDefinition>} ObjectTypeDefinitions
 */

/**
 * Gets the object types from the model definitions.
 *
 * @param {Object} param0
 * @param {ObjectTypeDefinitions} param0.objectTypes - The object types to get.
 * @returns {FEStatement[]} - The object types.
 */
function getObjectTypes({ objectTypes }) {
	return Object.entries(objectTypes).map(([name, objectType]) => mapObjectType({ name, objectType }));
}

/**
 * Maps an object type to an FEStatement.
 *
 * @param {Object} param0
 * @param {string} param0.name - The name of the object.
 * @param {ObjectTypeDefinition} param0.objectType - The object type definition object.
 * @returns {FEStatement}
 */
function mapObjectType({ name, objectType }) {
	const nameStatement = `type ${name}`;
	const implementsInterfacesStatement = ''; // TODO: get interfaces
	const directivesStatement = getDirectivesUsageStatement({ directives: objectType.typeDirectives });

	return {
		statement: joinInlineStatements({
			statements: [nameStatement, implementsInterfacesStatement, directivesStatement],
		}),
		description: objectType.description,
		isActivated: objectType.isActivated,
		nestedStatements: getFields({ fields: objectType.properties, requiredFields: objectType.required }),
	};
}

module.exports = {
	getObjectTypes,
};
