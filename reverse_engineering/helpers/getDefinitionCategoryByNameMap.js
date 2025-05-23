/**
 * @import {DefinitionNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap} from "../../shared/types/re"
 */

const { astNodeKind } = require('../constants/graphqlAST');

const kindToDefinitionTypeName = {
	[astNodeKind.SCALAR_TYPE_DEFINITION]: 'Scalars',
	[astNodeKind.ENUM_TYPE_DEFINITION]: 'Enums',
	[astNodeKind.OBJECT_TYPE_DEFINITION]: 'Objects',
	[astNodeKind.INTERFACE_TYPE_DEFINITION]: 'Interfaces',
	[astNodeKind.UNION_TYPE_DEFINITION]: 'Unions',
	[astNodeKind.INPUT_OBJECT_TYPE_DEFINITION]: 'Input objects',
	[astNodeKind.DIRECTIVE_DEFINITION]: 'Directives',
};

/**
 * Find nodes by kind with proper typing
 *
 * @param {object} options
 * @param {DefinitionNode[]} options.nodes - The nodes to search
 * @param {string[]} options.rootTypeNames - The root type names to exclude
 * @returns {DefinitionNameToTypeNameMap} The found nodes with proper type
 */
function getDefinitionCategoryByNameMap({ nodes, rootTypeNames }) {
	return nodes
		.filter(node => kindToDefinitionTypeName[node.kind])
		.reduce((acc, node) => {
			if ('name' in node && node.name !== undefined) {
				const isRootType = rootTypeNames.includes(node.name.value);
				if (!isRootType) {
					acc[node.name.value] = kindToDefinitionTypeName[node.kind];
				}
			}
			return acc;
		}, {});
}

module.exports = {
	getDefinitionCategoryByNameMap,
};
