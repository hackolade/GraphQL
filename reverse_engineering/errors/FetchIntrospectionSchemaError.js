class FetchIntrospectionSchemaError extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message);
		this.name = 'FetchIntrospectionSchemaError';
		this.customMsgCode = 'CONNECTION_ERROR___CANNOT_FETCH_INTROSPECTION';
	}
}

module.exports = {
	FetchIntrospectionSchemaError,
};
