/**
 * @import {ConnectionSettings, AuthenticationType, Logger} from '../../shared/types/types';
 * @import {IntrospectionQuery} from 'graphql';
 */

const { getIntrospectionQuery } = require('graphql');
const { hckFetch } = require('@hackolade/fetch');

/**
 * Encode credentials to base64 for base authorization purposes
 *
 * @param {string} userName
 * @param {string} userPassword
 * @returns {string}
 */
function encodeCredentials(userName, userPassword) {
	return Buffer.from(`${userName}:${userPassword}`).toString('base64');
}

/**
 * Build request headers for the fetch request
 *
 * @param {object} params
 * @param {AuthenticationType} params.authType
 * @param {string} [params.bearerToken]
 * @param {string} [params.userName]
 * @param {string} [params.userPassword]
 * @returns {Record<string, string>}
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
 *
 * @param {object} params
 * @param {ConnectionSettings} params.connectionInfo
 * @param {Logger} params.logger
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
		const message = 'Failed to fetch introspection schema';
		logger.log('error', error, message);
		throw new Error(message);
	}
}

module.exports = {
	fetchIntrospectionSchema,
};
