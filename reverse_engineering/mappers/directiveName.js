/**
 * @param {Object} params
 * @param {String} params.name
 * @returns {string} The directive name with "@" prefix
 */
function getDirectiveName({ name }) {
	return `@${name}`;
}

module.exports = {
	getDirectiveName,
};
