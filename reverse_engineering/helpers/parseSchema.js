/**
 * @import {DocumentNode, GraphQLError} from "graphql"
 */

const { parse } = require('graphql');
const validationHelper = require('../../forward_engineering/helpers/schemaValidationHelper');

/**
 * Parses GraphQL schema content into AST and validates it
 *
 * @param {object} params
 * @param {string} params.schemaContent - The GraphQL schema content to parse
 * @returns {{
 * 	parsedSchema: DocumentNode;
 * 	validationErrors: string[];
 * }} The parsing result object containing parsed
 *   schema and validation errors
 * @throws {Error} Throws if schema content cannot be parsed
 */
function parseSchema({ schemaContent }) {
	if (!schemaContent) {
		throw new Error('Schema is empty');
	}

	const validationErrors = validateSchema(schemaContent);

	const parsedSchema = parse(schemaContent);

	return { parsedSchema, validationErrors };
}

/**
 * Validates the given schema content.
 *
 * @param {string} schemaContent - The schema content to validate.
 * @returns {string[]} An array of validation error messages.
 */
function validateSchema(schemaContent) {
	const validationResults = validationHelper.validate({ schema: schemaContent });

	return validationResults
		.filter(validationResult => validationResult.type !== 'success')
		.map(validationError => {
			if (validationError.label) {
				return `${validationError.title}: ${validationError.label}`;
			}
			return validationError.title;
		});
}

module.exports = {
	parseSchema,
};
