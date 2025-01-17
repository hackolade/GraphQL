const { commentOutDeactivatedRootFEStatement } = require('./deactivatedItemsHelper');
const { getStatementDescription } = require('./descriptionsHelper');

/**
 * Combines the description and statement, and comments out the statement if it is deactivated.
 *
 * @param {Object} param0
 * @param {Object} param0.feStatement - The forward engineering statement object.
 * @param {string} param0.feStatement.statement - The GraphQL statement.
 * @param {string} param0.feStatement.description - The description of the statement.
 * @param {boolean} param0.feStatement.isActivated - Indicates if the statement is activated.
 * @returns {string} - The final formatted statement.
 */
function formatFEStatement({ feStatement }) {
	const { statement, description, isActivated } = feStatement;
	let result = '';

	if (description?.trim()) {
		const formattedDescription = getStatementDescription({ description });
		result += `${formattedDescription}\n`;
	}

	result += statement;

	if (!isActivated) {
		result = commentOutDeactivatedRootFEStatement({ statement: result, isActivated });
	}

	return result;
}

module.exports = {
	formatFEStatement,
};
