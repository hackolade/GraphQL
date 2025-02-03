/**
 * @import { FEStatement, IdToNameMap, RootTypeNamesParameter, ContainerData } from "../types/types"
 */

const { QUERY_ROOT_TYPE, MUTATION_ROOT_TYPE, SUBSCRIPTION_ROOT_TYPE } = require('../constants/feScriptConstants');
const { formatFEStatement } = require('../helpers/feStatementFormatHelper');
const { getRootTypeFields } = require('./fields');

/**
 * Gets root schema statement the root type statements.
 * If all root types have default values, root schema statement is not returned.
 *
 * @param {Object} param0
 * @param {ContainerData[]} param0.containers - The containers.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {FEStatement[]} - The root type statements.
 */
function getSchemaRootTypeStatements({ containers = [], definitionsIdToNameMap }) {
	const rootTypeNames = getRootTypeNames({ containers });
	const rootTypes = getRootTypes({ containers, rootTypeNames, definitionsIdToNameMap }).filter(Boolean);
	const rootSchemaStatement = getRootSchemaStatement({ rootTypeNames, rootTypes });

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
function getRootSchemaStatement({ rootTypeNames, rootTypes }) {
	const rootTypeMap = {
		query: QUERY_ROOT_TYPE,
		mutation: MUTATION_ROOT_TYPE,
		subscription: SUBSCRIPTION_ROOT_TYPE,
	};

	const nestedStatements = Object.entries(rootTypeMap).reduce((acc, [key, defaultValue]) => {
		const isDefaultRootTypeNameHasDefaultValue = rootTypeNames[key] === defaultValue;
		const isRootTypePresent = rootTypes.some(rootType => rootType.statement.includes(rootTypeNames[key]));

		if (!isDefaultRootTypeNameHasDefaultValue && isRootTypePresent) {
			acc.push({ statement: `${key}: ${rootTypeNames[key]}` });
		}
		return acc;
	}, []);

	if (nestedStatements.length === 0) {
		return null;
	}

	return {
		statement: 'schema',
		nestedStatements,
	};
}

/**
 * Gets the root type names.
 * Iterate over the containers and get the root type names.
 *
 * @param {Object} param0
 * @param {ContainerData[]} param0.containers - The containers.
 * @returns {RootTypeNamesParameter} - The root type names.
 */
function getRootTypeNames({ containers = [] }) {
	const rootContainersNames = {
		query: QUERY_ROOT_TYPE,
		mutation: MUTATION_ROOT_TYPE,
		subscription: SUBSCRIPTION_ROOT_TYPE,
	};

	containers.forEach(container => {
		const containerRootTypesPropertyValue = container.containerData?.[0]?.schemaRootTypes;

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
	});

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
function getRootTypes({ containers, rootTypeNames, definitionsIdToNameMap }) {
	const { query, mutation, subscription } = rootTypeNames;

	const rootTypes = [
		getRootType({ containers, rootTypeName: query, definitionsIdToNameMap, rootType: QUERY_ROOT_TYPE }),
		getRootType({ containers, rootTypeName: mutation, definitionsIdToNameMap, rootType: MUTATION_ROOT_TYPE }),
		getRootType({
			containers,
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
function getRootType({ containers, rootTypeName, definitionsIdToNameMap, rootType }) {
	const rootTypeNestedStatements = [];
	containers.forEach(container => {
		Object.entries(container.jsonSchema).forEach(([entityId, entityJson]) => {
			const entityOperationType = container.entityData[entityId]?.[0]?.operationType;
			if (entityOperationType !== rootType) {
				return;
			}

			const entityData = JSON.parse(entityJson);
			const entityFields = getRootTypeFields({
				fields: entityData.properties,
				requiredFields: entityData.required,
				definitionsIdToNameMap,
			}).map(field => {
				if ([container.containerData?.[0]?.isActivated, entityData.isActivated].includes(false)) {
					// If the container or entity is not activated, set the field as not activated
					return {
						...field,
						isActivated: false,
					};
				}
				return field;
			});

			rootTypeNestedStatements.push(...entityFields);
		});
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
