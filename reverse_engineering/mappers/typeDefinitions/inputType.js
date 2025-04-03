/**
 * @import {InputObjectTypeDefinitionNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap, FieldsOrder, REInputTypeDefinition} from "../../../shared/types/types"
 */

const { mapDirectivesUsage } = require('../directiveUsage');
const { getFieldsSchema } = require('../field');

/**
 * Maps input object type definitions
 *
 * @param {object} params
 * @param {InputObjectTypeDefinitionNode[]} params.inputObjectTypes - The input object types
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @param {FieldsOrder} [params.fieldsOrder] - The fields order
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
 * @param {FieldsOrder} [params.fieldsOrder] - The fields order
 * @returns {REInputTypeDefinition} The mapped input object type definition
 */
function mapInputObjectType({ inputObjectType, definitionCategoryByNameMap, fieldsOrder }) {
	const { properties, required } = getFieldsSchema({
		fields: [...(inputObjectType.fields || [])],
		definitionCategoryByNameMap,
		fieldsOrder,
	});

	return {
		type: 'input',
		name: inputObjectType.name.value,
		properties,
		required,
		description: inputObjectType.description?.value || '',
		typeDirectives: mapDirectivesUsage({ directives: [...(inputObjectType.directives || [])] }),
	};
}

module.exports = {
	getInputObjectTypeDefinitions,
};
