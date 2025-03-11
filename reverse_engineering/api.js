/**
 * @import { FileREData, REFromFileCallback, TestConnectionInfo, TestConnectionCallback, DisconnectCallback, REConnectionInfo } from "./types/types"
 * @import { Logger } from "../shared/types/types"
 */

const { getFileName } = require('./helpers/getFileName');
const { parseSchema } = require('./helpers/parseSchema');
const { readFileContent } = require('./helpers/readFileContent');
const { getMappedSchema } = require('./mappers/schema');
const { fetchIntrospectionSchema } = require('./helpers/fetchIntrospectionSchema');
const { convertIntrospectionSchemaToGraphQLSchema } = require('./helpers/convertIntrospectionSchemaToGraphQLSchema');

module.exports = {
	/**
	 * Common disconnect method - not needed for GraphQL API
	 * @param {null} connectionInfo
	 * @param {Logger} logger
	 * @param {DisconnectCallback} callback
	 */
	disconnect(connectionInfo, logger, callback) {
		callback();
	},

	/**
	 * Test a connection to the GraphQL server - executes introspection query
	 * @param {TestConnectionInfo} connectionInfo
	 * @param {Logger} logger
	 * @param {TestConnectionCallback} callback
	 * @returns {Promise<void>}
	 */
	async testConnection(connectionInfo, logger, callback) {
		try {
			await fetchIntrospectionSchema({ connectionInfo, logger });
			callback();
		} catch (error) {
			logger.log('error', error, 'Test connection error');
			callback(error);
		}
	},

	/**
	 *
	 * @param {REConnectionInfo} data
	 * @param {Logger} logger
	 * @param callback
	 * @returns {Promise<void>}
	 */
	async getDbCollectionsData(data, logger, callback) {
		const introspectionSchema = await fetchIntrospectionSchema({ connectionInfo: data.connectionSettings, logger });
		// eslint-disable-next-line no-unused-vars
		const graphQLSDLSchema = convertIntrospectionSchemaToGraphQLSchema(introspectionSchema);
		// TODO: implement proper mapper for RE from instance

		callback(
			null,
			[
				{
					dbName: 'New Graph',
					collectionName: 'Query',
					entityLevel: {
						description: 'Test description',
					},
					documents: [],
					validation: {
						jsonSchema: {
							properties: {
								'test': { type: 'string' },
							},
							required: [],
						},
					},
					emptyBucket: false,
					bucketInfo: {
						name: 'New Graph',
						description: 'Test description',
					},
					modelDefinitions: {
						properties: {},
					},
				},
			],
			{},
			[],
		);
	},

	/**
	 * RE a GraphQL schema file and returns the mapped schema
	 * @param {FileREData} data
	 * @param {Logger} logger
	 * @param {REFromFileCallback} callback
	 */
	async reFromFile(data, logger, callback) {
		try {
			const fieldsOrder = data.fieldInference.active;
			const fileContent = await readFileContent({ filePath: data.filePath });
			const fileName = getFileName(data.filePath);
			const { parsedSchema /*validationErrors*/ } = parseSchema({ schemaContent: fileContent }); // TODO: validation warnings can be returned in modelData
			const mappedEntities = getMappedSchema({
				schemaItems: parsedSchema.definitions,
				graphName: fileName,
				logger,
				fieldsOrder,
			});

			callback(null, mappedEntities, {}, [], 'multipleSchema');
		} catch (error) {
			logger.log('error', error, 'Failed to read GraphQL schema file');
			callback(error);
		}
	},
};
