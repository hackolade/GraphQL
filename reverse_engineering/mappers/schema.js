/**
 * @import {DefinitionNode} from "graphql"
 * @import {Logger, FileREEntityResponseData, FieldsOrder} from "../../shared/types/types"
 */

const { Kind } = require('graphql');
const { mapRootSchemaTypesToContainer } = require('./rootSchemaTypes');
const { findNodesByKind } = require('../helpers/findNodesByKind');
const { getTypeDefinitions } = require('./typeDefinitions/typeDefinitions');

/**
 * Maps a GraphQL schema to a RE response
 *
 * @param {object} params
 * @param {DefinitionNode[]} params.schemaItems - The schema items
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
		const rootTypeNames = [
			container.schemaRootTypes?.rootQuery || 'Query',
			container.schemaRootTypes?.rootMutation || 'Mutation',
			container.schemaRootTypes?.rootSubscription || 'Subscription',
		];

		const typeDefinitions = getTypeDefinitions({ typeDefinitions: schemaItems, fieldsOrder, rootTypeNames });

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
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to map GraphQL schema: ${errorMessage}`);
	}
}

module.exports = {
	getMappedSchema,
};
