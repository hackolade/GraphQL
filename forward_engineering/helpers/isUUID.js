/**
 * Checks if a given value is a valid UUID string.
 *
 * @param {string} value - The value to check.
 * @returns {boolean} - Returns true if the value is a valid UUID, otherwise false.
 */
function isUUID(value) {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
}

module.exports = {
	isUUID,
};
