/**
 * Adds comment markers to each line of a GraphQL statement. This function takes a GraphQL statement and prepends a '#'
 * character to each line, commenting out the entire statement.
 *
 * @param {object} param0
 * @param {string} param0.statement - The GraphQL statement to comment out
 * @returns {string} - Commented out statement
 */
function commentLines({ statement }) {
	const commentedStatement = statement
		.split('\n')
		.map(line => `# ${line}`)
		.join('\n');

	return commentedStatement;
}

module.exports = {
	commentLines,
};
