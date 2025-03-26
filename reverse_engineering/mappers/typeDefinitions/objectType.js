/**
 * @import {ObjectTypeDefinitionNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap, FieldsOrder, REObjectTypeDefinition, REPropertiesSchema} from "../../../shared/types/types"
 */

const { sortByName } = require('../../helpers/sortByName');
const { mapDirectivesUsage } = require('../directiveUsage');
const { mapField } = require('../field');
const { mapImplementsInterfaces } = require('../implementsInterfaces');

/**
 * Maps object type definitions
 *
 * @param {object} params
 * @param {ObjectTypeDefinitionNode[]} params.objectTypes - The object types
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {REObjectTypeDefinition[]} The mapped object type definitions
 */
function getObjectTypeDefinitions({ objectTypes = [], definitionCategoryByNameMap, fieldsOrder }) {
	return objectTypes.map(objectType => mapObjectType({ objectType, definitionCategoryByNameMap, fieldsOrder }));
}

/**
 * Maps a single object type definition
 *
 * @param {object} params
 * @param {ObjectTypeDefinitionNode} params.objectType - The object type to map
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {REObjectTypeDefinition} The mapped object type definition
 */
function mapObjectType({ objectType, definitionCategoryByNameMap, fieldsOrder }) {
	const properties = objectType.fields
		? objectType.fields.map(field => mapField({ field, definitionCategoryByNameMap }))
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
		type: 'object',
		name: objectType.name.value,
		properties: convertedProperties,
		required,
		description: objectType.description?.value || '',
		typeDirectives: mapDirectivesUsage({ directives: [...(objectType.directives || [])] }),
		implementsInterfaces: mapImplementsInterfaces({ implementsInterfaces: [...(objectType.interfaces || [])] }),
	};
}

module.exports = {
	getObjectTypeDefinitions,
};
