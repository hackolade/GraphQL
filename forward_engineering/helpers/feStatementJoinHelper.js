/**
 * Joins an array of statements into a single line. Trims each statement, filters out empty statements, and joins them
 * with a space.
 *
 * @param {object} param0
 * @param {string[]} param0.statements - The array of statements to join.
 * @param {string} [param0.separator]
 * @returns {string} - The joined statements as a single line.
 */
function joinInlineStatements({ statements, separator = ' ' }) {
	return statements
		.map(statement => statement?.trim())
		.filter(statement => typeof statement === 'string' && statement.length > 0)
		.join(separator);
}

module.exports = {
	joinInlineStatements,
};
