/**
 * @import { FEStatement, DirectivePropertyData } from "../types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');

/**
 * @typedef {Object} CustomScalar
 * @property {string} description - The description of the custom scalar.
 * @property {boolean} isActivated - Indicates if the custom scalar is activated.
 * @property {DirectivePropertyData[]} typeDirectives - The directives of the custom scalar.
 */

/**
 * @typedef {Object.<string, CustomScalar>} CustomScalars
 */

/**
 * Maps a custom scalar to an FEStatement.
 *
 * @param {Object} param0
 * @param {string} param0.name - The name of the custom scalar.
 * @param {CustomScalar} param0.customScalar - The custom scalar object.
 * @returns {FEStatement}
 */
function mapCustomScalar({ name, customScalar }) {
	const customScalarNameStatement = `scalar ${name}`;
	const directivesStatement = getDirectivesUsageStatement({ directives: customScalar.typeDirectives });

	return {
		statement: joinInlineStatements({ statements: [customScalarNameStatement, directivesStatement] }),
		description: customScalar.description,
		isActivated: customScalar.isActivated,
	};
}

/**
 * Gets the custom scalars as an array of FEStatements.
 *
 * @param {Object} param0
 * @param {CustomScalars} param0.customScalars - The custom scalars object.
 * @returns {FEStatement[]}
 */
function getCustomScalars({ customScalars }) {
	return Object.entries(customScalars).map(([name, customScalar]) => mapCustomScalar({ name, customScalar }));
}

module.exports = {
	getCustomScalars,
};
