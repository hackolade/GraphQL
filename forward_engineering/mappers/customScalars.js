/**
 * @typedef {Object} FERootStatement
 * @property {string} statement
 * @property {string} description
 * @property {boolean} isActivated
 */

/**
 * @typedef {Object} CustomScalar
 * @property {string} name
 * @property {string} type
 * @property {string} description
 */

/**
 *
 * @param {Object} param0
 * @param {CustomScalar[]} param0.customScalars - Array of custom scalar objects
 * @returns {FERootStatement[]}
 */
function getCustomScalars({ customScalars }) {
	return {
		// Add your custom scalars here
	};
}

function mapCustomScalar({ customScalar }) {
	// Add your custom scalar mapping here
}
