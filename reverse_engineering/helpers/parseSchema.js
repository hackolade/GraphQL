/**
 * @import {DocumentNode, GraphQLError} from "graphql"
 */

const { parse } = require('graphql');

/**
 * Parses GraphQL schema content into AST and validates it
 *
 * @param {object} params
 * @param {string} params.schemaContent - The GraphQL schema content to parse
 * @returns {{
 * 	parsedSchema: DocumentNode;
 * 	validationErrors: GraphQLError[];
 * }} The parsing result object containing
 *   parsed schema and validation errors
 * @throws {GraphQLError} Throws if schema content cannot be parsed
 */
function parseSchema({ schemaContent }) {
	if (!schemaContent) {
		throw new Error('Schema is empty');
	}

	// TODO: validate before parsing
	const validationErrors = [];

	const parsedSchema = parse(schemaContent);

	return { parsedSchema, validationErrors };
}

module.exports = {
	parseSchema,
};
