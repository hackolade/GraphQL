/**
 * @import {FieldData} from "../../shared/types/types"
 */

/**
 * Generates the default value statement for a field.
 *
 * @param {object} param0
 * @param {FieldData} param0.field - The field object.
 * @returns {string} - The default value statement.
 */
function getFieldDefaultValueStatement({ field }) {
	if (!isValuePresent(field.default)) {
		return '';
	}

	if ('$ref' in field && field.$ref) {
		return `= ${formatRefFieldDefaultValue({ defaultValue: field.default })}`;
	}

	if ('type' in field) {
		return `= ${formatFieldDefaultValue({ defaultValue: field.default, fieldType: field.type })}`;
	}

	return '';
}

/**
 * Formats the default value for a field.
 *
 * @param {object} param0
 * @param {string} [param0.defaultValue] - The default value.
 * @param {string} param0.fieldType - The type of the field.
 * @returns {string} - The formatted default value.
 */
function formatFieldDefaultValue({ defaultValue, fieldType }) {
	if (fieldType === 'List' && isComplexDefaultValue({ defaultValue })) {
		return prepareComplexDefaultValue({ defaultValue });
	}

	try {
		return JSON.stringify(defaultValue);
	} catch {
		return String(defaultValue);
	}
}

/**
 * Formats the default value for a reference field.
 *
 * @param {object} param0
 * @param {any} param0.defaultValue - The default value.
 * @returns {string} - The formatted default value.
 */
function formatRefFieldDefaultValue({ defaultValue }) {
	if (isComplexDefaultValue({ defaultValue })) {
		return prepareComplexDefaultValue({ defaultValue });
	}
	try {
		return JSON.stringify(JSON.parse(defaultValue));
	} catch {
		return `"${String(defaultValue)}"`;
	}
}

/**
 * Checks if the default value is complex (object or array).
 *
 * @param {object} param0
 * @param {unknown} param0.defaultValue - The default value.
 * @returns {boolean} - True if the default value is complex, false otherwise.
 */
function isComplexDefaultValue({ defaultValue }) {
	if (typeof defaultValue !== 'string') {
		return false;
	}
	const trimmedDefaultValue = defaultValue.trim();
	return (
		(trimmedDefaultValue.startsWith('{') && trimmedDefaultValue.endsWith('}')) ||
		(trimmedDefaultValue.startsWith('[') && trimmedDefaultValue.endsWith(']'))
	);
}

/**
 * Checks if a value is present (not undefined or empty).
 *
 * @param {string} [value] - The value to check.
 * @returns {boolean} - True if the value is present, false otherwise.
 */
function isValuePresent(value) {
	return value !== undefined && value !== '';
}

/**
 * Prepares a complex default value by removing newlines.
 *
 * @param {object} param0
 * @param {string} [param0.defaultValue] - The default value.
 * @returns {string} - The prepared default value.
 */
function prepareComplexDefaultValue({ defaultValue = '' }) {
	return defaultValue.trim().replace(/\n/g, ' ');
}

module.exports = {
	getFieldDefaultValueStatement,
};
