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
	const commentText = formatSingleLineComment(comment);

	result += formatDescription(description);
	result += statement;
	const nestedStatementsText = formatNestedStatements({
		nestedStatements,
		isParentActivated: isActivated,
		useNestedStatementSigns,
		startNestedStatementsSign,
		endNestedStatementsSign,
		nestedStatementsSeparator,
		parentComment: commentText,
	});

	if (nestedStatementsText) {
		// If there are nested statements, we add them to the result
		// and add the comment to the parent statement, it is added after startNestedStatementsSign and before the nested statements
		result += nestedStatementsText;
	} else {
		// If there are no nested statements, we add the comment to the parent statement
		result += commentText;
	}

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
	parentComment = '',
}) {
	if (!nestedStatements?.length) {
		return '';
	}

	const formattedNestedStatements = nestedStatements
		.map(nestedStatement => {
			const formattedStatement = formatFEStatement({
				feStatement: {
					...nestedStatement,
					isActivated: !isParentActivated ? true : nestedStatement.isActivated,
				},
			});
			return addIndentToStatement({ statement: formattedStatement });
		})
		.join(nestedStatementsSeparator);

	if (useNestedStatementSigns) {
		return ` ${startNestedStatementsSign}${parentComment}\n${formattedNestedStatements}\n${endNestedStatementsSign}`;
	} else {
		return `${parentComment}\n${formattedNestedStatements}`;
	}
}

function formatSingleLineComment(comment) {
	return comment ? ` # ${comment}` : '';
}

module.exports = {
	formatFEStatement,
};
