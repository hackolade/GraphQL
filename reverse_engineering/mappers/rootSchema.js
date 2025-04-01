/**
 * @import {SchemaDefinitionNode, OperationTypeDefinitionNode} from "graphql"
 * @import {ContainerInfo, ContainerSchemaRootTypes} from "../../shared/types/types"
 */

const { OperationTypeNode } = require('graphql');

const { mapStringValueNode } = require('./stringValue');
const { mapDirectivesUsage } = require('./directiveUsage');

/**
 * Maps the root schema types to a container
 *
 * @param {object} params
 * @param {SchemaDefinitionNode} params.rootSchemaNode - The root schema node
 * @param {string} params.graphName - The name of the graph
 * @returns {ContainerInfo} The mapped container
 */
function mapRootSchemaToContainer({ rootSchemaNode, graphName = 'New Graph' }) {
	if (!rootSchemaNode) {
		return { name: graphName };
	}

	return {
		name: graphName,
		description: mapStringValueNode({ node: rootSchemaNode.description }),
		schemaRootTypes: mapSchemaRootTypes({ schemaRootTypes: [...rootSchemaNode.operationTypes] }),
		graphDirectives: mapDirectivesUsage({ directives: [...(rootSchemaNode.directives || [])] }),
	};
}

/**
 * Maps the schema root types
 *
 * @param {object} params
 * @param {OperationTypeDefinitionNode[]} params.schemaRootTypes - The schema root types
 * @returns {ContainerSchemaRootTypes} The mapped schema root types
 */
function mapSchemaRootTypes({ schemaRootTypes }) {
	if (!schemaRootTypes) {
		return {};
	}

	const keywordMap = {
		[OperationTypeNode.QUERY]: 'rootQuery',
		[OperationTypeNode.MUTATION]: 'rootMutation',
		[OperationTypeNode.SUBSCRIPTION]: 'rootSubscription',
	};

	return schemaRootTypes.reduce((acc, schemaRootType) => {
		const mappedKeyword = keywordMap[schemaRootType.operation];
		acc[mappedKeyword] = schemaRootType.type.name.value;

		return acc;
	}, {});
}

module.exports = {
	mapRootSchemaToContainer,
};
