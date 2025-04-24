/**
 * @import {FileREData, REFromFileCallback, TestConnectionInfo, TestConnectionCallback, DisconnectCallback, REConnectionInfo, Logger, InstanceREEntityResponseData, REFromInstanceCallback} from "../shared/types/types"
 */

const { getFileName } = require('./helpers/getFileName');
const { parseSchema } = require('./helpers/parseSchema');
const { readFileContent } = require('./helpers/readFileContent');
const { getMappedSchemaFromFile, getMappedSchemaFromInstance } = require('./mappers/schema');
const { fetchIntrospectionSchema } = require('./helpers/fetchIntrospectionSchema');
const { convertIntrospectionSchemaToGraphQLSchema } = require('./helpers/convertIntrospectionSchemaToGraphQLSchema');
const { mapError } = require('./helpers/mapError');
const { FetchIntrospectionSchemaError } = require('./errors/FetchIntrospectionSchemaError');

module.exports = {
	/**
	 * Common disconnect method - not needed for GraphQL API
	 *
	 * @param {REConnectionInfo} _connectionInfo
	 * @param {Logger} _logger
	 * @param {DisconnectCallback} callback
	 */
	disconnect(_connectionInfo, _logger, callback) {
		callback();
	},

	/**
	 * Test a connection to the GraphQL server - executes introspection query
	 *
	 * @param {TestConnectionInfo} connectionInfo
	 * @param {Logger} logger
	 * @param {TestConnectionCallback} callback
	 * @returns {Promise<void>}
	 */
	async testConnection(connectionInfo, logger, callback) {
		const testConnectionTitle = 'Test connection';
		try {
			logger.clear();
			logger.log('info', connectionInfo, testConnectionTitle, connectionInfo.hiddenKeys);
			logger.log('info', 'Start test connection', testConnectionTitle);

			await fetchIntrospectionSchema({ connectionInfo });

			logger.log('info', 'Test connection successful', testConnectionTitle);

			callback();
		} catch (error) {
			logger.log('error', error, testConnectionTitle);
			const message = error instanceof Error ? error?.message : testConnectionTitle;
			const stack = error instanceof Error ? error?.stack : undefined;
			const customMsgCode = error instanceof FetchIntrospectionSchemaError ? error?.customMsgCode : undefined;
			callback({ message, stack, customMsgCode });
		}
	},

	/**
	 * @param {REConnectionInfo} data
	 * @param {Logger} logger - Logger instance
	 * @param {REFromInstanceCallback} callback
	 * @returns {Promise<void>}
	 */
	async getDbCollectionsData(data, logger, callback) {
		try {
			logger.clear();
			const logTitle = 'RE schema from GraphQL server';

			logger.log('info', data.connectionSettings, logTitle, data.hiddenKeys);
			logger.progress({ message: 'Start reverse engineering ...', containerName: '', entityName: '' });

			logger.log('info', 'Fetching Introspection schema', logTitle);
			logger.progress({
				message: 'Fetching Introspection schema from GraphQL server',
				containerName: '',
				entityName: '',
			});
			const introspectionSchema = await fetchIntrospectionSchema({
				connectionInfo: data.connectionSettings,
			});

			logger.log('info', 'Converting Introspection schema to GraphQL SDL schema', logTitle);
			logger.progress({
				message: 'Converting Introspection schema to GraphQL SDL schema',
				containerName: '',
				entityName: '',
			});
			const graphQLSDLSchema = convertIntrospectionSchemaToGraphQLSchema(introspectionSchema);

			logger.log('info', 'Parsing GraphQL SQL schema', logTitle);
			logger.progress({ message: 'Parsing GraphQL SQL schema', containerName: '', entityName: '' });
			const { parsedSchema } = parseSchema({ schemaContent: graphQLSDLSchema });

			logger.log('info', 'Converting the parsed GraphQL schema to internal RE schema', logTitle);
			const mappedEntities = getMappedSchemaFromInstance({
				schemaItems: [...parsedSchema.definitions],
				graphName: 'New Graph',
				logger,
			});

			callback(null, mappedEntities);
		} catch (error) {
			const title = 'Failed to RE schema from GraphQL server';
			logger.log('error', error, title);
			const message = error instanceof Error ? error?.message : title;
			const stack = error instanceof Error ? error?.stack : undefined;
			const customMsgCode = error instanceof FetchIntrospectionSchemaError ? error?.customMsgCode : undefined;
			callback({ message, stack, customMsgCode });
		}
	},

	/**
	 * RE a GraphQL schema file and returns the mapped schema
	 *
	 * @param {FileREData} data
	 * @param {Logger} logger
	 * @param {REFromFileCallback} callback
	 */
	async reFromFile(data, logger, callback) {
		try {
			logger.clear();
			logger.log('info', 'Start RE from file process', 'RE from file');

			const fieldsOrder = data.fieldInference.active;
			const fileContent = await readFileContent({ filePath: data.filePath });
			const fileName = getFileName(data.filePath);
			const { parsedSchema, validationErrors } = parseSchema({ schemaContent: fileContent });

			let warning;
			if (Array.isArray(validationErrors) && validationErrors.length > 0) {
				warning = {
					title: 'Anomalies were detected during reverse-engineering',
					message: 'Review the log file for more details.',
					openLog: true,
				};
				logger.log('error', { validationErrors }, '[Warning] Invalid GraphQL Schema');
			}

			const mappedEntities = getMappedSchemaFromFile({
				schemaItems: [...parsedSchema.definitions],
				graphName: fileName,
				logger,
				fieldsOrder,
			});

			callback(null, mappedEntities, { warning }, [], 'multipleSchema');
		} catch (error) {
			logger.log('error', error, 'Failed to read GraphQL schema file');
			const mappedError = mapError(error);
			callback(mappedError);
		}
	},
};
