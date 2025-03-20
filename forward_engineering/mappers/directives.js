/**
 * @import {DirectiveDefinitions, Directive, FEStatement, DirectiveLocations, IdToNameMap} from "../../shared/types/types"
 */

const { DIRECTIVE_LOCATIONS } = require('../constants/feScriptConstants');
const { getArguments } = require('./arguments');

const UNKNOWN_LOCATION = 'UNKNOWN_LOCATION';

/**
 * Map directive locations to a string.
 *
 * @param {object} args - The arguments object
 * @param {DirectiveLocations} [args.directiveLocations] - The directive locations object with all available locations
 * @returns {string}
 */
function mapDirectiveLocations({ directiveLocations = {} }) {
	const directiveLocationsString = Object.keys(directiveLocations)
		.filter(location => location !== 'id' && directiveLocations[location]) // should not include id and have truthy value
		.map(locations => DIRECTIVE_LOCATIONS[locations] || UNKNOWN_LOCATION)
		.join(' | ');

	if (!directiveLocationsString) {
		return `${UNKNOWN_LOCATION} # Please specify the directive locations`;
	}

	return directiveLocationsString;
}

/**
 * Convert directive name to GraphQL directive format.
 *
 * @param {string} name
 * @returns {string}
 */
const getDirectiveName = name => (name.startsWith('@') ? name : `@${name}`);

/**
 * Map a directive to an FEStatement object.
 *
 * @param {object} args - The arguments object
 * @param {string} args.name - The name of directive
 * @param {Directive} args.directive - The directive object
 * @param {IdToNameMap} args.definitionsIdToNameMap - The ID to name map of all available types in model - needs for
 *   arguments
 * @returns {FEStatement}
 */
function mapDirective({ name, directive, definitionsIdToNameMap }) {
	const directiveName = getDirectiveName(name);
	const directiveLocations = mapDirectiveLocations({ directiveLocations: directive.directiveLocations });
	const { argumentsStatement, argumentsWarningComment } = getArguments({
		graphqlArguments: directive.arguments,
		idToNameMap: definitionsIdToNameMap,
	});

	return {
		statement: `directive ${directiveName}${argumentsStatement} on ${directiveLocations}`,
		description: directive.description || '',
		isActivated: directive.isActivated,
		comment: argumentsWarningComment,
	};
}

/**
 * Maps directives to an FEStatement objects.
 *
 * @param {object} args - The arguments object
 * @param {IdToNameMap} args.definitionsIdToNameMap - The directives schema object
 * @param {DirectiveDefinitions} args.directives
 * @returns {FEStatement[]}
 */
function getDirectives({ definitionsIdToNameMap, directives = {} }) {
	return Object.entries(directives).map(([name, directive]) =>
		mapDirective({
			name,
			directive,
			definitionsIdToNameMap,
		}),
	);
}

module.exports = {
	mapDirectiveLocations,
	getDirectiveName,
	mapDirective,
	getDirectives,
};
