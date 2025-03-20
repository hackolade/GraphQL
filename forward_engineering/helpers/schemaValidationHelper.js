/**
 * @import {GraphQLError} from "graphql"
 * @import {ValidationResponseItem} from "../../shared/types/types"
 */

const { buildSchema, validateSchema } = require('graphql');

/**
 * Validates the given GraphQL schema.
 *
 * @param {object} params - The parameters for validation.
 * @param {string} params.schema - The GraphQL schema to be validated.
 * @returns {ValidationResponseItem[]} An array of validation results.
 */
function validate({ schema }) {
	let builtSchema;
	try {
		builtSchema = buildSchema(schema);
	} catch (error) {
		return [mapValidationError(/** @type {GraphQLError} */ (error))];
	}

	const errors = validateSchema(builtSchema);
	if (errors.length) {
		return errors.map(mapValidationError);
	}

	return getSucceedResponse();
}

/**
 * Maps a GraphQL validation error to a custom error format.
 *
 * @param {GraphQLError} error - The GraphQL validation error.
 * @returns {ValidationResponseItem} The mapped error object.
 */
function mapValidationError(error) {
	return getResponseEntity({
		type: 'error',
		label: getErrorPositionMessage(error),
		title: error.message,
	});
}

/**
 * Gets the error position message from a GraphQL validation error.
 *
 * @param {GraphQLError} error - The GraphQL validation error.
 * @returns {string} The error position message.
 */
function getErrorPositionMessage(error) {
	if (Array.isArray(error.locations) && error.locations.length > 0) {
		return error.locations.map(location => `Line ${location.line}, column ${location.column}`).join('; ');
	}

	return '';
}

/**
 * Gets the success response for a valid GraphQL schema.
 *
 * @returns {ValidationResponseItem[]} An array containing the success response.
 */
function getSucceedResponse() {
	return [getResponseEntity({ type: 'success', label: '', title: 'GraphQL schema is valid' })];
}

/**
 * Gets a response entity.
 *
 * @param {object} params - The parameters for the response entity.
 * @param {string} params.type - The type of the entity.
 * @param {string} params.label - The label for the entity.
 * @param {string} params.title - The title of the entity.
 * @param {string} [params.context] - The context of the entity.
 * @returns {ValidationResponseItem} The response entity.
 */
function getResponseEntity({ type, label, title, context = '' }) {
	return {
		type,
		label,
		title,
		context,
	};
}

module.exports = {
	validate,
};
