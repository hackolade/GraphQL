const validationHelper = require('./helpers/schemaValidationHelper');

/**
 * @typedef {Object} Container
 * @property {Object[]} containerData - Container level data properties by tab
 * @property {string[]} entities - Entities ids
 * @property {string[]} jsonSchema - JSON schema by entity id
 */

/**
 * @typedef {Object} Options
 * @property {Object[]} additionalOptions
 * @property {boolean} isCalledFromFETab
 */

/**
 * @typedef {Object} Data
 * @property {Object[]} modelLevelData - Model level data properties by tab
 * @property {Options} options
 * @property {Container[]} containers
 * @property {string} externalDefinitions
 * @property {string} modelDefinitions
 * @property {Object} targetScriptOptions
 */

/**
 * @typedef {Object} Logger
 * @property {Function} log
 */

/**
 * @callback GenerateScriptCallback
 * @param {Error|null} error
 * @param {string} [result]
 */

/**
 * @callback ValidateScriptCallback
 * @param {Error|null} error
 * @param {Array} [result]
 */

const mockedScript = `# The schema is hardcoded for demonstration purposes only.
interface SearchResult {
	id: ID
	title: String!
}

# type Query {
# 	search(keyword: String): [SearchResult]
# }

type User implements SearchResult {
	name: String!
	email: String!
}

type Post implements SearchResult {
	id: ID!
	title: String!
	content: String!
	author: User
}`;

module.exports = {
	/**
	 * Generates the model FE script for the given data.
	 * @param {Data} data - The data for generating the model script.
	 * @param {Logger} logger - The logger for logging errors.
	 * @param {GenerateScriptCallback} cb - The callback function.
	 */
	generateModelScript(data, logger, cb) {
		try {
			cb(null, mockedScript);
		} catch (err) {
			logger.log('error', { error: err }, 'GraphQL FE Error');
			cb(err);
		}
	},

	/**
	 * Validates the given script data.
	 * @param {Object} data - The data for validation.
	 * @param {string} data.script - The script to be validated.
	 * @param {Object} data.targetScriptOptions - Options for the target script.
	 * @param {Logger} logger - The logger for logging errors.
	 * @param {ValidateScriptCallback} cb - The callback function.
	 */
	validate(data, logger, cb) {
		const { script } = data;
		try {
			const validationResults = validationHelper.validate({ schema: script });
			cb(null, validationResults);
		} catch (e) {
			logger.log('error', { error: e }, 'GraphQL schema validation error');
			cb(e.message);
		}
	},
};
