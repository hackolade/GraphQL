const fs = require('fs').promises;

/**
 * Reads the content of a file
 *
 * @param {object} params
 * @param {string} params.filePath
 * @returns {Promise<string>}
 */
const readFileContent = async ({ filePath }) => {
	try {
		if (!filePath) {
			throw new Error('File path is required');
		}

		const content = await fs.readFile(filePath, 'utf8');
		return content.toString();
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to read GraphQL schema file: ${errorMessage}`);
	}
};

module.exports = { readFileContent };
