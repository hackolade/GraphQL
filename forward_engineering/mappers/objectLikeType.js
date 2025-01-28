/**
 * @import { FEStatement, DirectivePropertyData, ObjectLikeTypeDefinition, ObjectLikeTypeDefinitions, IdToNameMap, ImplementsInterface } from "../types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');
const { getImplementsInterfacesStatement } = require('./implementsInterfaces');

/**
 * Gets the object-like types from the model definitions.
 *
 * @param {Object} param0
 * @param {ObjectLikeTypeDefinitions} param0.objectTypes - The object-like types to get.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @param {string} param0.typeKeyword - The type keyword ("type", "interface", "input").
 * @param {Function} param0.getFieldsFunction - The function to get fields for the type.
 * @returns {FEStatement[]} - The object-like types.
 */
function getObjectLikeTypes({ objectTypes, definitionsIdToNameMap, typeKeyword, getFieldsFunction }) {
	return Object.entries(objectTypes).map(([name, objectType]) =>
		mapObjectLikeType({ name, objectType, definitionsIdToNameMap, typeKeyword, getFieldsFunction }),
	);
}

/**
 * Maps an object-like type to an FEStatement.
 *
 * @param {Object} param0
 * @param {string} param0.name - The name of the object.
 * @param {ObjectLikeTypeDefinition} param0.objectType - The object-like type definition object.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @param {string} param0.typeKeyword - The type keyword ("type", "interface", "input").
 * @param {Function} param0.getFieldsFunction - The function to get fields for the type.
 * @returns {FEStatement}
 */
function mapObjectLikeType({ name, objectType, definitionsIdToNameMap, typeKeyword, getFieldsFunction }) {
	const nameStatement = `${typeKeyword} ${name}`;

	let implementsInterfacesStatement = '';
	if (typeKeyword === 'type' || typeKeyword === 'interface') {
		implementsInterfacesStatement = getImplementsInterfacesStatement({
			interfaces: objectType.implementsInterfaces,
			definitionsIdToNameMap,
		});
	}

	const directivesStatement = getDirectivesUsageStatement({ directives: objectType.typeDirectives });

	return {
		statement: joinInlineStatements({
			statements: [nameStatement, implementsInterfacesStatement, directivesStatement],
		}),
		description: objectType.description,
		isActivated: objectType.isActivated,
		nestedStatements: getFieldsFunction({
			fields: objectType.properties,
			requiredFields: objectType.required,
			definitionsIdToNameMap,
		}),
	};
}

module.exports = {
	getObjectLikeTypes,
};
