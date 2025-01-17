const { commentOutDeactivatedRootFEStatement } = require('./deactivatedItemsHelper');
const { getRootStatementDescription } = require('./descriptionsHelper');

/**
 * Combines the description and statement, and comments out the statement if it is deactivated.
 *
 * @param {Object} param0
 * @param {string} param0.statement - The GraphQL statement
 * @param {string} param0.description - The description of the statement
 * @param {boolean} param0.isActivated - Indicates if the statement is activated
 * @returns {string} - The final formatted statement
 */
function getRootFEStatement({ statement, description, isActivated }) {
	let result = '';

	if (description) {
		const formattedDescription = getRootStatementDescription({ description });
		result += `${formattedDescription}\n`;
	}

	result += statement;

	if (!isActivated) {
		result = commentOutDeactivatedRootFEStatement({ statement: result, isActivated });
	}

	return result;
}
