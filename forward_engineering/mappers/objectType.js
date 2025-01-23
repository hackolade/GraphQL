/**
 * @import { FEStatement, DirectivePropertyData, ObjectTypeDefinition, ObjectTypeDefinitions, IdToNameMap, ImplementsInterface } from "../types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directives');
const { getFields } = require('./fields');
const { getImplementsInterfacesStatement } = require('./implementsInterfaces');

/**
 * Gets the object types from the model definitions.
 *
 * @param {Object} param0
 * @param {ObjectTypeDefinitions} param0.objectTypes - The object types to get.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement[]} - The object types.
 */
function getObjectTypes({ objectTypes, definitionsIdToNameMap }) {
	return Object.entries(objectTypes).map(([name, objectType]) =>
		mapObjectType({ name, objectType, definitionsIdToNameMap }),
	);
}

/**
 * Maps an object type to an FEStatement.
 *
 * @param {Object} param0
 * @param {string} param0.name - The name of the object.
 * @param {ObjectTypeDefinition} param0.objectType - The object type definition object.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement}
 */
function mapObjectType({ name, objectType, definitionsIdToNameMap }) {
	const nameStatement = `type ${name}`;
	const implementsInterfacesStatement = getImplementsInterfacesStatement({
		interfaces: objectType.implementsInterfaces,
		definitionsIdToNameMap,
	});
	const directivesStatement = getDirectivesUsageStatement({ directives: objectType.typeDirectives });

	return {
		statement: joinInlineStatements({
			statements: [nameStatement, implementsInterfacesStatement, directivesStatement],
		}),
		description: objectType.description,
		isActivated: objectType.isActivated,
		nestedStatements: getFields({
			fields: objectType.properties,
			requiredFields: objectType.required,
			definitionsIdToNameMap,
		}),
	};
}

module.exports = {
	getObjectTypes,
};
