/**
 * @import { ConnectionSettings } from '../../types/types';
 * @import { IntrospectionQuery } from 'graphql';
 */

const { getIntrospectionQuery } = require('graphql');
const { hckFetch } = require('@hackolade/fetch');

/**
 * Encode credentials to base64 for base authorization purposes
 * @param {string} userName
 * @param {string} userPassword
 * @returns {string}
 */
function encodeCredentials(userName, userPassword) {
	return Buffer.from(`${userName}:${userPassword}`).toString('base64');
}

/**
 * Build request headers for the fetch request
 * @param {AuthenticationType} authType
 * @param {string} [bearerToken]
 * @param {string} [userName]
 * @param {string} [userPassword]
 */
function buildRequestHeaders({ authType, bearerToken, userName, userPassword }) {
	const headers = {
		'Content-Type': 'application/json',
	};

	if (authType === 'basic') {
		headers.Authorization = `Basic ${encodeCredentials(userName, userPassword)}`;
	} else if (authType === 'bearer') {
		headers.Authorization = `Bearer ${bearerToken}`;
	}

	return headers;
}

/**
 * Fetch introspection schema from the GraphQL server
 * @param {ConnectionSettings} connectionInfo
 * @param {Logger} logger
 * @returns {Promise<IntrospectionQuery>}
 */
async function fetchIntrospectionSchema({ connectionInfo, logger }) {
	try {
		const options = {
			method: 'POST',
			headers: buildRequestHeaders(connectionInfo),
			body: JSON.stringify({ query: getIntrospectionQuery() }),
		};
		const response = await hckFetch(connectionInfo.host, options);
		const introspectionSchemaResponse = await response.json();

		logger.log('info', {}, 'Introspection schema fetched successfully');
		return introspectionSchemaResponse.data;
	} catch (error) {
		logger.log('error', error, 'Failed to fetch introspection schema');
		throw new error();
	}
}

module.exports = {
	fetchIntrospectionSchema,
};
