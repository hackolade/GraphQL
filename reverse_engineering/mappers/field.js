/**
 * @import {FieldDefinitionNode, TypeNode, InputValueDefinitionNode, ValueNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap, FieldTypeProperties, InputTypeFieldProperties, PreProcessedFieldData} from "./../../shared/types/types"
 */

const { mapDirectivesUsage } = require('./directiveUsage');
const { astNodeKind } = require('../constants/graphqlAST');
const { BUILT_IN_SCALAR_LIST } = require('../constants/types');

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
 * Parses a default value from a ValueNode into a string representation
 *
 * @param {ValueNode} defaultValue - The default value node to parse
 * @param {boolean} [isNested=false] - Whether this value is nested inside an object or list. Default is `false`
 * @returns {InputTypeFieldProperties['default']} String representation of the default value
 */
function parseDefaultValue(defaultValue, isNested = false) {
	switch (defaultValue.kind) {
		case astNodeKind.INT:
			return parseInt(defaultValue.value);
		case astNodeKind.FLOAT:
			return parseFloat(defaultValue.value);
		case astNodeKind.ENUM:
			return defaultValue.value;
		case astNodeKind.STRING:
			// Add quotes only if the string is nested in an object or list
			return isNested ? `"${defaultValue.value}"` : defaultValue.value;
		case astNodeKind.BOOLEAN:
			return defaultValue.value.toString();
		case astNodeKind.NULL:
			return 'null';
		case astNodeKind.LIST: {
			const listValues = defaultValue.values.map(value => parseDefaultValue(value, true));
			return `[${listValues.join(', ')}]`;
		}
		case astNodeKind.OBJECT: {
			const objectFields = defaultValue.fields.map(
				field => `${field.name.value}: ${parseDefaultValue(field.value, true)}`,
			);
			return `{ ${objectFields.join(', ')} }`;
		}
		default:
			return '';
	}
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
