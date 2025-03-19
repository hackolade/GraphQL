/**
 * @import {FEStatement, DirectivePropertyData, IdToNameMap} from "../../shared/types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');

/**
 * @typedef {object} EnumValue
 * @property {string} value - The name of the enum value.
 * @property {string} description - The description of the enum value.
 * @property {DirectivePropertyData[]} typeDirectives - The directives of the enum value.
 */

/**
 * @typedef {object} EnumDefinition
 * @property {string} description - The description of the enum.
 * @property {boolean} isActivated - Indicates if the enum is activated.
 * @property {DirectivePropertyData[]} typeDirectives - The directives of the enum.
 * @property {EnumValue[]} enumValues - The values of the emu,.
 */

/**
 * @typedef {Record<string, EnumDefinition>} EnumDefinitions
 */

/**
 * Gets the enums as an array of FEStatements.
 *
 * @param {object} param0
 * @param {EnumDefinitions} param0.enumsDefinitions - The enums object.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement[]}
 */
function getEnums({ enumsDefinitions, definitionsIdToNameMap }) {
	return Object.entries(enumsDefinitions).map(([name, enumDefinition]) =>
		mapEnum({ name, enumDefinition, definitionsIdToNameMap }),
	);
}

/**
 * Maps a enum to an FEStatement.
 *
 * @param {object} param0
 * @param {string} param0.name - The name of the enum.
 * @param {EnumDefinition} param0.enumDefinition - The enum definition object.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement}
 */
function mapEnum({ name, enumDefinition, definitionsIdToNameMap }) {
	const nameStatement = `enum ${name}`;
	const directivesStatement = getDirectivesUsageStatement({
		directives: enumDefinition.typeDirectives,
		definitionsIdToNameMap,
	});

	return {
		statement: joinInlineStatements({ statements: [nameStatement, directivesStatement] }),
		description: enumDefinition.description,
		isActivated: enumDefinition.isActivated,
		nestedStatements: mapEnumValues({ enumValues: enumDefinition.enumValues, definitionsIdToNameMap }),
	};
}

/**
 * Maps the enum values to an array of FEStatement.
 *
 * @param {object} param0
 * @param {EnumValue[]} param0.enumValues - The enum values.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement[]}
 */
function mapEnumValues({ enumValues = [], definitionsIdToNameMap }) {
	return enumValues.map(({ value, description, typeDirectives }) => {
		const directivesStatement = getDirectivesUsageStatement({ directives: typeDirectives, definitionsIdToNameMap });

		return {
			statement: joinInlineStatements({ statements: [value, directivesStatement] }),
			description: description,
		};
	});
}

module.exports = {
	getEnums,
};
