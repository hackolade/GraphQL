/**
 * @import {UnionDefinitions, FEStatement, Union, UnionMemberType} from "../../shared/types/types"
 */

const { getDefinitionNameFromReferencePath } = require('../helpers/referenceHelper');
const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');

/**
 * Map the union member types to a string.
 *
 * @param {object} params - The arguments
 * @param {UnionMemberType[]} params.unionMemberTypes - The union member types with all properties
 * @returns {string}
 */
const getUnionMemberTypes = ({ unionMemberTypes }) => {
	return unionMemberTypes
		.map(unionMemberType => {
			if (unionMemberType.$ref) {
				return getDefinitionNameFromReferencePath({ referencePath: unionMemberType.$ref });
			}
		})
		.filter(Boolean) // Filter out empty subschemas when a user missed to add union member types
		.join(' | ');
};

/**
 * Maps a union to an FEStatement.
 *
 * @param {object} args - The arguments
 * @param {string} args.name - The name of the union.
 * @param {Union} args.union - The union object with all properties
 * @returns {FEStatement}
 */
const mapUnion = ({ name, union }) => {
	const unionMemberTypes = getUnionMemberTypes({ unionMemberTypes: union.oneOf });
	const unionDirectives = getDirectivesUsageStatement({ directives: union.typeDirectives });
	return {
		statement: joinInlineStatements({ statements: ['union', name, unionDirectives, '=', unionMemberTypes] }),
		description: union.description,
		isActivated: union.isActivated,
	};
};
/**
 * Maps the union types to an array of FEStatement.
 *
 * @param {object} args - The arguments
 * @param {UnionDefinitions} args.unions - The union types schema.
 * @returns {FEStatement[]}
 */
const getUnions = ({ unions }) => {
	return Object.entries(unions).map(([name, union]) => mapUnion({ name, union }));
};

module.exports = {
	getUnionMemberTypes,
	mapUnion,
	getUnions,
};
