const { commentOutDeactivatedRootFEStatement } = require('./deactivatedItemsHelper');
const { getStatementDescription } = require('./descriptionsHelper');
const { addIndentToStatement } = require('./feStatementIndentHelper');

/**
 * @typedef { import("../types/types").FEStatement } FEStatement
 */

/**
 * Combines the description and statement, and comments out the statement if it is deactivated.
 * Adds formatted nested statements if they exist.
 *
 * @param {Object} param0
 * @param {FEStatement} param0.feStatement - The forward engineering statement object.
 * @returns {string} - The final formatted statement.
 */
function formatFEStatement({ feStatement }) {
	const {
		statement,
		description,
		isActivated = true,
		nestedStatements,
		useCurlyBracketsForNestedStatements = true,
	} = feStatement;
	let result = '';

	if (description?.trim()) {
		const formattedDescription = getStatementDescription({ description });
		result += `${formattedDescription}\n`;
	}

	result += statement;

	if (nestedStatements?.length > 0) {
		const formattedNestedStatements = nestedStatements
			.map(nestedStatement =>
				addIndentToStatement({ statement: formatFEStatement({ feStatement: nestedStatement }) }),
			)
			.join('\n');

		if (useCurlyBracketsForNestedStatements) {
			result += ` {\n${formattedNestedStatements}\n}`;
		} else {
			result += `\n${formattedNestedStatements}`;
		}
	}

	if (!isActivated) {
		result = commentOutDeactivatedRootFEStatement({ statement: result, isActivated });
	}

	return result;
}

module.exports = {
	formatFEStatement,
};
