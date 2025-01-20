const { GRAPHQL_INDENT } = require('../constants/feScriptConstants');

/**
 * Adds indentation to each line of a given statement.
 *
 * @param {Object} param0
 * @param {string} param0.statement - The statement to which indentation will be added.
 * @param {string} [param0.indent=GRAPHQL_INDENT] - The indentation string to use. Defaults to GRAPHQL_INDENT.
 * @returns {string} - The indented statement.
 */
function addIndentToStatement({ statement, indent = GRAPHQL_INDENT }) {
	return statement
		.split('\n')
		.map(line => `${indent}${line}`)
		.join('\n');
}

module.exports = {
	addIndentToStatement,
};
