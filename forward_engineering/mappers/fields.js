/**
 * @import { FEStatement, DirectivePropertyData, FieldData, ArrayItem, IdToNameMap } from "../types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDefinitionNameFromReferencePath } = require('../helpers/referencesHelper');
const { getArguments } = require('./arguments');
const { getDirectivesUsageStatement } = require('./directives');

/**
 * @typedef {Object.<string, FieldData>} FieldsData
 */

/**
 * Gets the object types from the model definitions.
 *
 * @param {Object} param0
 * @param {FieldsData} param0.fields - The object types to get.
 * @param {string[]} param0.requiredFields - The required fields list.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement[]} - The object types.
 */
function getFields({ fields, requiredFields = [], definitionsIdToNameMap }) {
	return Object.entries(fields).map(([name, fieldData]) =>
		mapField({ name, fieldData, required: requiredFields.includes(name), definitionsIdToNameMap }),
	);
}

/**
 * Maps a field to an FEStatement.
 *
 * @param {Object} param0
 * @param {string} param0.name - The name of the field.
 * @param {FieldData} param0.fieldData - The field data object.
 * @param {boolean} param0.required - Indicates if the field is required.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement}
 */
function mapField({ name, fieldData, required, definitionsIdToNameMap }) {
	const fieldArguments = getArguments({ argumentsData: fieldData.arguments, idToNameMap: definitionsIdToNameMap });
	const fieldNameStatement = joinInlineStatements({ statements: [name, fieldArguments] });
	const fieldTypeStatement = `${fieldNameStatement}: ${getFieldType({ field: fieldData, required })}`;
	const directivesStatement = getDirectivesUsageStatement({ directives: fieldData.typeDirectives });

	return {
		statement: joinInlineStatements({ statements: [fieldTypeStatement, directivesStatement] }),
		description: fieldData.refDescription || fieldData.description,
		isActivated: fieldData.isActivated,
	};
}

/**
 * Gets the field type.
 *
 * @param {Object} param0
 * @param {FieldData} param0.field - The field data object.
 * @param {boolean} param0.required - Indicates if the field is required.
 * @returns {string} - The field type.
 */
function getFieldType({ field, required }) {
	if (field.$ref) {
		const definitionName = getDefinitionNameFromReferencePath({ referencePath: field.$ref });
		return addRequiredField({ field: definitionName, required });
	}

	if (field.type === 'List') {
		const arrayItem = getFieldFromArrayItems({ items: field.items });
		return addRequiredField({
			field: `[${getFieldType({ field: arrayItem, required: arrayItem.required })}]`,
			required,
		});
	}

	return addRequiredField({ field: field.type, required });
}

/**
 * Gets the field from array items.
 *
 * @param {Object} param0
 * @param {FieldData['items']} param0.items - The array items.
 * @returns {ArrayItem} - The field.
 */
function getFieldFromArrayItems({ items }) {
	if (Array.isArray(items)) {
		return items[0];
	}
	return items;
}

/**
 * Adds required field indicator.
 *
 * @param {Object} param0
 * @param {string} param0.field - The field type statement.
 * @param {boolean} param0.required - Indicates if the field is required.
 * @returns {string} - The field with required indicator.
 */
function addRequiredField({ field, required }) {
	if (required) {
		return `${field}!`;
	}
	return field;
}

module.exports = {
	getFields,
};
