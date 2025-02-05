/**
 * @import { FEStatement, IdToNameMap, RootTypeNamesParameter, ContainerData } from "../types/types"
 */

const { QUERY_ROOT_TYPE, MUTATION_ROOT_TYPE, SUBSCRIPTION_ROOT_TYPE } = require('../constants/feScriptConstants');
const { formatFEStatement } = require('../helpers/feStatementFormatHelper');
const { joinInlineStatements } = require('../helpers/feStatementJoinHelper');
const { getDirectivesUsageStatement } = require('./directiveUsageStatements');
const { getRootTypeFields } = require('./fields');

/**
 * Gets root schema statement the root type statements.
 * If all root types have default values, root schema statement is not returned.
 *
 * @param {Object} param0
 * @param {ContainerData} param0.container - The container properties.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement[]} - The root type statements.
 */
function getSchemaRootTypeStatements({
	containerProperties,
	entitiesJsonSchema,
	entityProperties,
	definitionsIdToNameMap,
}) {
	const rootTypeNames = getRootTypeNames({ containerProperties });
	const rootTypes = getRootTypes({
		entitiesJsonSchema,
		entityProperties,
		rootTypeNames,
		definitionsIdToNameMap,
	}).filter(Boolean);
	const rootSchemaStatement = getRootSchemaStatement({ rootTypeNames, rootTypes, containerProperties });

	return [rootSchemaStatement, ...rootTypes]
		.filter(Boolean)
		.map(rootType => formatFEStatement({ feStatement: rootType }))
		.join('\n\n');
}

/**
 * Gets the root schema statement.
 * If all root types have default values, return null.
 * If at least one root type does not have a default value, return the root schema statement.
 * If the root type is not present in the root types, do not include it in the root schema statement.
 *
 * @param {Object} param0
 * @param {RootTypeNamesParameter} param0.rootTypeNames - The root type names.
 * @param {FEStatement[]} param0.rootTypes - The root types.
 * @returns {FEStatement | null} - The root schema statement or null if all root types have default values.
 */
function getRootSchemaStatement({ rootTypeNames, rootTypes, containerProperties }) {
	const rootTypeMap = {
		query: QUERY_ROOT_TYPE,
		mutation: MUTATION_ROOT_TYPE,
		subscription: SUBSCRIPTION_ROOT_TYPE,
	};

	const nestedStatements = Object.entries(rootTypeMap).reduce((acc, [key, defaultValue]) => {
		const isRootTypePresent = rootTypes.some(rootType => rootType.statement.includes(rootTypeNames[key]));

		if (isRootTypePresent) {
			acc.push({ statement: `${key}: ${rootTypeNames[key]}` });
		}
		return acc;
	}, []);

	if (nestedStatements.length === 0) {
		return null;
	}

	const schemaDirectives = getDirectivesUsageStatement({ directives: containerProperties?.[0]?.graphDirectives });

	return {
		statement: joinInlineStatements({ statements: ['schema', schemaDirectives] }),
		description: containerProperties?.[0]?.description,
		nestedStatements,
	};
}

/**
 * Gets the root type names.
 * Iterate over the containers and get the root type names.
 *
 * @param {Object} param0
 * @param {ContainerData} param0.container - The containers.
 * @returns {RootTypeNamesParameter} - The root type names.
 */
function getRootTypeNames({ containerProperties }) {
	const rootContainersNames = {
		query: QUERY_ROOT_TYPE,
		mutation: MUTATION_ROOT_TYPE,
		subscription: SUBSCRIPTION_ROOT_TYPE,
	};

	const containerRootTypesPropertyValue = containerProperties?.containerData?.[0]?.schemaRootTypes;

	if (containerRootTypesPropertyValue) {
		const { rootQuery, rootMutation, rootSubscription } = containerRootTypesPropertyValue;

		const trimmedRootQuery = rootQuery?.trim() || '';
		const trimmedRootMutation = rootMutation?.trim() || '';
		const trimmedRootSubscription = rootSubscription?.trim() || '';

		if (trimmedRootQuery && trimmedRootQuery !== rootContainersNames.query) {
			rootContainersNames.query = trimmedRootQuery;
		}

		if (trimmedRootMutation && trimmedRootMutation !== rootContainersNames.mutation) {
			rootContainersNames.mutation = trimmedRootMutation;
		}

		if (trimmedRootSubscription && trimmedRootSubscription !== rootContainersNames.subscription) {
			rootContainersNames.subscription = trimmedRootSubscription;
		}
	}

	return rootContainersNames;
}

/**
 * Gets the root types.
 * Iterate over the containers and get the root types.
 * For each root type, get the nested statements composed of the fields of the entities with the operation type equal to the root type.
 * If there are no entities with the operation type equal to the root type, return null.
 *
 * @param {Object} param0
 * @param {ContainerData[]} param0.containers - The containers.
 * @param {RootTypeNamesParameter} param0.rootTypeNames - The root type names.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement[]} - The root types.
 */
function getRootTypes({ entitiesJsonSchema, entityProperties, rootTypeNames, definitionsIdToNameMap }) {
	const { query, mutation, subscription } = rootTypeNames;

	const rootTypes = [
		getRootType({
			entitiesJsonSchema,
			entityProperties,
			rootTypeName: query,
			definitionsIdToNameMap,
			rootType: QUERY_ROOT_TYPE,
		}),
		getRootType({
			entitiesJsonSchema,
			entityProperties,
			rootTypeName: mutation,
			definitionsIdToNameMap,
			rootType: MUTATION_ROOT_TYPE,
		}),
		getRootType({
			entitiesJsonSchema,
			entityProperties,
			rootTypeName: subscription,
			definitionsIdToNameMap,
			rootType: SUBSCRIPTION_ROOT_TYPE,
		}),
	];

	return rootTypes.filter(Boolean);
}

/**
 * Gets the root type.
 * Iterate over the containers and get the root type.
 * For each root type, get the nested statements composed of the fields of the entities with the operation type equal to the root type.
 * If there are no entities with the operation type equal to the root type, return null.
 *
 * @param {Object} param0
 * @param {ContainerData[]} param0.containers - The containers.
 * @param {string} param0.rootTypeName - The root type name.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @param {string} param0.rootType - The root type.
 * @returns {FEStatement | null} - The root type or null if there are no entities with the operation type equal to the root type.
 */
function getRootType({ entitiesJsonSchema, entityProperties, rootTypeName, definitionsIdToNameMap, rootType }) {
	const rootTypeNestedStatements = [];

	Object.entries(entitiesJsonSchema).forEach(([entityId, entityJson]) => {
		const entityOperationType = entityProperties[entityId]?.[0]?.operationType;
		if (entityOperationType !== rootType) {
			return;
		}

		const entityData = JSON.parse(entityJson);
		const entityFields = getRootTypeFields({
			fields: entityData.properties,
			requiredFields: entityData.required,
			definitionsIdToNameMap,
		}).map(field => {
			if (entityData.isActivated === false) {
				// If the entity is not activated, set the field as not activated
				return {
					...field,
					isActivated: false,
				};
			}
			return field;
		});

		rootTypeNestedStatements.push(...entityFields);
	});

	if (rootTypeNestedStatements.length === 0) {
		return null;
	}
	return {
		statement: `type ${rootTypeName}`,
		nestedStatements: rootTypeNestedStatements,
	};
}

module.exports = {
	getSchemaRootTypeStatements,
	// For testing purposes
	getRootSchemaStatement,
	getRootTypeNames,
	getRootTypes,
	getRootType,
};
