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

module.exports = {
	GRAPHQL_SCHEMA_SCRIPT_INDENT,
	DIRECTIVE_LOCATIONS,
};
