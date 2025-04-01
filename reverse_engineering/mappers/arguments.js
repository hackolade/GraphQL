/**
 * @import {InputValueDefinitionNode, TypeNode} from "graphql"
 * @import {ArgumentTypeInfo, REArgument} from "./../../shared/types/types"
 */

const { mapDirectivesUsage } = require('./directiveUsage');
const { astNodeKind } = require('../constants/graphqlAST');
const { parseDefaultValue } = require('./defaultValue');

/**
 * Maps field arguments to the REArgument format
 *
 * @param {object} params
 * @param {InputValueDefinitionNode[]} params.fieldArguments - The field arguments
 * @returns {REArgument[]} The mapped arguments
 */
function getArguments({ fieldArguments = [] }) {
	if (!fieldArguments.length) {
		return [];
	}

	return fieldArguments.map(argument => mapArgument({ argument }));
}

/**
 * Maps a single argument to the REArgument format
 *
 * @param {object} params
 * @param {InputValueDefinitionNode} params.argument - The argument to map
 * @returns {REArgument} The mapped argument
 */
function mapArgument({ argument }) {
	const typeInfo = getArgumentTypeInfo({ type: argument.type });

	const mappedArgument = {
		name: argument.name.value,
		type: typeInfo.typeName,
		description: argument.description?.value || '',
		directives: mapDirectivesUsage({ directives: [...(argument.directives || [])] }),
		required: typeInfo.required,
	};

	// Add list items for List types
	if (typeInfo.isList) {
		mappedArgument.listItems = [
			{
				type: typeInfo.innerTypeName,
				required: typeInfo.innerRequired,
			},
		];
	}

	// Add default value if present
	if (argument.defaultValue) {
		mappedArgument.default = parseDefaultValue(argument.defaultValue);
	}

	return mappedArgument;
}

/**
 * Gets type information for an argument by unwrapping non-null and list types
 *
 * @param {object} params
 * @param {TypeNode} params.type - The GraphQL type node
 * @returns {ArgumentTypeInfo} Information about the argument type
 */
function getArgumentTypeInfo({ type }) {
	if (type.kind === astNodeKind.NON_NULL_TYPE) {
		const innerTypeInfo = getArgumentTypeInfo({ type: type.type });
		return {
			...innerTypeInfo,
			required: true,
		};
	}

	if (type.kind === astNodeKind.LIST_TYPE) {
		const innerTypeInfo = getArgumentTypeInfo({ type: type.type });
		return {
			typeName: 'List',
			isList: true,
			innerTypeName: innerTypeInfo.typeName,
			innerRequired: innerTypeInfo.required,
			required: false,
		};
	}

	if (type.kind === astNodeKind.NAMED_TYPE) {
		const typeName = type.name.value;

		return {
			typeName: typeName,
			required: false,
		};
	}

	return {
		typeName: 'String',
		required: false,
	};
}

module.exports = {
	getArguments,
};
