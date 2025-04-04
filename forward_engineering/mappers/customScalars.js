/**
 * @import {FEStatement, IdToNameMap, FECustomScalarDefinition, FECustomScalarDefinitionsSchema} from "../../shared/types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');

/**
 * Maps a custom scalar to an FEStatement.
 *
 * @param {object} param0
 * @param {string} param0.name - The name of the custom scalar.
 * @param {FECustomScalarDefinition} param0.customScalar - The custom scalar object.
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
 * @param {FECustomScalarDefinitionsSchema} param0.customScalars - The custom scalars object.
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
