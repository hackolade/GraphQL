/**
 * @import {InterfaceTypeDefinitionNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap, FieldsOrder, REInterfaceDefinition, REPropertiesSchema} from "../../../shared/types/types"
 */

const { sortByName } = require('../../helpers/sortByName');
const { mapDirectivesUsage } = require('../directiveUsage');
const { mapField } = require('../field');
const { mapImplementsInterfaces } = require('../implementsInterfaces');

/**
 * Maps interface type definitions
 *
 * @param {object} params
 * @param {InterfaceTypeDefinitionNode[]} params.interfaces - The interface types
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {REInterfaceDefinition[]} The mapped interface definitions
 */
function getInterfaceDefinitions({ interfaces = [], definitionCategoryByNameMap, fieldsOrder }) {
	return interfaces.map(interfaceType => mapInterface({ interfaceType, definitionCategoryByNameMap, fieldsOrder }));
}

/**
 * Maps a single interface type definition
 *
 * @param {object} params
 * @param {InterfaceTypeDefinitionNode} params.interfaceType - The interface to map
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {REInterfaceDefinition} The mapped interface type definition
 */
function mapInterface({ interfaceType, definitionCategoryByNameMap, fieldsOrder }) {
	const properties = interfaceType.fields
		? interfaceType.fields.map(field => mapField({ field, definitionCategoryByNameMap }))
		: [];
	const required = properties.filter(property => property.required).map(property => property.name);
	const convertedProperties = sortByName({ items: properties, fieldsOrder }).reduce(
		(acc, property) => {
			acc[property.name] = property;
			return acc;
		},
		/** @type {REPropertiesSchema} */ {},
	);

	return {
		type: 'interface',
		name: interfaceType.name.value,
		properties: convertedProperties,
		required,
		description: interfaceType.description?.value || '',
		typeDirectives: mapDirectivesUsage({ directives: [...(interfaceType.directives || [])] }),
		implementsInterfaces: mapImplementsInterfaces({ implementsInterfaces: [...(interfaceType.interfaces || [])] }),
	};
}

module.exports = {
	getInterfaceDefinitions,
};
