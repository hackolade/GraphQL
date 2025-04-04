/**
 * @param {object} params
 * @param {string} params.name
 * @returns {string} The directive name with "@" prefix
 */
function getDirectiveName({ name }) {
	return `@${name}`;
}

module.exports = {
	getDirectiveName,
};
