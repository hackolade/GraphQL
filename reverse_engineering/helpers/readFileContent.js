const fs = require('fs').promises;

const readFileContent = async ({ filePath }) => {
	try {
		if (!filePath) {
			throw new Error('File path is required');
		}

		const content = await fs.readFile(filePath, 'utf8');
		return content;
	} catch (error) {
		throw new Error(`Failed to read GraphQL schema file: ${error.message}`);
	}
};

module.exports = { readFileContent };
