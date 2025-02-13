/**
 * @import { ContainerLevelScriptFEData, Logger, GenerateContainerLevelScriptCallback } from "./types/types"
 */

const validationHelper = require('./helpers/schemaValidationHelper');
const { getTypeDefinitionStatements, getModelDefinitionsBySubtype } = require('./mappers/typeDefinitions');
const { generateIdToNameMap } = require('./helpers/generateIdToNameMap');
const { getSchemaVersionHeader } = require('./mappers/schemaVersionHeader');
const { formatFEStatement } = require('./helpers/feStatementFormatHelper');
const { getRootTypeNames, getRootSchemaStatement, getRootTypes } = require('./mappers/rootTypes');
const { getDirectives } = require('./mappers/directives');

module.exports = {
	/**
	 * Generates the container FE script for the given data.
	 *
	 * @param {ContainerLevelScriptFEData} data - The data for generating the container script.
	 * @param {Logger} logger - The logger for logging errors.
	 * @param {GenerateContainerLevelScriptCallback} cb - The callback function.
	 */
	generateContainerScript(data, logger, cb) {
		try {
			const modelDefinitions = JSON.parse(data.modelDefinitions);
			const definitionsIdToNameMap = generateIdToNameMap(modelDefinitions.properties);

			const containerProperties = data.containerData?.[0];
			const schemaVersionHeader = getSchemaVersionHeader({ schemaVersion: data.modelData[0]?.version });
			const rootTypeNames = getRootTypeNames({ containerProperties });
			const rootTypeStatements = getRootTypes({
				entitiesJsonSchema: data.jsonSchema,
				entityProperties: data.entityData,
				rootTypeNames,
				definitionsIdToNameMap,
			});

			const rootSchemaStatement = getRootSchemaStatement({
				rootTypeNames,
				rootTypeStatements,
				containerProperties,
				definitionsIdToNameMap,
			});

			const directiveStatements = getDirectives({
				directives: getModelDefinitionsBySubtype({ modelDefinitions, subtype: 'directive' }),
				definitionsIdToNameMap,
			});

			const typeDefinitionStatements = getTypeDefinitionStatements({ modelDefinitions, definitionsIdToNameMap });

			// Combine all the statements into a single script with strict ordering
			const schemaScript = [
				schemaVersionHeader,
				rootSchemaStatement,
				...directiveStatements,
				...rootTypeStatements,
				...typeDefinitionStatements,
			]
				.filter(Boolean)
				.map(feStatement => formatFEStatement({ feStatement }))
				.join('\n\n');

			cb(null, schemaScript);
		} catch (err) {
			logger.log('error', { error: err }, 'GraphQL FE Error');
			cb(err);
		}
	},

	/**
	 * Validates the given script data.
	 *
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
