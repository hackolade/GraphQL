/**
 * @import {DefinitionNode} from "graphql"
 * @import {REDirectiveDefinition, REDefinitionsSchema, FieldsOrder, RECustomScalarDefinition, REDefinition, DefinitionsRESchema, DefinitionREStructure, DirectiveStructureType, ScalarStructureType} from "../../../shared/types/types"
 */

const { astNodeKind } = require('../../constants/graphqlAST');
const { findNodesByKind } = require('../../helpers/findNodesByKind');
const { sortByName } = require('../../helpers/sortByName');
const { getCustomScalarTypeDefinitions } = require('./customScalar');
const { getDirectiveTypeDefinitions } = require('./directive');

/**
 * Gets the type definitions structure
 *
 * @param {object} params
 * @param {DefinitionNode[]} params.typeDefinitions - The type definitions nodes
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {DefinitionsRESchema} The mapped type definitions
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
 *
 * @param {object} params
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @param {REDirectiveDefinition[]} params.directives - The directive definitions
 * @param {RECustomScalarDefinition[]} params.customScalars - The custom scalar definitions
 * @returns {DefinitionsRESchema} The type definitions structure
 */
function getTypeDefinitionsStructure({ fieldsOrder, directives, customScalars }) {
	const definitions = {
		['Directives']: /** @type {DirectiveStructureType} */ (
			getDefinitionCategoryStructure({
				fieldsOrder,
				subtype: 'directive',
				properties: directives,
			})
		),
		['Scalars']: /** @type {ScalarStructureType} */ (
			getDefinitionCategoryStructure({
				fieldsOrder,
				subtype: 'scalar',
				properties: customScalars,
			})
		),
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
 * @param {DefinitionREStructure['subtype']} params.subtype - The subtype of the definition
 * @param {REDefinition[]} params.properties - The properties to structure
 * @returns {DefinitionREStructure} The definition category structure
 */
function getDefinitionCategoryStructure({ fieldsOrder, subtype, properties }) {
	const sortedFields = sortByName({ items: properties, fieldsOrder });

	return {
		type: 'type',
		subtype,
		structureType: true,
		properties: sortedFields.reduce(
			(acc, prop) => {
				acc[prop.name] = prop;
				return acc;
			},
			/** @type {REDefinitionsSchema} */ {},
		),
	};
}

module.exports = {
	getTypeDefinitions,
};
