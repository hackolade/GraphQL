/**
 * @import {DefinitionTypeName} from "../../shared/types/types"
 */

/**
 * Returns the path to the definition reference
 *
 * @param {object} params
 * @param {DefinitionTypeName} params.definitionCategoryName - The definition category name
 * @param {string} params.definitionName - The definition name
 * @returns {string} The path to the definition reference
 */
function getDefinitionReferencePath({ definitionCategoryName, definitionName }) {
	return `#model/definitions/${definitionCategoryName}/${definitionName}`;
}

module.exports = {
	getDefinitionReferencePath,
};
