/**
 * @import { FEStatement, DirectivePropertyData } from "../types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');

/**
 * @typedef {Object} EnumValue
 * @property {string} value - The name of the enum value.
 * @property {string} description - The description of the enum value.
 * @property {DirectivePropertyData[]} typeDirectives - The directives of the enum value.
 */

/**
 * @typedef {Object} EnumDefinition
 * @property {string} description - The description of the enum.
 * @property {boolean} isActivated - Indicates if the enum is activated.
 * @property {DirectivePropertyData[]} typeDirectives - The directives of the enum.
 * @property {EnumValue[]} enumValues - The values of the emu,.
 */

/**
 * @typedef {Object.<string, EnumDefinition>} EnumDefinitions
 */

/**
 * Gets the enums as an array of FEStatements.
 *
 * @param {Object} param0
 * @param {EnumDefinitions} param0.enumsDefinitions - The enums object.
 * @returns {FEStatement[]}
 */
function getEnums({ enumsDefinitions }) {
	return Object.entries(enumsDefinitions).map(([name, enumDefinition]) => mapEnum({ name, enumDefinition }));
}

/**
 * Maps a enum to an FEStatement.
 *
 * @param {Object} param0
 * @param {string} param0.name - The name of the enum.
 * @param {EnumDefinition} param0.enumDefinition - The enum definition object.
 * @returns {FEStatement}
 */
function mapEnum({ name, enumDefinition }) {
	const nameStatement = `enum ${name}`;
	const directivesStatement = getDirectivesUsageStatement({ directives: enumDefinition.typeDirectives });

	return {
		statement: joinInlineStatements({ statements: [nameStatement, directivesStatement] }),
		description: enumDefinition.description,
		isActivated: enumDefinition.isActivated,
		nestedStatements: mapEnumValues({ enumValues: enumDefinition.enumValues }),
	};
}

/**
 * Maps the enum values to an array of FEStatement.
 *
 * @param {Object} param0
 * @param {EnumValue[]} param0.enumValues - The enum values.
 * @returns {FEStatement[]}
 */
function mapEnumValues({ enumValues = [] }) {
	return enumValues.map(({ value, description, typeDirectives }) => {
		const directivesStatement = getDirectivesUsageStatement({ directives: typeDirectives });

		return {
			statement: joinInlineStatements({ statements: [value, directivesStatement] }),
			description: description,
		};
	});
}

module.exports = {
	getEnums,
};
