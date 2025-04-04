/**
 * @import {IntrospectionQuery} from 'graphql';
 */

const { buildClientSchema, printSchema } = require('graphql/utilities');

/**
 * Convert introspection schema to GraphQL SDL schema
 *
 * @param {IntrospectionQuery} introspectionSchema
 * @returns {string}
 */
function convertIntrospectionSchemaToGraphQLSchema(introspectionSchema) {
	const schema = buildClientSchema(introspectionSchema);
	return printSchema(schema);
}

module.exports = {
	convertIntrospectionSchemaToGraphQLSchema,
};
