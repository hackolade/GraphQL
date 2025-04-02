/**
 * Formats the description for a GraphQL statement.
 * Uses triple quotes for multi-line descriptions and single quotes for single-line descriptions.
 *
 * @param {Object} param0
 * @param {string} param0.description - The description to format
 * @returns {string} - The formatted description
 */
function getStatementDescription({ description }) {
	if (!description) {
		return '';
	}

	const trimmedDescription = description.trim();
	const isMultiLine = trimmedDescription.includes('\n');

	if (!isMultiLine) {
		// Escape double quotes for single-line descriptions
		const escapedDescription = trimmedDescription.replace(/"/g, '\\"');
		return `"${escapedDescription}"`;
	}

	return `"""\n${trimmedDescription}\n"""`;
}

module.exports = {
	getStatementDescription,
};
