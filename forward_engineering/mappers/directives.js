/**
 * @import { DirectivesSchema, Directive, FEStatement, DirectiveLocations, IdToNameMap } from "../types/types"
 */

const { DIRECTIVE_LOCATIONS } = require('../constants/feScriptConstants');
const { getArguments } = require('./arguments');

const UNKNOWN_LOCATION = 'UNKNOWN_LOCATION';

/**
 * Map directive locations to a string.
 *
 * @param {Object} args - The arguments object
 * @param {DirectiveLocations} [args.directiveLocations] - The directive locations object with all available locations
 * @return {string}
 */
function mapDirectiveLocations({ directiveLocations = {} }) {
	const directiveLocationsString = Object.keys(directiveLocations)
		.filter(location => location !== 'id')
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
 * @param {Object} args - The arguments object
 * @param {string} args.name - The name of directive
 * @param {Directive} args.directive - The directive object
 * @param {IdToNameMap} args.idToNameMap - The ID to name map of all available types in model - needs for arguments
 * @return {FEStatement}
 */
function mapDirective({ name, directive, idToNameMap }) {
	const directiveName = getDirectiveName(name);
	const directiveLocations = mapDirectiveLocations({ directiveLocations: directive.directiveLocations });
	const directiveArguments = getArguments({ arguments: directive.arguments, idToNameMap });

	return {
		statement: `directive ${directiveName}${directiveArguments} on ${directiveLocations}`,
		description: directive.description || '',
		isActivated: directive.isActivated,
	};
}

/**
 * Maps directives to an FEStatement objects.
 *
 * @param {Object} args - The arguments object
 * @param {DirectivesSchema} args.directives - The directives schema object
 * @returns {FEStatement[]}
 */
function getDirectives({ idToNameMap, directives = {} }) {
	return Object.entries(directives).map(([name, directive]) => mapDirective({ name, directive, idToNameMap }));
}

module.exports = {
	mapDirectiveLocations,
	getDirectiveName,
	mapDirective,
	getDirectives,
};
