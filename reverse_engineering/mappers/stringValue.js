/**
 * @import { StringValueNode } from "graphql"
 */

/**
 * Maps a string value node to a string
 * @param {Object} params
 * @param {StringValueNode} params.node - The string value node
 * @returns {string} The mapped string
 */
function mapStringValueNode({ node }) {
	return node?.value || '';
}

module.exports = {
	mapStringValueNode,
};
