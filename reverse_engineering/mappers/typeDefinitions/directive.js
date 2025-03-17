/**
 * @import { DirectiveDefinitionNode } from "graphql"
 * @import { DirectiveDefinition } from "../../types/types"
 */

const { getDirectiveName } = require('../directiveName');

const locationMap = {
	'SCHEMA': 'schema',
	'QUERY': 'query',
	'MUTATION': 'mutation',
	'SUBSCRIPTION': 'subscription',
	'SCALAR': 'scalar',
	'ENUM': 'enum',
	'ENUM_VALUE': 'enumValue',
	'OBJECT': 'object',
	'INTERFACE': 'interface',
	'UNION': 'union',
	'INPUT_OBJECT': 'inputObject',
	'FIELD': 'field',
	'FIELD_DEFINITION': 'fieldDefinition',
	'INPUT_FIELD_DEFINITION': 'inputFieldDefinition',
	'ARGUMENT_DEFINITION': 'argumentDefinition',
};

/**
 * Maps the directive type definitions
 * @param {Object} params
 * @param {DirectiveDefinitionNode[]} params.directives - The directives
 * @returns {DirectiveDefinition[]} The mapped directive type definitions
 */
function getDirectiveTypeDefinitions({ directives = [] }) {
	return directives.map(directive => mapDirective({ directive }));
}

/**
 * Maps a single directive definition
 * @param {Object} params
 * @param {DirectiveDefinitionNode} params.directive - The directive to map
 * @returns {DirectiveDefinition} The mapped directive definition
 */
function mapDirective({ directive }) {
	const locations = directive.locations.reduce((acc, location) => {
		const locationKey = locationMap[location.value];
		if (locationKey) {
			acc[locationKey] = true;
		}
		return acc;
	}, {});

	return {
		type: 'directive',
		name: getDirectiveName({ name: directive.name.value }),
		description: directive.description?.value || '',
		arguments: [], // TODO: implement argument mapping
		directiveLocations: locations,
	};
}

module.exports = {
	getDirectiveTypeDefinitions,
};
