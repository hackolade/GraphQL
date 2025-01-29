const validationHelper = require('./helpers/schemaValidationHelper');
const { getTypeDefinitionStatements } = require('./mappers/typeDefinitions');
const { generateIdToNameMap } = require('./helpers/generateIdToNameMap');
const { getSchemaRootTypeStatements } = require('./mappers/rootTypes');

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

const mockedRootQuery = `# The type Query is hardcoded for now, to remove validation error.
type Query {
	getSomething: String
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
			const modelDefinitions = JSON.parse(data.modelDefinitions);
			const definitionsIdToNameMap = generateIdToNameMap(modelDefinitions.properties);

			const rootTypeStatements = getSchemaRootTypeStatements({
				containers: data.containers,
				definitionsIdToNameMap,
			});
			const typeDefinitionStatements = getTypeDefinitionStatements({ modelDefinitions, definitionsIdToNameMap });

			const schemaScript = [rootTypeStatements, typeDefinitionStatements].filter(Boolean).join('\n\n');

			cb(null, schemaScript);
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
