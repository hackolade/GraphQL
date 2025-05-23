/**
 * @import {FEStatement, BaseGetFieldParams, GetFieldsParams, ArrayItems, FieldData, ArrayItem, IdToNameMap, DirectivePropertyData} from "../../shared/types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDefinitionNameFromReferencePath } = require('../helpers/referenceHelper');
const { getArguments } = require('./arguments');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');
const { getFieldDefaultValueStatement } = require('./fieldDefaultValue');
const { addRequired } = require('../helpers/addRequiredHelper');

/**
 * Gets the fields from the model definitions.
 *
 * @param {GetFieldsParams} params
 * @returns {FEStatement[]} - The fields.
 */
function getFields({ fields = {}, requiredFields = [], definitionsIdToNameMap, addArguments, addDefaultValue }) {
	return Object.entries(fields).map(([name, fieldData]) =>
		mapField({
			name,
			fieldData,
			required: requiredFields.includes(name),
			definitionsIdToNameMap,
			addArguments,
			addDefaultValue,
		}),
	);
}

/**
 * @param {object} params
 * @param {FieldData<DirectivePropertyData>} params.fieldData
 * @returns {string}
 */
function getFieldDescription({ fieldData }) {
	if ('refDescription' in fieldData && fieldData.refDescription) {
		return fieldData.refDescription;
	} else if ('description' in fieldData && fieldData.description) {
		return fieldData.description;
	}

	return '';
}

/**
 * Maps a field to an FEStatement.
 *
 * @param {object} param0
 * @param {string} param0.name - The name of the field.
 * @param {FieldData<DirectivePropertyData>} param0.fieldData - The field data object.
 * @param {boolean} param0.required - Indicates if the field is required.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @param {boolean} param0.addArguments - Indicates if arguments should be added.
 * @param {boolean} param0.addDefaultValue - Indicates if default value should be added.
 * @returns {FEStatement}
 */
function mapField({ name, fieldData, required, definitionsIdToNameMap, addArguments, addDefaultValue }) {
	const { argumentsStatement, argumentsWarningComment } = addArguments
		? getArguments({ graphqlArguments: fieldData.arguments, idToNameMap: definitionsIdToNameMap })
		: { argumentsStatement: '', argumentsWarningComment: '' };
	const fieldNameStatement = joinInlineStatements({ statements: [name, argumentsStatement], separator: '' });
	const fieldTypeStatement = `${fieldNameStatement}: ${getFieldType({ field: fieldData, required })}`;
	const fieldDefaultValue = addDefaultValue ? getFieldDefaultValueStatement({ field: fieldData }) : '';
	const directivesStatement = getDirectivesUsageStatement({
		directives: fieldData.fieldDirectives,
		definitionsIdToNameMap,
	});

	return {
		statement: joinInlineStatements({ statements: [fieldTypeStatement, fieldDefaultValue, directivesStatement] }),
		description: getFieldDescription({ fieldData }),
		isActivated: fieldData.isActivated,
		comment: argumentsWarningComment,
	};
}

/**
 * Gets the field type.
 *
 * @param {object} param0
 * @param {FieldData<DirectivePropertyData>} param0.field - The field data object.
 * @param {boolean} [param0.required] - Indicates if the field is required.
 * @returns {string} - The field type.
 */
function getFieldType({ field, required }) {
	if ('$ref' in field && field.$ref) {
		const definitionName = getDefinitionNameFromReferencePath({ referencePath: field.$ref }) || 'String';
		return addRequired({ type: definitionName, required });
	}

	if ('type' in field && field.type === 'List') {
		const arrayItem = getFieldFromArrayItems({ items: field.items });

		// When no array items are present, return a placeholder
		if (!arrayItem) {
			return `[Unknown]`;
		}

		return addRequired({
			type: `[${getFieldType({ field: arrayItem, required: arrayItem.required })}]`,
			required,
		});
	}

	if ('type' in field) {
		return addRequired({ type: field.type, required });
	}

	// Fallback return type for types that are not recognized
	// Ideally, this should never be reached
	return '';
}

/**
 * Gets the field from array items.
 *
 * @param {object} param0
 * @param {ArrayItems<DirectivePropertyData>} [param0.items] - The array items.
 * @returns {ArrayItem<DirectivePropertyData> | undefined} - The field.
 */
function getFieldFromArrayItems({ items }) {
	if (Array.isArray(items)) {
		return items[0];
	}
	return items;
}

/**
 * Gets the fields for an object type.
 *
 * @param {BaseGetFieldParams} params
 * @returns {FEStatement[]}
 */
function getObjectTypeFields(params) {
	return getFields({ ...params, addArguments: true, addDefaultValue: false });
}

/**
 * Gets the fields for an interface type.
 *
 * @param {BaseGetFieldParams} params
 * @returns {FEStatement[]}
 */
function getInterfaceTypeFields(params) {
	return getFields({ ...params, addArguments: true, addDefaultValue: false });
}

/**
 * Gets the fields for an input type.
 *
 * @param {BaseGetFieldParams} params
 * @returns {FEStatement[]}
 */
function getInputTypeFields(params) {
	return getFields({ ...params, addArguments: false, addDefaultValue: true });
}

/**
 * Gets the fields for a root type.
 *
 * @param {BaseGetFieldParams} params
 * @returns {FEStatement[]}
 */
function getRootTypeFields(params) {
	return getFields({ ...params, addArguments: true, addDefaultValue: false });
}

module.exports = {
	getObjectTypeFields,
	getInterfaceTypeFields,
	getInputTypeFields,
	getRootTypeFields,

	// exported only for tests:
	mapField,
	getFieldType,
};
