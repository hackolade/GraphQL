/**
 * @import {DocumentNode, GraphQLError} from "graphql"
 */

const { parse } = require('graphql');
const validationHelper = require('../../forward_engineering/helpers/schemaValidationHelper');
const localization = require('../../localization/en.json');

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
 * @throws {InvalidSchemaError} Throws if schema content cannot be parsed
 */
function parseSchema({ schemaContent }) {
	if (!schemaContent) {
		throw new InvalidSchemaError({ title: 'Invalid GraphQL Schema', message: 'Schema is empty', type: 'warning' });
	}

	try {
		const validationErrors = validateSchema(schemaContent);

		const parsedSchema = parse(schemaContent);

		return { parsedSchema, validationErrors };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStack = error instanceof Error ? error.stack : undefined;
		const message = localization.RE_INVALID_SCHEMA_ERROR_MESSAGE + '\n' + errorMessage;

		throw new InvalidSchemaError({
			title: 'Invalid GraphQL Schema',
			message,
			type: 'warning',
			stacktrace: errorStack,
		});
	}
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

/**
 * Error object for invalid GraphQL schema
 */
class InvalidSchemaError extends Error {
	/**
	 * @param {object} params
	 * @param {string} params.title - The title of the error
	 * @param {string} params.message - The error message
	 * @param {string} params.type - The type of error
	 * @param {string} [params.stacktrace] - The stack trace of the error (optional)
	 */
	constructor({ title, message, type, stacktrace }) {
		super(message);
		this.title = title;
		this.type = type;
		this.stack = stacktrace;
	}
}

module.exports = {
	parseSchema,
	InvalidSchemaError,
};
