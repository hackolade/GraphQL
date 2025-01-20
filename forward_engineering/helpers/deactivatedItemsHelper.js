/**
 * Comments out a GraphQL statement if it is deactivated.
 *
 * @param {Object} param0
 * @param {string} param0.statement - The GraphQL statement to comment out
 * @returns {string} - Commented out statement
 */
function commentOutDeactivatedRootFEStatement({ statement }) {
	const commentedStatement = statement
		.split('\n')
		.map(line => `# ${line}`)
		.join('\n');

	return commentedStatement;
}

module.exports = {
	commentOutDeactivatedRootFEStatement,
};
