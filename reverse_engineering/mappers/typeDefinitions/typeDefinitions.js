/**
 * @import {DirectiveDefinition, FieldsOrder} from "../../../shared/types/types"
 */

const { astNodeKind } = require('../../constants/graphqlAST');
const { findNodesByKind } = require('../../helpers/findNodesByKind');
const { sortByName } = require('../../helpers/sortByName');
const { getDirectiveTypeDefinitions } = require('./directive');

/**
 * Gets the type definitions structure
 *
 * @param {object} params
 * @param {object[]} params.typeDefinitions - The type definitions nodes
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {object} The mapped type definitions
 */
function getTypeDefinitions({ typeDefinitions, fieldsOrder }) {
	const directives = getDirectiveTypeDefinitions({
		directives: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.DIRECTIVE_DEFINITION }),
	});

	const definitions = getTypeDefinitionsStructure({ fieldsOrder, directives });

	return definitions;
}

/**
 * Creates the model definitions structure
 *
 * @param {object} params
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @param {DirectiveDefinition[]} params.directives - The directive definitions
 * @returns {object} The type definitions structure
 */
function getTypeDefinitionsStructure({ fieldsOrder, directives }) {
	const definitions = {
		['Directives']: getDefinitionCategoryStructure({
			fieldsOrder,
			subtype: 'directive',
			properties: directives,
		}),
	};

	return {
		definitions,
	};
}

/**
 * Creates a definition category structure
 *
 * @param {object} params
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @param {string} params.subtype - The subtype of the definition
 * @param {object[]} params.properties - The properties to structure
 * @returns {object} The definition category structure
 */
function getDefinitionCategoryStructure({ fieldsOrder, subtype, properties }) {
	const sortedFields = sortByName({ items: properties, fieldsOrder });

	return {
		type: 'type',
		subtype,
		structureType: true,
		properties: sortedFields.reduce((acc, prop) => {
			acc[prop.name] = prop;
			return acc;
		}, {}),
	};
}

module.exports = {
	getTypeDefinitions,
};
