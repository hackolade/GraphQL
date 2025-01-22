const { formatFEStatement } = require('../helpers/feStatementFormatHelper');
const { getCustomScalars } = require('./customScalars');
const { getEnums } = require('./enums');
const { getUnions } = require('./unions');

/**
 * Gets the type definition statements from model definitions.
 *
 * @param {Object} param0
 * @param {Object} param0.modelDefinitions - The model definitions object.
 * @returns {string} - The formatted type definition statements.
 */
function getTypeDefinitionStatements({ modelDefinitions }) {
	const customScalars = getCustomScalars({
		customScalars: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'scalar' }),
	});
	const enums = getEnums({ enumsDefinitions: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'enum' }) });
	const unions = getUnions({ unions: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'union' }) });

	const typeDefinitions = [...customScalars, ...enums, ...unions];
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
