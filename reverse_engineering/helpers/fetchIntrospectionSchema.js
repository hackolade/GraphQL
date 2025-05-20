/**
 * @import {ConnectionSettings, AuthenticationType, Logger} from '../../shared/types/types';
 * @import {IntrospectionQuery} from 'graphql';
 */

const { getIntrospectionQuery } = require('graphql');
const { hckFetch } = require('@hackolade/fetch');
const { FetchIntrospectionSchemaError } = require('../errors/FetchIntrospectionSchemaError');
const { escapeV6IpForURL } = require('./escapeV6IpForURL');

/**
 * Encode credentials to base64 for base authorization purposes
 *
 * @param {string} [userName]
 * @param {string} [userPassword]
 * @returns {string}
 */
function encodeCredentials(userName = '', userPassword = '') {
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
 * @param {Response} response
 * @returns {Promise<IntrospectionQuery>}
 */
async function parseResponse(response) {
	if (response.status !== 200) {
		const errorText = await response.text();
		throw new FetchIntrospectionSchemaError(
			`Failed to fetch introspection schema. Status: ${response.status}. Response: ${errorText}`,
		);
	}

	const responseSchema = await response.json();
	if (!responseSchema?.data) {
		throw new FetchIntrospectionSchemaError('Failed to fetch introspection schema. No data returned.');
	}

	return responseSchema.data;
}

/**
 * Fetch introspection schema from the GraphQL server
 *
 * @param {object} params
 * @param {ConnectionSettings} params.connectionInfo
 * @returns {Promise<IntrospectionQuery>}
 */
async function fetchIntrospectionSchema({ connectionInfo }) {
	const options = {
		method: 'POST',
		headers: buildRequestHeaders(connectionInfo),
		body: JSON.stringify({ query: getIntrospectionQuery() }),
	};

	// If the URL is not provided, use the host keyword for backward compatibility with the less than 8.1.4 app version
	const url = connectionInfo.url || connectionInfo.host;
	const response = await hckFetch(escapeV6IpForURL({ host: url }), options);
	return await parseResponse(response);
}

module.exports = {
	fetchIntrospectionSchema,
};
