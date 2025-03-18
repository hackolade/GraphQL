/**
 * @import {DocumentNode, Kind} from "graphql"
 */

/**
 * Find nodes by kind
 *
 * @param {object} options
 * @param {Kind} options.kind - The kind of node to find
 * @param {DocumentNode[]} options.nodes - The nodes to search
 * @returns {DocumentNode[]} The found nodes
 */
function findNodesByKind({ kind, nodes }) {
	if (!nodes || !Array.isArray(nodes)) {
		return [];
	}
	return nodes.filter(node => node.kind === kind);
}

module.exports = {
	findNodesByKind,
};
