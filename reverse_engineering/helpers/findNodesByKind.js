/**
 * @import {Kind, ASTNode, ASTKindToNode} from "graphql"
 */

/**
 * Find nodes by kind with proper typing
 *
 * @template {Kind} K
 * @param {object} options
 * @param {K} options.kind - The kind of node to find
 * @param {ASTNode[]} options.nodes - The nodes to search
 * @returns {ASTKindToNode[K][]} The found nodes with proper type
 */
function findNodesByKind({ kind, nodes }) {
	if (!nodes || !Array.isArray(nodes)) {
		return [];
	}

	return /**
	 * @type {ASTKindToNode[K][]}
	 */ (nodes.filter(node => node.kind === kind));
}

module.exports = {
	findNodesByKind,
};
