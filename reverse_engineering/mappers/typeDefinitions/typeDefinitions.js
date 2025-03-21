/**
 * @import {DefinitionNode} from "graphql"
 * @import {REDirectiveDefinition, REDefinitionsSchema, FieldsOrder, RECustomScalarDefinition, REDefinition, REModelDefinitionsSchema, DefinitionREStructure, DirectiveStructureType, ScalarStructureType, REObjectTypeDefinition, ObjectStructureType, PreProcessedFieldData} from "../../../shared/types/types"
 */

const { astNodeKind } = require('../../constants/graphqlAST');
const { findNodesByKind } = require('../../helpers/findNodesByKind');
const { getDefinitionCategoryByNameMap } = require('../../helpers/getDefinitionCategoryByNameMap');
const { sortByName } = require('../../helpers/sortByName');
const { getCustomScalarTypeDefinitions } = require('./customScalar');
const { getDirectiveTypeDefinitions } = require('./directive');
const { getObjectTypeDefinitions } = require('./objectType');

/**
 * Gets the type definitions structure
 *
 * @param {object} params
 * @param {DefinitionNode[]} params.typeDefinitions - The type definitions nodes
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @param {string[]} params.rootTypeNames - The root type names
 * @returns {REModelDefinitionsSchema} The mapped type definitions
 */
function getTypeDefinitions({ typeDefinitions, fieldsOrder, rootTypeNames }) {
	const definitionCategoryByNameMap = getDefinitionCategoryByNameMap({ nodes: typeDefinitions });

	const directives = getDirectiveTypeDefinitions({
		directives: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.DIRECTIVE_DEFINITION }),
	});
	const customScalars = getCustomScalarTypeDefinitions({
		customScalars: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.SCALAR_TYPE_DEFINITION }),
	});
	const objectDefinitionNodes = findNodesByKind({
		nodes: typeDefinitions,
		kind: astNodeKind.OBJECT_TYPE_DEFINITION,
	}).filter(node => !rootTypeNames.includes(node.name.value));
	const objectTypes = getObjectTypeDefinitions({
		objectTypes: objectDefinitionNodes,
		definitionCategoryByNameMap,
		fieldsOrder,
	});

	const definitions = getTypeDefinitionsStructure({ fieldsOrder, directives, customScalars, objectTypes });

	return definitions;
}

/**
 * Creates the model definitions structure
 *
 * @param {object} params
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @param {REDirectiveDefinition[]} params.directives - The directive definitions
 * @param {RECustomScalarDefinition[]} params.customScalars - The custom scalar definitions
 * @param {REObjectTypeDefinition[]} params.objectTypes - The object type definitions
 * @returns {REModelDefinitionsSchema} The type definitions structure
 */
function getTypeDefinitionsStructure({ fieldsOrder, directives, customScalars, objectTypes }) {
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
		['Objects']: /** @type {ObjectStructureType} */ (
			getDefinitionCategoryStructure({
				fieldsOrder,
				subtype: 'object',
				properties: objectTypes,
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

	const convertedProperties = sortedFields.reduce((acc, prop) => {
		const processedProp = { ...prop };

		acc[processedProp.name] = processedProp;
		return acc;
	}, {});

	return {
		type: 'type',
		subtype,
		structureType: true,
		properties: convertedProperties,
	};
}

module.exports = {
	getTypeDefinitions,
};
