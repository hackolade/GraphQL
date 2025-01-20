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
	const escapedDescription = trimmedDescription.replace(/"/g, '\\"');
	const isMultiLine = escapedDescription.includes('\n');

	// Format the description based on whether it is multi-line or single-line
	const formattedDescription = isMultiLine ? `"""\n${escapedDescription}\n"""` : `"${escapedDescription}"`;

	return formattedDescription;
}

module.exports = {
	getStatementDescription,
};
