const { astNodeKind } = require('../../constants/graphqlAST');
const { findNodesByKind } = require('../../helpers/findNodesByKind');
const { sortByName } = require('../../helpers/sortByName');
const { getCustomScalarTypeDefinitions } = require('./customScalar');
const { getDirectiveTypeDefinitions } = require('./directive');

/**
 * @import { FieldsOrder, DirectiveDefinition, CustomScalarDefinition } from "../../types/types"
 */

/**
 * Gets the type definitions structure
 * @param {Object} params
 * @param {Object[]} params.typeDefinitions - The type definitions nodes
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {Object} The mapped type definitions
 */
function getTypeDefinitions({ typeDefinitions, fieldsOrder }) {
	const directives = getDirectiveTypeDefinitions({
		directives: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.DIRECTIVE_DEFINITION }),
	});
	const customScalars = getCustomScalarTypeDefinitions({
		customScalars: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.SCALAR_TYPE_DEFINITION }),
	});

	const definitions = getTypeDefinitionsStructure({ fieldsOrder, directives, customScalars });

	return definitions;
}

/**
 * Creates the model definitions structure
 * @param {Object} params
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @param {DirectiveDefinition[]} params.directives - The directive definitions
 * @param {CustomScalarDefinition[]} params.customScalars - The custom scalar definitions
 * @returns {Object} The type definitions structure
 */
function getTypeDefinitionsStructure({ fieldsOrder, directives, customScalars }) {
	const definitions = {
		['Directives']: getDefinitionCategoryStructure({
			fieldsOrder,
			subtype: 'directive',
			properties: directives,
		}),
		['Scalars']: getDefinitionCategoryStructure({
			fieldsOrder,
			subtype: 'scalar',
			properties: customScalars,
		}),
	};

	return {
		definitions,
	};
}

/**
 * Creates a definition category structure
 * @param {Object} params
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @param {string} params.subtype - The subtype of the definition
 * @param {Object[]} params.properties - The properties to structure
 * @returns {Object} The definition category structure
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
