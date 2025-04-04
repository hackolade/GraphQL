const path = require('path');

/**
 * @param {string} filePath - Full path to the file
 * @returns {string} File name without extension
 */
function getFileName(filePath) {
	if (!filePath) {
		return '';
	}

	return path.parse(filePath).name;
}

module.exports = {
	getFileName,
};
