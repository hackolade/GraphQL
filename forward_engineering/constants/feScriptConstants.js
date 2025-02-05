const GRAPHQL_SCHEMA_SCRIPT_INDENT = '  ';

const DIRECTIVE_LOCATIONS = {
	argumentDefinition: 'ARGUMENT_DEFINITION',
	enum: 'ENUM',
	enumValue: 'ENUM_VALUE',
	field: 'FIELD',
	fieldDefinition: 'FIELD_DEFINITION',
	inputFieldDefinition: 'INPUT_FIELD_DEFINITION',
	inputObject: 'INPUT_OBJECT',
	interface: 'INTERFACE',
	mutation: 'MUTATION',
	object: 'OBJECT',
	query: 'QUERY',
	scalar: 'SCALAR',
	schema: 'SCHEMA',
	subscription: 'SUBSCRIPTION',
	union: 'UNION',
};

const QUERY_ROOT_TYPE = 'Query';
const MUTATION_ROOT_TYPE = 'Mutation';
const SUBSCRIPTION_ROOT_TYPE = 'Subscription';

const MISSED_ARG_TYPE_COMMENT = 'MISSING ARGUMENT TYPE';

module.exports = {
	GRAPHQL_SCHEMA_SCRIPT_INDENT,
	DIRECTIVE_LOCATIONS,
	QUERY_ROOT_TYPE,
	MUTATION_ROOT_TYPE,
	SUBSCRIPTION_ROOT_TYPE,
	MISSED_ARG_TYPE_COMMENT,
};
