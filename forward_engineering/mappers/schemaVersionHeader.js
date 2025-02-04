const { commentLines } = require('../helpers/commentLinesHelper');

/**
 * Generates a commented header containing the schema version and the generation date.
 *
 * @param {Object} param0
 * @param {string} param0.schemaVersion - The version of the schema.
 * @returns {string} - The commented header containing the schema version and generation date.
 */
function getSchemaVersionHeader({ schemaVersion }) {
	let statement = '';
	const trimmedSchemaVersion = schemaVersion?.trim();
	if (trimmedSchemaVersion) {
		statement = `Schema Version: ${trimmedSchemaVersion}\n`;
	}
	const localDate = new Date().toLocaleString();
	statement += `Generated on: ${localDate}`;

	return commentLines({ statement });
}

module.exports = {
	getSchemaVersionHeader,
};
