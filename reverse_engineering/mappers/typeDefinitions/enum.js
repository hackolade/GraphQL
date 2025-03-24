/**
 * @import {EnumTypeDefinitionNode, EnumValueDefinitionNode} from "graphql"
 * @import {REEnumDefinition, REEnumValue} from "../../../shared/types/types"
 */

const { mapDirectivesUsage } = require('../directiveUsage');

/**
 * Maps the enum type nodes to enum definitions
 *
 * @param {object} params
 * @param {EnumTypeDefinitionNode[]} params.enums - The enums nodes
 * @returns {REEnumDefinition[]} The mapped enum type definitions
 */
function getEnumTypeDefinitions({ enums = [] }) {
	return enums.map(enumNode => mapEnum({ enumNode }));
}

/**
 * Maps a single enum node to enum definition
 *
 * @param {object} params
 * @param {EnumTypeDefinitionNode} params.enumNode - The enum to map
 * @returns {REEnumDefinition} The mapped enum definition
 */
function mapEnum({ enumNode }) {
	return {
		type: 'enum',
		name: enumNode.name.value,
		description: enumNode.description?.value || '',
		enumValues: mapEnumValues({ values: [...(enumNode.values || [])] }),
		typeDirectives: mapDirectivesUsage({ directives: [...(enumNode.directives || [])] }),
	};
}

/**
 * Maps the enum value nodes to enum values definitions
 *
 * @param {object} params
 * @param {EnumValueDefinitionNode[]} params.values
 * @returns {REEnumValue[]}
 */
function mapEnumValues({ values }) {
	return values.map(value => ({
		value: value.name.value,
		description: value.description?.value || '',
		valueDirectives: mapDirectivesUsage({ directives: [...(value.directives || [])] }),
	}));
}

module.exports = {
	getEnumTypeDefinitions,

	// For testing
	mapEnum,
	mapEnumValues,
};
