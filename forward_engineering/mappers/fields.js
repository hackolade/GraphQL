/**
 * @import { FEStatement, DirectivePropertyData, FieldData, ArrayItem, IdToNameMap } from "../types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDefinitionNameFromReferencePath } = require('../helpers/referencesHelper');
const { getArguments } = require('./arguments');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');
const { getFieldDefaultValueStatement } = require('./fieldDefaultValue');
const { addRequired } = require('../helpers/addRequiredHelper');

/**
 * @typedef {Object.<string, FieldData>} FieldsData
 */

/**
 * Gets the fields from the model definitions.
 *
 * @param {Object} param0
 * @param {FieldsData} param0.fields - The fields to get.
 * @param {string[]} param0.requiredFields - The required fields list.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @param {boolean} param0.addArguments - Indicates if arguments should be added.
 * @param {boolean} param0.addDefaultValue - Indicates if default value should be added.
 * @returns {FEStatement[]} - The fields.
 */
function getFields({ fields = [], requiredFields = [], definitionsIdToNameMap, addArguments, addDefaultValue }) {
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
 * Maps a field to an FEStatement.
 *
 * @param {Object} param0
 * @param {string} param0.name - The name of the field.
 * @param {FieldData} param0.fieldData - The field data object.
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
	const fieldNameStatement = joinInlineStatements({ statements: [name, argumentsStatement] });
	const fieldTypeStatement = `${fieldNameStatement}: ${getFieldType({ field: fieldData, required })}`;
	const fieldDefaultValue = addDefaultValue ? getFieldDefaultValueStatement({ field: fieldData }) : '';
	const directivesStatement = getDirectivesUsageStatement({
		directives: fieldData.fieldDirectives,
		definitionsIdToNameMap,
	});

	return {
		statement: joinInlineStatements({ statements: [fieldTypeStatement, fieldDefaultValue, directivesStatement] }),
		description: fieldData.refDescription || fieldData.description,
		isActivated: fieldData.isActivated,
		comment: argumentsWarningComment,
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
		return addRequired({ type: definitionName, required });
	}

	if (field.type === 'List') {
		const arrayItem = getFieldFromArrayItems({ items: field.items });
		return addRequired({
			type: `[${getFieldType({ field: arrayItem, required: arrayItem.required })}]`,
			required,
		});
	}

	return addRequired({ type: field.type, required });
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

module.exports = {
	getObjectTypeFields: params => getFields({ ...params, addArguments: true, addDefaultValue: false }),
	getInterfaceTypeFields: params => getFields({ ...params, addArguments: true, addDefaultValue: false }),
	getInputTypeFields: params => getFields({ ...params, addArguments: false, addDefaultValue: true }),
	getRootTypeFields: params => getFields({ ...params, addArguments: true, addDefaultValue: false }),
	// exported only for tests:
	mapField,
	getFieldType,
};
