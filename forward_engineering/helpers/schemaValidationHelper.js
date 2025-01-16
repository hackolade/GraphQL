const { buildSchema, validateSchema } = require('graphql');

/**
 * @typedef {Object} ValidationResponseEntity
 * @property {string} type - The type of the entity (e.g., 'error', 'success').
 * @property {string} label - The label for the entity, typically indicating the location.
 * @property {string} title - The title of the entity, typically the error message.
 * @property {string} [context] - The context of the entity, typically additional information.
 */

/**
 * Validates the given GraphQL schema.
 * @param {Object} params - The parameters for validation.
 * @param {string} params.schema - The GraphQL schema to be validated.
 * @returns {ValidationResponseEntity[]} An array of validation results.
 */
function validate({ schema }) {
	let builtSchema;
	try {
		builtSchema = buildSchema(schema);
	} catch (error) {
		return [mapValidationError(error)];
	}

	const errors = validateSchema(builtSchema);
	if (errors.length) {
		return errors.map(mapValidationError);
	}

	return getSucceedResponse();
}

/**
 * Maps a GraphQL validation error to a custom error format.
 * @param {Object} error - The GraphQL validation error.
 * @param {string} error.message - The error message.
 * @param {Object[]} [error.locations] - The locations of the error in the schema.
 * @returns {ValidationResponseEntity} The mapped error object.
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
 * @param {Object} error - The GraphQL validation error.
 * @param {Object[]} [error.locations] - The locations of the error in the schema.
 * @param {number} error.locations[].line - The line number of the error location.
 * @param {number} error.locations[].column - The column number of the error location.
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
 * @returns {ValidationResponseEntity[]} An array containing the success response.
 */
function getSucceedResponse() {
	return [getResponseEntity({ type: 'success', label: '', title: 'GraphQL schema is valid' })];
}

/**
 * Gets a response entity.
 * @param {Object} params - The parameters for the response entity.
 * @param {string} params.type - The type of the entity.
 * @param {string} params.label - The label for the entity.
 * @param {string} params.title - The title of the entity.
 * @param {string} [params.context] - The context of the entity.
 * @returns {ValidationResponseEntity} The response entity.
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
