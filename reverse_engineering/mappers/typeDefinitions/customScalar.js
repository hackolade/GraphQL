/**
 * @import { ScalarTypeDefinitionNode } from "graphql"
 * @import { CustomScalarDefinition } from "../../types/types"
 */

const { mapDirectivesUsage } = require('../directiveUsage');

/**
 * Maps the custom scalar type definitions
 * @param {Object} params
 * @param {ScalarTypeDefinitionNode[]} params.customScalars - The custom scalars
 * @returns {CustomScalarDefinition[]} The mapped custom scalar type definitions
 */
function getCustomScalarTypeDefinitions({ customScalars = [] }) {
	return customScalars.map(scalar => mapCustomScalar({ scalar }));
}

/**
 * Maps a single custom scalar definition
 * @param {Object} params
 * @param {ScalarTypeDefinitionNode} params.scalar - The scalar to map
 * @returns {CustomScalarDefinition} The mapped custom scalar definition
 */
function mapCustomScalar({ scalar }) {
	return {
		type: 'scalar',
		name: scalar.name.value,
		description: scalar.description?.value || '',
		typeDirectives: mapDirectivesUsage({ directives: scalar.directives }),
	};
}

module.exports = {
	getCustomScalarTypeDefinitions,
};
