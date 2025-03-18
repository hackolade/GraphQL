/**
 * @import {FEStatement, DirectivePropertyData, IdToNameMap} from "../../shared/types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');

/**
 * @typedef {object} CustomScalar
 * @property {string} description - The description of the custom scalar.
 * @property {boolean} isActivated - Indicates if the custom scalar is activated.
 * @property {DirectivePropertyData[]} typeDirectives - The directives of the custom scalar.
 */

/**
 * @typedef {Record<string, CustomScalar>} CustomScalars
 */

/**
 * Maps a custom scalar to an FEStatement.
 *
 * @param {object} param0
 * @param {string} param0.name - The name of the custom scalar.
 * @param {CustomScalar} param0.customScalar - The custom scalar object.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement}
 */
function mapCustomScalar({ name, customScalar, definitionsIdToNameMap }) {
	const customScalarNameStatement = `scalar ${name}`;
	const directivesStatement = getDirectivesUsageStatement({
		directives: customScalar.typeDirectives,
		definitionsIdToNameMap,
	});

	return {
		statement: joinInlineStatements({ statements: [customScalarNameStatement, directivesStatement] }),
		description: customScalar.description,
		isActivated: customScalar.isActivated,
	};
}

/**
 * Gets the custom scalars as an array of FEStatements.
 *
 * @param {object} param0
 * @param {CustomScalars} param0.customScalars - The custom scalars object.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement[]}
 */
function getCustomScalars({ customScalars, definitionsIdToNameMap }) {
	return Object.entries(customScalars).map(([name, customScalar]) =>
		mapCustomScalar({ name, customScalar, definitionsIdToNameMap }),
	);
}

module.exports = {
	getCustomScalars,
};
