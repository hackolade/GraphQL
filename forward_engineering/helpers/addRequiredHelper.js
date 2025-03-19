/**
 * Adds required indicator.
 *
 * @param {object} param0
 * @param {string} param0.type - The type name statement.
 * @param {boolean} param0.required - Indicates if the field is required.
 * @returns {string} - The type name with required indicator.
 */
function addRequired({ type, required }) {
	if (required) {
		return `${type}!`;
	}
	return type;
}

module.exports = {
	addRequired,
};
