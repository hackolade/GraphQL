/**
 * Get the default value for the given type with proper formatting.
 *
 * @param {object} args - GetArgumentDefaultValue arguments object
 * @param {string} args.type - GraphQL type
 * @param {string | number | boolean} [args.defaultValue] - Default value from Properties pane Default field
 * @returns {string | number | boolean} - The default value
 */
const getArgumentDefaultValue = ({ type, defaultValue = '' }) => {
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
	getArgumentDefaultValue,
};
