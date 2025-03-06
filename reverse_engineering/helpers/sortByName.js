/**
 * @import { FieldsOrder } from "../types/types"
 */

/**
 * Sorts an array of objects by the name according to the fields order option
 * @param {Object} params
 * @param {Object[]} params.items - The items to sort
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {Object[]} The sorted items
 */
function sortByName({ items, fieldsOrder }) {
	if (!Array.isArray(items)) {
		return items;
	}
	if (fieldsOrder === 'alphabetical') {
		return items.sort((a, b) => a.name.localeCompare(b.name));
	}

	return items;
}

module.exports = {
	sortByName,
};
