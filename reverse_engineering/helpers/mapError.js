/**
 * @import {REError} from "../../shared/types/types"
 */

const { InvalidSchemaError } = require('./parseSchema');

/**
 * Maps different error types to a standardized error object structure for consistent error handling.
 *
 * @param {unknown} error - Any error object or primitive to be mapped
 * @returns {REError} Standardized error object
 */
function mapError(error) {
	if (error instanceof InvalidSchemaError) {
		return {
			title: error.title,
			message: error.message,
			type: error.type || 'error',
			stack: error.stack,
		};
	}

	if (error instanceof Error) {
		return {
			title: error.name || 'Error',
			message: error.message,
			type: 'error',
			stack: error.stack,
		};
	}

	if (error && typeof error === 'object') {
		const errorMessage = 'message' in error ? String(error.message) : 'Unknown error occurred';
		const errorType = 'type' in error ? String(error.type) : 'error';
		const errorTitle = 'title' in error ? String(error.title) : undefined;
		const stackTrace = 'stack' in error ? String(error.stack) : undefined;

		return {
			title: errorTitle,
			message: errorMessage,
			type: errorType,
			stack: stackTrace,
		};
	}

	return {
		title: 'Error',
		message: String(error),
		type: 'error',
	};
}

module.exports = {
	mapError,
};
