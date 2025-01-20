// The system names are the names of the GraphQL system types (configured in the plugin to group different kinds of types).
const SYSTEM_NAMES = ['Scalars', 'Enums', 'Objects', 'Interfaces', 'Input objects', 'Unions', 'Directives'];

/**
 * Generate the ID to Name map for the given model definitions schema.
 *
 * @param {Object} modelDefinitionsSchema - The model definitions object properties.
 * @returns {Object} - The ID to Name map
 */
const generateIdToNameMap = (modelDefinitionsSchema = {}) => {
	let idToNameMap = {};

	Object.entries(modelDefinitionsSchema).forEach(([name, schema]) => {
		if (!SYSTEM_NAMES.includes(name)) {
			idToNameMap[schema.GUID] = name;
		}

		if (Object.keys(schema.properties || {}) !== 0) {
			const childIdToNameMap = generateIdToNameMap(schema.properties);
			idToNameMap = { ...idToNameMap, ...childIdToNameMap };
		}
	});

	return idToNameMap;
};

module.exports = {
	generateIdToNameMap,
};
