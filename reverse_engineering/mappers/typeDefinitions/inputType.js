/**
 * @import {InputObjectTypeDefinitionNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap, FieldsOrder, REInputTypeDefinition, REPropertiesSchema} from "../../../shared/types/types"
 */

const { sortByName } = require('../../helpers/sortByName');
const { mapDirectivesUsage } = require('../directiveUsage');
const { mapField } = require('../field');

/**
 * Maps input object type definitions
 *
 * @param {object} params
 * @param {InputObjectTypeDefinitionNode[]} params.inputObjectTypes - The input object types
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {REInputTypeDefinition[]} The mapped input object type definitions
 */
function getInputObjectTypeDefinitions({ inputObjectTypes = [], definitionCategoryByNameMap, fieldsOrder }) {
	return inputObjectTypes.map(inputObjectType =>
		mapInputObjectType({ inputObjectType, definitionCategoryByNameMap, fieldsOrder }),
	);
}

/**
 * Maps a single input object type definition
 *
 * @param {object} params
 * @param {InputObjectTypeDefinitionNode} params.inputObjectType - The input object type to map
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {REInputTypeDefinition} The mapped input object type definition
 */
function mapInputObjectType({ inputObjectType, definitionCategoryByNameMap, fieldsOrder }) {
	const properties = inputObjectType.fields
		? inputObjectType.fields.map(field => mapField({ field, definitionCategoryByNameMap }))
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
		type: 'input',
		name: inputObjectType.name.value,
		properties: convertedProperties,
		required,
		description: inputObjectType.description?.value || '',
		typeDirectives: mapDirectivesUsage({ directives: [...(inputObjectType.directives || [])] }),
	};
}

module.exports = {
	getInputObjectTypeDefinitions,
};
