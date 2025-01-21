/**
 * @typedef { import("../types/types").DirectivePropertyData } DirectivePropertyData
 */

const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');

/**
 * Gets the directives property as a string.
 * @param {Object} param0
 * @param {DirectivePropertyData[]} param0.directives
 * @returns {String}
 */
function getDirectivesUsageStatement({ directives = [] }) {
	const mappedDirectives = directives.map(directive => mapDirectiveUsage({ directive })).filter(Boolean);

	return joinInlineStatements({ statements: mappedDirectives });
}

/**
 * Maps a directive property to a string.
 * New line characters are replaced with spaces to avoid breaking the statement.
 * @param {Object} param0
 * @param {DirectivePropertyData} param0.directive
 * @returns {String}
 */
function mapDirectiveUsage({ directive }) {
	if (directive.directiveFormat === 'Raw') {
		return directive.rawDirective?.replace(/\n/g, ' ').trim() || '';
	}
	return '';
}

module.exports = {
	getDirectivesUsageStatement,
};
