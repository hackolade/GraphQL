/**
 * @import {FieldDefinitionNode, TypeNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap, FieldTypeProperties, PreProcessedFieldData} from "./../../shared/types/types"
 */

const { mapDirectivesUsage } = require('./directiveUsage');
const { astNodeKind } = require('../constants/graphqlAST');
const { BUILT_IN_SCALAR_LIST } = require('../constants/types');

/**
 * Maps a field
 *
 * @param {object} params
 * @param {FieldDefinitionNode} params.field - The field to map
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @returns {PreProcessedFieldData} The mapped field
 */
function mapField({ field, definitionCategoryByNameMap }) {
	const fieldTypeProperties = getTypeProperties({ type: field.type, definitionCategoryByNameMap });
	const sharedProperties = {
		name: field.name.value,
		fieldDirectives: mapDirectivesUsage({ directives: [...(field.directives || [])] }),
		...fieldTypeProperties,
	};
	const description = field.description?.value;

	if ('$ref' in fieldTypeProperties) {
		return {
			...sharedProperties,
			refDescription: description,
			// TODO: add arguments
		};
	}
	return {
		...sharedProperties,
		description,
		// TODO: add arguments
	};
}

/**
 * Recursively maps the type properties unwrapping non-null and list types and resolving named types to references
 *
 * @param {object} params
 * @param {TypeNode} params.type - The GraphQL type node to process
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @returns {FieldTypeProperties} JSON schema representation of the type
 */
function getTypeProperties({ type, definitionCategoryByNameMap }) {
	// unwrap required type
	if (type.kind === astNodeKind.NON_NULL_TYPE) {
		const innerType = getTypeProperties({ type: type.type, definitionCategoryByNameMap });
		return {
			...innerType,
			required: true,
		};
	}

	if (type.kind === astNodeKind.LIST_TYPE) {
		const innerType = getTypeProperties({ type: type.type, definitionCategoryByNameMap });
		return {
			type: 'List',
			items: [innerType],
			required: false,
		};
	}

	if (type.kind === astNodeKind.NAMED_TYPE) {
		const typeName = type.name.value;
		const isScalar = isBuiltInScalar({ typeName });

		if (isScalar) {
			return {
				type: typeName,
				required: false,
			};
		}

		const definitionCategoryName = definitionCategoryByNameMap[typeName];
		if (definitionCategoryName) {
			return {
				'$ref': `#model/definitions/${definitionCategoryName}/${typeName}`,
				required: false,
			};
		}
	}

	// fallback
	return {
		type: 'string',
		required: false,
	};
}

/**
 * Checks if a type name is a built-in scalar
 *
 * @param {object} params
 * @param {string} params.typeName - The type name to check
 * @returns {boolean} True if the type is a built-in scalar, false otherwise
 */
function isBuiltInScalar({ typeName }) {
	return BUILT_IN_SCALAR_LIST.includes(typeName);
}

module.exports = {
	mapField,
};
