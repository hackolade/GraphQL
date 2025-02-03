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
	} = feStatement;

	let result = '';

	result += formatDescription(description);
	result += statement;
	result += formatNestedStatements({
		nestedStatements,
		isParentActivated: isActivated,
		useNestedStatementSigns,
		startNestedStatementsSign,
		endNestedStatementsSign,
		nestedStatementsSeparator,
	});

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
		return ` ${startNestedStatementsSign}\n${formattedNestedStatements}\n${endNestedStatementsSign}`;
	} else {
		return `\n${formattedNestedStatements}`;
	}
}

module.exports = {
	formatFEStatement,
};
