import {
	Argument,
	ContainerSchemaRootTypes,
	CustomScalarDefinition,
	DirectiveDefinition,
	DirectiveLocations,
	DirectivePropertyData,
	FieldSchema,
	ObjectLikeDefinition,
	EnumDefinition,
	EnumValue,
} from './shared';

export type FEStatement = {
	statement: string;
	description?: string;
	isActivated?: boolean;
	nestedStatements?: FEStatement[];
	useNestedStatementSigns?: boolean;
	nestedStatementsSeparator?: string;
	startNestedStatementsSign?: string;
	endNestedStatementsSign?: string;
	comment?: string;
};

export type IdToNameMap = Record<string, string>;

export type FEDefinitionsSchema =
	| FEObjectLikeDefinitionsSchema
	| FECustomScalarDefinitionsSchema
	| FEEnumDefinitionsSchema
	| FEUnionDefinitionsSchema
	| FEDirectiveDefinitionsSchema;

// Custom scalars
export type FECustomScalarDefinitionsSchema = Record<string, FECustomScalarDefinition>;

export type FECustomScalarDefinition = CustomScalarDefinition<DirectivePropertyData>;

// Enum
export type FEEnumValue = EnumValue<DirectivePropertyData>;

export type FEEnumDefinition = EnumDefinition<DirectivePropertyData>;

export type FEEnumDefinitionsSchema = Record<string, FEEnumDefinition>;

// Object type definition
export type FEObjectLikeDefinitionsSchema = Record<string, FEObjectLikeDefinition>;

export type FEObjectLikeDefinition = ObjectLikeDefinition<ImplementsInterface, DirectivePropertyData>;

export type ArgumentsResultStatement = {
	argumentsStatement: string; // The formatted arguments string.
	argumentsWarningComment: string; // The warning comment if any argument is missing a type.
};

// Directives
export type FEDirectiveLocations = DirectiveLocations & {
	GUID: string;
};

export type FEDirectiveDefinition = DirectiveDefinition<Argument, FEDirectiveLocations> & {
	GUID: string;
	additionalProperties?: boolean;
	ignore_z_value: boolean;
	isActivated?: boolean;
	schemaType: string;
};

export type FEDirectiveDefinitionsSchema = Record<string, FEDirectiveDefinition>;

export type ImplementsInterface = {
	interface: string; // ID of the interface
};

// Unions
type UnionMemberType = {
	$ref: string;
	GUID: string;
	displayName: string;
	isActivated: boolean;
};

type OneOfMeta = {
	choice: string;
	index: number;
	isActivated: boolean;
};

export type FEUnionDefinition = {
	type: 'union';
	GUID: string;
	description?: string;
	comments?: string;
	typeDirectives?: DirectivePropertyData[];
	additionalProperties: boolean;
	ignore_z_value: boolean;
	isActivated: boolean;
	oneOf: UnionMemberType[];
	oneOf_meta: OneOfMeta;
	schemaType: string;
	snippet: 'union';
};

export type FEUnionDefinitionsSchema = Record<string, FEUnionDefinition>;

// Root types
export type RootTypeNamesParameter = {
	query: string;
	mutation: string;
	subscription: string;
};

type EntityDetails = {
	operationType?: string;
	typeDirectives?: DirectivePropertyData[];
};

export type EntityIdToJsonSchemaMap = Record<string, string>;
export type EntityIdToPropertiesMap = Record<string, [EntityDetails]>;

// API parameters

type ModelDetails = {
	modelName: string;
	version: string;
	dbVendor: string;
	isLineageEnabled: boolean;
};

type LineageSource = {
	id: string;
	sourceName: string;
	lineageTimestamp: string;
	lineageSourceType: string;
	lineageSourceFormat: string;
	lineageFilePathName: string;
};

type Lineage = {
	sources: LineageSource[];
};

export type ContainerDetails = {
	name: string;
	code?: string;
	description?: string;
	isActivated: boolean;
	comments?: string;
	businessName?: string;
	schemaRootTypes: ContainerSchemaRootTypes;
	graphDirectives: DirectivePropertyData[];
};

export type ContainerLevelScriptFEData = {
	modelData: [ModelDetails, Lineage?]; // model level data
	containerData: [ContainerDetails?]; // container properties by tab
	entityData: EntityIdToPropertiesMap; // entity properties by entity ID
	jsonSchema: EntityIdToJsonSchemaMap; // JSON Schema by entity ID
	externalDefinitions: string; // external definitions JSON Schema
	modelDefinitions: string; // model definitions JSON Schema
	targetScriptOptions: object; // target script options
	options: {
		additionalOptions: object[]; // additional options
		origin: string; // "ui" if the script is called from the forward engineering tab
	};
};

export type GenerateContainerLevelScriptCallback = (error: Error | null | unknown, script?: string) => void;

export type ValidationResponseItem = {
	type: string; // The type of the entity (e.g., 'error', 'success').
	label: string; // The label for the entity, typically indicating the location.
	title: string; // The title of the entity, typically the error message.
	context?: string; // The context of the entity, typically additional information.
};

export type ValidateScriptCallback = (
	error: Error | null | unknown,
	validationErrors?: ValidationResponseItem[],
) => void;

export type BaseGetFieldParams = {
	fields?: FieldSchema<DirectivePropertyData>; // The fields to get
	requiredFields?: string[]; // The required fields list
	definitionsIdToNameMap: IdToNameMap; // The definitions id to name map
};

export type GetFieldsParams = BaseGetFieldParams & {
	addArguments: boolean; // Indicates if arguments should be added.
	addDefaultValue: boolean; // Indicates if default value should be added.
};
