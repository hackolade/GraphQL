/**
 * @import {DirectivePropertyData, IdToNameMap} from "../../shared/types/types"
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { isUUID } = require('../helpers/isUUID');

/**
 * Gets the directives usage statement by mapping directives to strings and joining them.
 *
 * @param {object} params
 * @param {DirectivePropertyData[]} params.directives - Array of directive definitions
 * @param {IdToNameMap} [params.definitionsIdToNameMap] - The definitions id to name map.
 * @returns {string} - The joined directive statements
 */
function getDirectivesUsageStatement({ directives = [], definitionsIdToNameMap = {} }) {
	const mappedDirectives = directives
		.map(directive => mapDirective({ directive, definitionsIdToNameMap }))
		.filter(Boolean);
	return joinInlineStatements({ statements: mappedDirectives });
}

/**
 * Maps a single directive to its string representation with name and arguments.
 *
 * @param {object} params - The parameters object
 * @param {DirectivePropertyData} params.directive - The directive to map
 * @param {IdToNameMap} [params.definitionsIdToNameMap] - The definitions id to name map.
 * @returns {string} - The directive statement or empty string if invalid
 */
function mapDirective({ directive, definitionsIdToNameMap }) {
	if (directive.directiveFormat === 'Raw') {
		return formatRawDirective({ rawDirective: directive.rawDirective });
	}

	if (directive.directiveFormat === 'Structured') {
		const directiveName = getDirectiveName({ directiveName: directive.directiveName, definitionsIdToNameMap });
		if (!directiveName) {
			return '';
		}
		const directiveArguments = mapDirectiveRawArguments({ directive });
		return joinInlineStatements({ statements: [directiveName, directiveArguments], separator: '' });
	}

	return '';
}

/**
 * Maps a directive's raw arguments to a formatted string. Handles adding parentheses and cleaning up newlines.
 *
 * @param {object} params
 * @param {DirectivePropertyData} params.directive - The directive containing the arguments
 * @returns {string} - The formatted arguments string or empty string if no valid arguments
 */
function mapDirectiveRawArguments({ directive }) {
	if (directive.argumentValueFormat === 'Raw') {
		const argumentsValue = directive.rawArgumentValues?.replace(/\n/g, ' ').trim() || '';
		if (!argumentsValue) {
			return '';
		}
		if (!argumentsValue.startsWith('(')) {
			return `(${argumentsValue})`;
		}
		return argumentsValue;
	}
	return '';
}

/**
 * Resolves and formats a directive name, ensuring proper @ prefix.
 *
 * @param {object} params
 * @param {string} params.directiveName - The raw directive name or ID
 * @param {IdToNameMap} [params.definitionsIdToNameMap] - The definitions id to name map.
 * @returns {string} - The formatted directive name or empty string if invalid
 */
function getDirectiveName({ directiveName, definitionsIdToNameMap }) {
	const resolvedDirectiveName = (definitionsIdToNameMap[directiveName] || directiveName || '').trim();
	if (typeof resolvedDirectiveName !== 'string' || resolvedDirectiveName === '' || isUUID(resolvedDirectiveName)) {
		return '';
	}
	if (resolvedDirectiveName.startsWith('@')) {
		return resolvedDirectiveName;
	}
	return `@${resolvedDirectiveName}`;
}

/**
 * Formats a raw directive string by trimming whitespace and normalizing newlines.
 *
 * @param {object} params
 * @param {string} params.rawDirective - The raw directive string to format
 * @returns {string} - The formatted directive string or empty string if invalid
 */
function formatRawDirective({ rawDirective }) {
	if (typeof rawDirective !== 'string') {
		return '';
	}

	const trimmedDirective = rawDirective.trim().replace(/\n/g, ' ');

	return trimmedDirective;
}

module.exports = {
	getDirectivesUsageStatement,
};
