/**
 * @import {NamedTypeNode, UnionTypeDefinitionNode} from "graphql"
 * @import {DefinitionNameToTypeNameMap, REUnionDefinition, REUnionMemberType} from "../../../shared/types/types"
 */

const { getDefinitionReferencePath } = require('../../helpers/getDefinitionReferencePath');
const { mapDirectivesUsage } = require('../directiveUsage');

/**
 * Maps union type definitions
 *
 * @param {object} params
 * @param {UnionTypeDefinitionNode[]} params.unions - The union types
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @returns {REUnionDefinition[]} The mapped union type definitions
 */
function getUnionTypeDefinitions({ unions = [], definitionCategoryByNameMap }) {
	return unions.map(union => mapUnion({ union, definitionCategoryByNameMap }));
}

/**
 * Maps a single union type definition
 *
 * @param {object} params
 * @param {UnionTypeDefinitionNode} params.union - The union to map
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @returns {REUnionDefinition} The mapped union type definition
 */
function mapUnion({ union, definitionCategoryByNameMap }) {
	return {
		type: 'union',
		name: union.name.value,
		description: union.description?.value || '',
		typeDirectives: mapDirectivesUsage({ directives: [...(union.directives || [])] }),
		oneOf: mapUnionTypes({ types: [...(union.types || [])], definitionCategoryByNameMap }),
	};
}

/**
 * Maps the union types to references
 *
 * @param {object} params
 * @param {NamedTypeNode[]} params.types - The types that the union can be
 * @param {DefinitionNameToTypeNameMap} params.definitionCategoryByNameMap - The definition category by name map
 * @returns {REUnionMemberType[]} The mapped union types as references
 */
function mapUnionTypes({ types, definitionCategoryByNameMap }) {
	return types.map(type => {
		const typeName = type.name.value;
		const definitionCategoryName = definitionCategoryByNameMap[typeName];

		if (definitionCategoryName) {
			return {
				$ref: getDefinitionReferencePath({ definitionCategoryName, definitionName: typeName }),
			};
		}

		// Fallback to Objects
		return {
			$ref: getDefinitionReferencePath({ definitionCategoryName: 'Objects', definitionName: typeName }),
		};
	});
}

module.exports = {
	getUnionTypeDefinitions,
};
