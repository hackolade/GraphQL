/**
 * @import { IdToNameMap } from "../types/types"
 */

const { formatFEStatement } = require('../helpers/feStatementFormatHelper');
const { getCustomScalars } = require('./customScalars');
const { getEnums } = require('./enums');
const { getObjectTypes } = require('./objectType');

/**
 * Gets the type definition statements from model definitions.
 *
 * @param {Object} param0
 * @param {Object} param0.modelDefinitions - The model definitions object.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {string} - The formatted type definition statements.
 */
function getTypeDefinitionStatements({ modelDefinitions, definitionsIdToNameMap }) {
	const customScalars = getCustomScalars({
		customScalars: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'scalar' }),
	});
	const enums = getEnums({ enumsDefinitions: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'enum' }) });
	const objectTypes = getObjectTypes({
		objectTypes: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'object' }),
		definitionsIdToNameMap,
	});

	const typeDefinitions = [...customScalars, ...enums, ...objectTypes];
	const formattedTypeDefinitions = typeDefinitions
		.map(typeDefinition => formatFEStatement({ feStatement: typeDefinition }))
		.join('\n\n');

	return formattedTypeDefinitions;
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
};
