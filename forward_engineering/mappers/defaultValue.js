/**
 * Get the default value for the given type with proper formatting.
 * @param {string} type - GraphQL type
 * @param {string|number|boolean} defaultValue - Default value from Properties pane Default field
 */
const getDefaultValue = (type, defaultValue = '') => {
	switch (type) {
		case 'ID':
		case 'String': {
			return `"${defaultValue}"`;
		}
		case 'Int': {
			return Number.parseInt(defaultValue);
		}
		case 'Float': {
			return Number.parseFloat(defaultValue);
		}
		case 'Boolean': {
			return defaultValue.toLowerCase() === 'true';
		}
		default: {
			return defaultValue;
		}
	}
};

module.exports = {
	getDefaultValue,
};
