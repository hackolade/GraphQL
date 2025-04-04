/**
 * @import {FieldsOrder, PreProcessedFieldData, REDefinition} from "../../shared/types/types"
 */

/**
 * Sorts an array of objects by the name according to the fields order option
 *
 * @param {object} params
 * @param {REDefinition[] | PreProcessedFieldData[]} params.items - The items to sort
 * @param {FieldsOrder} [params.fieldsOrder] - The fields order
 * @returns {REDefinition[] | PreProcessedFieldData[]} The sorted items
 */
function sortByName({ items, fieldsOrder }) {
	if (!Array.isArray(items)) {
		return items;
	}
	if (fieldsOrder === 'alphabetical') {
		return items.toSorted((a, b) => a.name.localeCompare(b.name));
	}

	return items;
}

module.exports = {
	sortByName,
};
