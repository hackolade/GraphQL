/**
 * @import {ObjectTypeDefinitionNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap, FieldsOrder, RootTypeEntity} from "../../shared/types/types"
 */

const { mapDirectivesUsage } = require('./directiveUsage');
const { getFieldsSchema } = require('./field');

/**
 * Maps the schema root types to entities
 *
 * @param {object} params
 * @param {ObjectTypeDefinitionNode[]} params.rootTypeNodes - The schema root type nodes
 * @param {string[]} params.schemaRootTypesMap - The schema root types names map
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @param {FieldsOrder} [params.fieldsOrder] - The fields order
 * @returns {RootTypeEntity[]} The mapped container
 */
function mapRootTypesToEntities({ rootTypeNodes, schemaRootTypesMap, definitionCategoryByNameMap, fieldsOrder }) {
	if (!rootTypeNodes) {
		return [];
	}

	return rootTypeNodes.map(rootTypeNode => {
		const { properties, required } = getFieldsSchema({
			fields: [...(rootTypeNode.fields || [])],
			definitionCategoryByNameMap,
			fieldsOrder,
		});
		return {
			name: rootTypeNode.name.value,
			data: {
				type: 'object',
				description: rootTypeNode.description?.value || '',
				operationType: getOperationType({ typeName: rootTypeNode.name.value, schemaRootTypesMap }),
				typeDirectives: mapDirectivesUsage({ directives: [...(rootTypeNode.directives || [])] }),
				properties,
				required,
			},
		};
	});
}

/**
 * Maps the operation type
 *
 * @param {object} params
 * @param {string} params.typeName - The type name
 * @param {string[]} params.schemaRootTypesMap - The schema root types names map
 * @returns {string} The operation type
 */
function getOperationType({ typeName, schemaRootTypesMap }) {
	const [queryType, mutationType, subscriptionType] = schemaRootTypesMap;
	if (typeName === queryType) {
		return 'Query';
	}
	if (typeName === mutationType) {
		return 'Mutation';
	}
	if (typeName === subscriptionType) {
		return 'Subscription';
	}
	return '';
}

module.exports = {
	mapRootTypesToEntities,
};
