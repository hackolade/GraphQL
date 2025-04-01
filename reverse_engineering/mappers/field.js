/**
 * @import {FieldDefinitionNode, TypeNode, InputValueDefinitionNode, ValueNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap, FieldTypeProperties, InputTypeFieldProperties, PreProcessedFieldData} from "./../../shared/types/types"
 */

const { mapDirectivesUsage } = require('./directiveUsage');
const { astNodeKind } = require('../constants/graphqlAST');
const { BUILT_IN_SCALAR_LIST } = require('../constants/types');
const { getArguments } = require('./arguments');
const { parseDefaultValue } = require('./defaultValue');

/**
 * Maps a field
 *
 * @param {object} params
 * @param {FieldDefinitionNode | InputValueDefinitionNode} params.field - The field to map
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

	// Add default value handling for InputValueDefinitionNode
	if ('defaultValue' in field && field.defaultValue) {
		sharedProperties.default = parseDefaultValue(field.defaultValue);
	}

	let mappedArguments;
	if ('arguments' in field) {
		mappedArguments = getArguments({ fieldArguments: [...(field.arguments || [])] });
	}

	if ('$ref' in fieldTypeProperties) {
		return {
			...sharedProperties,
			refDescription: description,
			...(mappedArguments && { arguments: mappedArguments }),
		};
	}
	return {
		...sharedProperties,
		description,
		...(mappedArguments && { arguments: mappedArguments }), // Added handling for mappedArguments
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
