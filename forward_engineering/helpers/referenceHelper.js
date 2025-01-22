/**
 * Get the definition name from the reference path
 *
 * @param {Object} param0
 * @param {string} param0.referencePath - The reference path, separated by '/', where the definition name is the last element.
 * @returns {string} - The definition name.
 */
function getDefinitionNameFromReferencePath({ referencePath }) {
	return referencePath.split('/').pop();
}

module.exports = {
	getDefinitionNameFromReferencePath,
};
