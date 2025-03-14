/**
 * @import { DocumentNode } from "graphql"
 * @import { Logger, FileREEntityResponseData, FieldsOrder } from "../types/types"
 */

const { Kind } = require('graphql');
const { mapRootSchemaTypesToContainer } = require('./rootSchemaTypes');
const { findNodesByKind } = require('../helpers/findNodesByKind');
const { getTypeDefinitions } = require('./typeDefinitions/typeDefinitions');

/**
 * Maps a GraphQL schema to a RE response
 * @param {Object} params
 * @param {DocumentNode[]} params.schemaItems - The schema items
 * @param {string} params.graphName - The name of the graph to be mapped as the container name
 * @param {Logger} params.logger - The logger
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {FileREEntityResponseData[]} The mapped entities
 */
function getMappedSchema({ schemaItems, graphName, logger, fieldsOrder }) {
	try {
		if (!schemaItems) {
			throw new Error('Schema items are empty');
		}
		const container = mapRootSchemaTypesToContainer({
			rootSchemaNode: findNodesByKind({ nodes: schemaItems, kind: Kind.SCHEMA_DEFINITION })[0],
			graphName,
		});

		const typeDefinitions = getTypeDefinitions({ typeDefinitions: schemaItems, fieldsOrder });

		return [
			// TODO: remove test collection
			{
				jsonSchema: '{ "type": "object", "operationType": "Query" }',
				objectNames: {
					collectionName: 'Test Collection',
				},
				doc: {
					bucketInfo: container,
					collectionName: 'Test Collection',
					dbName: container.name,
					modelDefinitions: JSON.stringify(typeDefinitions),
				},
			},
		];
	} catch (error) {
		logger.log('error', error, 'Failed to map GraphQL schema');
		throw new Error(`Failed to map GraphQL schema: ${error.message}`);
	}
}

module.exports = {
	getMappedSchema,
};
