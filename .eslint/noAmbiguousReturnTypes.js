/**
 * @import {RuleContext, RuleContext, RuleListener, RuleModule, Node} from 'eslint';
 */

/**
 * Checks if a comment contains not object return types
 *
 * @param {string} commentText - The JSDoc comment text
 * @returns {boolean} True if the comment has an object return type
 */
const hasObjectReturnType = commentText => {
	const regex = /\*\s+@returns?\s+\{(object|Object|any|Record<\w+,\s*(any|object)>)\b/i;
	return regex.test(commentText);
};

/**
 * Creates an ESLint rule handler to detect and report usages of 'object' as a return type in JSDoc
 *
 * @param {RuleContext} context - The ESLint rule context object
 * @returns {RuleListener} The rule listener with handlers for JSDoc comments
 */
function create(context) {
	const sourceCode = context.sourceCode;

	/**
	 * Processes a node to find its JSDoc comment and check for object return types
	 *
	 * @param {Node} node - The AST node to check
	 */
	const checkJSDocComment = node => {
		const comments = sourceCode.getAllComments();

		// Find the closest comment before the node that looks like JSDoc
		const jsDocComments = comments.filter(
			comment =>
				comment.type === 'Block' &&
				comment.value.startsWith('*') &&
				comment.loc.end.line + 1 >= node.loc.start.line &&
				comment.loc.end.line < node.loc.start.line + 3,
		);

		for (const comment of jsDocComments) {
			if (hasObjectReturnType(comment.value)) {
				context.report({
					node: comment,
					messageId: 'noAmbiguousReturnTypes',
				});
			}
		}
	};

	return {
		FunctionDeclaration: checkJSDocComment,
		FunctionExpression: checkJSDocComment,
		ArrowFunctionExpression: checkJSDocComment,
		MethodDefinition: checkJSDocComment,
	};
}

/**
 * ESLint rule to enforce specific return types instead of generic 'object' in JSDoc
 *
 * @type {RuleModule}
 */
module.exports = {
	meta: {
		type: 'suggestion',
		docs: {
			description: "Disallow using 'object', 'any', and 'Record<string, any>' type in JSDoc @returns tag",
			category: 'Best Practices',
			recommended: true,
		},
		fixable: null,
		schema: [],
		messages: {
			noAmbiguousReturnTypes:
				"Don't use 'object', 'any', 'Record<string, any>', 'Record<string, object>' as a return type, use a more specific type instead",
		},
	},
	create,
};
