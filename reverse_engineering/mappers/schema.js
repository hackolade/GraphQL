/**
 * @import {DefinitionNode} from "graphql"
 * @import {Logger, FileREEntityResponseData, FieldsOrder, MappedRESchema, InstanceREEntityResponseData} from "../../shared/types/types"
 */

const { mapRootSchemaToContainer } = require('./rootSchema');
const { findNodesByKind } = require('../helpers/findNodesByKind');
const { getTypeDefinitions } = require('./typeDefinitions/typeDefinitions');
const { mapRootTypesToEntities } = require('./rootTypes');
const { astNodeKind } = require('../constants/graphqlAST');
const { getDefinitionCategoryByNameMap } = require('../helpers/getDefinitionCategoryByNameMap');

/**
 * Maps a GraphQL schema to a general RE schema
 *
 * @param {object} params
 * @param {DefinitionNode[]} params.schemaItems
 * @param {string} params.graphName
 * @param {FieldsOrder} [params.fieldsOrder]
 * @returns {MappedRESchema}
 */
function getMappedSchema({ schemaItems, graphName, fieldsOrder }) {
	if (!schemaItems) {
		throw new Error('Schema items are empty');
	}
	const container = mapRootSchemaToContainer({
		rootSchemaNode: findNodesByKind({ nodes: schemaItems, kind: astNodeKind.SCHEMA_DEFINITION })[0],
		graphName,
	});
	const rootTypeNames = [
		container.schemaRootTypes?.rootQuery || 'Query',
		container.schemaRootTypes?.rootMutation || 'Mutation',
		container.schemaRootTypes?.rootSubscription || 'Subscription',
	];

	const definitionCategoryByNameMap = getDefinitionCategoryByNameMap({ nodes: schemaItems });

	const rootTypeNodes = findNodesByKind({
		nodes: schemaItems,
		kind: astNodeKind.OBJECT_TYPE_DEFINITION,
	}).filter(node => rootTypeNames.includes(node.name.value));
	const entities = mapRootTypesToEntities({
		rootTypeNodes,
		definitionCategoryByNameMap,
		fieldsOrder,
		schemaRootTypesMap: rootTypeNames,
	});

	const typeDefinitions = getTypeDefinitions({
		typeDefinitions: schemaItems,
		fieldsOrder,
		rootTypeNames,
		definitionCategoryByNameMap,
	});

	return { container, entities, typeDefinitions };
}

/**
 * Maps a GraphQL schema to a RE from file response
 *
 * @param {object} params
 * @param {DefinitionNode[]} params.schemaItems - The schema items
 * @param {string} params.graphName - The name of the graph to be mapped as the container name
 * @param {Logger} params.logger - The logger
 * @param {FieldsOrder} params.fieldsOrder - The fields order
 * @returns {FileREEntityResponseData[]} The mapped entities
 */
function getMappedSchemaFromFile({ schemaItems, graphName, logger, fieldsOrder }) {
	try {
		const { container, entities, typeDefinitions } = getMappedSchema({ schemaItems, graphName, fieldsOrder });

		return entities.map(entity => ({
			jsonSchema: JSON.stringify(entity.data),
			objectNames: {
				collectionName: entity.name,
			},
			doc: {
				bucketInfo: container,
				collectionName: entity.name,
				dbName: container.name,
				modelDefinitions: JSON.stringify(typeDefinitions),
			},
		}));
	} catch (error) {
		logger.log('error', error, 'Failed to map GraphQL schema');
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to map GraphQL schema: ${errorMessage}`);
	}
}

/**
 * Maps a GraphQL schema to a RE from instance response
 *
 * @param {object} params
 * @param {DefinitionNode[]} params.schemaItems - The schema items
 * @param {string} params.graphName - The name of the graph to be mapped as the container name
 * @param {Logger} params.logger - The logger
 * @returns {InstanceREEntityResponseData[]}
 */
function getMappedSchemaFromInstance({ schemaItems, graphName, logger }) {
	try {
		const { container, entities, typeDefinitions } = getMappedSchema({ schemaItems, graphName });

		return entities.map(entity => {
			const { properties, required, ...entityLevelData } = entity.data;
			return {
				dbName: graphName,
				collectionName: entity.name,
				entityLevel: entityLevelData,
				validation: {
					jsonSchema: {
						properties,
						required,
					},
				},
				emptyBucket: false,
				bucketInfo: container,
				modelDefinitions: {
					properties: typeDefinitions.definitions,
				},
			};
		});
	} catch (error) {
		logger.log('error', error, 'Failed to map GraphQL schema');
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to map GraphQL schema: ${errorMessage}`);
	}
}

module.exports = {
	getMappedSchemaFromFile,
	getMappedSchemaFromInstance,
};
