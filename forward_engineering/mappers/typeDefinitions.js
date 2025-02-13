/**
 * @import { IdToNameMap } from "../types/types"
 */

const { getCustomScalars } = require('./customScalars');
const { getEnums } = require('./enums');
const { getObjectLikeTypes } = require('./objectLikeType');
const { getUnions } = require('./unions');
const { getObjectTypeFields, getInterfaceTypeFields, getInputTypeFields } = require('./fields');

/**
 * Gets the type definition statements from model definitions.
 *
 * @param {Object} param0
 * @param {Object} param0.modelDefinitions - The model definitions object.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement[]} - The formatted type definition statements.
 */
function getTypeDefinitionStatements({ modelDefinitions, definitionsIdToNameMap }) {
	const customScalars = getCustomScalars({
		customScalars: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'scalar' }),
		definitionsIdToNameMap,
	});
	const enums = getEnums({
		enumsDefinitions: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'enum' }),
		definitionsIdToNameMap,
	});
	const objectTypes = getObjectLikeTypes({
		objectTypes: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'object' }),
		definitionsIdToNameMap,
		typeKeyword: 'type',
		getFieldsFunction: getObjectTypeFields,
	});
	const interfaceTypes = getObjectLikeTypes({
		objectTypes: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'interface' }),
		definitionsIdToNameMap,
		typeKeyword: 'interface',
		getFieldsFunction: getInterfaceTypeFields,
	});
	const inputTypes = getObjectLikeTypes({
		objectTypes: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'input' }),
		definitionsIdToNameMap,
		typeKeyword: 'input',
		getFieldsFunction: getInputTypeFields,
	});
	const unions = getUnions({ unions: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'union' }) });

	return [...customScalars, ...enums, ...objectTypes, ...interfaceTypes, ...inputTypes, ...unions];
}

/**
 * Gets the model definitions by parent's subtype, to not use definitions category name as it may change.
 *
 * @param {Object} param0 - The parameter object.
 * @param {Object} param0.modelDefinitions - The model definitions object.
 * @param {string} param0.subtype - The subtype to filter by.
 * @returns {Object} - The model definitions found by parent's subtype.
 */
function getModelDefinitionsBySubtype({ modelDefinitions, subtype }) {
	const subtypeDefinitions = Object.values(modelDefinitions.properties).find(
		definition => definition.subtype === subtype,
	);
	return subtypeDefinitions?.properties || {};
}

module.exports = {
	getTypeDefinitionStatements,
	getModelDefinitionsBySubtype,
};
