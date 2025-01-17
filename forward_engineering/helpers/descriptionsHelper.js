/**
 * Formats the description for a GraphQL statement using triple quotes.
 *
 * @param {Object} param0
 * @param {string} param0.description - The description to format
 * @returns {string} - The formatted description
 */
function getRootStatementDescription({ description }) {
	if (!description) {
		return '';
	}

	// Format the description using triple quotes
	const formattedDescription = `"""\n${description}\n"""`;

	return formattedDescription;
}

module.exports = {
	getRootStatementDescription,
};
