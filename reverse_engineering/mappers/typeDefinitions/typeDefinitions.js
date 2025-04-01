/**
 * @import {DefinitionNode} from "graphql"
 * @import {REDirectiveDefinition,
 * 		FieldsOrder,
 * 		RECustomScalarDefinition,
 * 		REDefinition,
 * 		REModelDefinitionsSchema,
 * 		DefinitionREStructure,
 * 		DirectiveStructureType,
 * 		REEnumDefinition,
 * 		EnumStructureType,
 * 		ObjectStructureType,
 * 		ScalarStructureType,
 * REObjectTypeDefinition,
 * InterfaceStructureType,
 * REInterfaceDefinition,
 * REInputTypeDefinition,
 * InputStructureType,
 * DefinitionNameToTypeNameMap} from "../../../shared/types/types"
 */

const { astNodeKind } = require('../../constants/graphqlAST');
const { findNodesByKind } = require('../../helpers/findNodesByKind');
const { sortByName } = require('../../helpers/sortByName');
const { getCustomScalarTypeDefinitions } = require('./customScalar');
const { getDirectiveTypeDefinitions } = require('./directive');
const { getObjectTypeDefinitions } = require('./objectType');
const { getEnumTypeDefinitions } = require('./enum');
const { getInterfaceDefinitions } = require('./interface');
const { getInputObjectTypeDefinitions } = require('./inputType');

/**
 * Gets the type definitions structure
 *
 * @param {object} params
 * @param {DefinitionNode[]} params.typeDefinitions - The type definitions nodes
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @param {string[]} params.rootTypeNames - The root type names
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @returns {REModelDefinitionsSchema} The mapped type definitions
 */
function getTypeDefinitions({ typeDefinitions, fieldsOrder, rootTypeNames, definitionCategoryByNameMap }) {
	const directives = getDirectiveTypeDefinitions({
		directives: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.DIRECTIVE_DEFINITION }),
	});
	const customScalars = getCustomScalarTypeDefinitions({
		customScalars: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.SCALAR_TYPE_DEFINITION }),
	});

	const enums = getEnumTypeDefinitions({
		enums: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.ENUM_TYPE_DEFINITION }),
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

	const interfaces = getInterfaceDefinitions({
		interfaces: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.INTERFACE_TYPE_DEFINITION }),
		definitionCategoryByNameMap,
		fieldsOrder,
	});

	const inputTypes = getInputObjectTypeDefinitions({
		inputObjectTypes: findNodesByKind({ nodes: typeDefinitions, kind: astNodeKind.INPUT_OBJECT_TYPE_DEFINITION }),
		definitionCategoryByNameMap,
		fieldsOrder,
	});

	const definitions = getTypeDefinitionsStructure({
		fieldsOrder,
		directives,
		customScalars,
		enums,
		objectTypes,
		interfaces,
		inputTypes,
	});

	return definitions;
}

/**
 * Creates the model definitions structure
 *
 * @param {object} params
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @param {REDirectiveDefinition[]} params.directives - The directive definitions
 * @param {RECustomScalarDefinition[]} params.customScalars - The custom scalar definitions
 * @param {REEnumDefinition[]} params.enums - The enum definitions
 * @param {REObjectTypeDefinition[]} params.objectTypes - The object type definitions
 * @param {REInterfaceDefinition[]} params.interfaces - The interface definitions
 * @param {REInputTypeDefinition[]} params.inputTypes - The input type definitions
 * @returns {REModelDefinitionsSchema} The type definitions structure
 */
function getTypeDefinitionsStructure({
	fieldsOrder,
	directives,
	customScalars,
	enums,
	objectTypes,
	interfaces,
	inputTypes,
}) {
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
		['Enums']: /** @type {EnumStructureType} */ (
			getDefinitionCategoryStructure({
				fieldsOrder,
				subtype: 'enum',
				properties: enums,
			})
		),
		['Interfaces']: /** @type {InterfaceStructureType} */ (
			getDefinitionCategoryStructure({
				fieldsOrder,
				subtype: 'interface',
				properties: interfaces,
			})
		),
		['Input objects']: /** @type {InputStructureType} */ (
			getDefinitionCategoryStructure({
				fieldsOrder,
				subtype: 'input',
				properties: inputTypes,
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
