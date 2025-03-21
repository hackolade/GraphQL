// graphql types
const BUILT_IN_SCALAR = {
	String: 'String',
	Int: 'Int',
	Float: 'Float',
	Boolean: 'Boolean',
	ID: 'ID',
};

const BUILT_IN_SCALAR_LIST = Object.values(BUILT_IN_SCALAR);

module.exports = {
	BUILT_IN_SCALAR_LIST,
};
