/**
 * @import { FEStatement } from "../types/types"
 */

const { commentLines } = require('./commentLinesHelper');
const { getStatementDescription } = require('./descriptionsHelper');
const { addIndentToStatement } = require('./feStatementIndentHelper');

/**
 * Combines the description and statement, and comments out the statement if it is deactivated.
 * Adds formatted nested statements if they exist.
 *
 * @param {Object} param0
 * @param {FEStatement} param0.feStatement - The forward engineering statement object.
 * @returns {string} - The final formatted statement.
 */
function formatFEStatement({ feStatement }) {
	const {
		statement,
		description,
		isActivated = true,
		nestedStatements,
		useNestedStatementSigns = true,
		startNestedStatementsSign = '{',
		endNestedStatementsSign = '}',
		nestedStatementsSeparator = '\n',
		comment = '',
	} = feStatement;

	let result = '';

	result += formatDescription(description);
	result += statement;

	const nestedStatementsText = formatNestedStatements({
		nestedStatements,
		isParentActivated: isActivated,
		useNestedStatementSigns,
		startNestedStatementsSign,
		endNestedStatementsSign,
		nestedStatementsSeparator,
		comment, // Pass original comment to handle in nested statements
	});

	result += nestedStatementsText;

	if (!isActivated) {
		result = commentLines({ statement: result });
	}

	return result;
}

function formatDescription(description) {
	if (description?.trim()) {
		const formattedDescription = getStatementDescription({ description });
		return `${formattedDescription}\n`;
	}
	return '';
}

function formatNestedStatements({
	nestedStatements,
	isParentActivated,
	useNestedStatementSigns,
	startNestedStatementsSign,
	endNestedStatementsSign,
	nestedStatementsSeparator,
	comment = '',
}) {
	if (!nestedStatements?.length) {
		return formatSingleLineComment(comment);
	}

	// Split into prefix and line break (e.g. ',\n' -> [',' '\n'])
	const [prefix = '', ...lineBreakParts] = nestedStatementsSeparator.split('\n');
	const lineBreak = lineBreakParts.length ? '\n' + lineBreakParts.join('\n') : '';
	const hasPrefix = prefix.trim() !== '';

	const formattedNestedStatements = nestedStatements
		.map((nestedStatement, index) => {
			// 1. Format base statement
			const formattedStatement = formatFEStatement({
				feStatement: {
					...nestedStatement,
					isActivated: !isParentActivated ? true : nestedStatement.isActivated,
					comment: '',
				},
			});

			// 2. Add indentation
			let result = addIndentToStatement({ statement: formattedStatement });

			// 3. Add prefix (comma) if needed
			if (hasPrefix && index < nestedStatements.length - 1) {
				result += prefix;
			}

			// 4. Add comment
			if (nestedStatement.comment) {
				result += formatSingleLineComment(nestedStatement.comment);
			}

			return result;
		})
		.join(lineBreak); // Join only with line break part

	if (useNestedStatementSigns) {
		const commentText = formatSingleLineComment(comment);
		return ` ${startNestedStatementsSign}${commentText}\n${formattedNestedStatements}\n${endNestedStatementsSign}`;
	}

	return `${formatSingleLineComment(comment)}\n${formattedNestedStatements}`;
}

function formatSingleLineComment(comment) {
	return comment ? ` # ${comment}` : '';
}

module.exports = {
	formatFEStatement,
};
