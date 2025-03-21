import {
	ContainerSchemaRootTypes,
	CustomScalarDefinition,
	DirectiveDefinition,
	EnumDefinition,
	EnumValue,
	StructuredDirective,
} from './shared';

type ContainerName = string;

export type ContainerInfo = {
	name: ContainerName;
	description?: string; // container description
	schemaRootTypes?: ContainerSchemaRootTypes; // container schema root types
	graphDirectives?: StructuredDirective[]; // container graph directives
};

export type FileREEntityResponseData = {
	jsonSchema: string; // entity JSON Schema
	objectNames: {
		collectionName: string; // collection name
	};
	doc: {
		collectionName: string; // collection name
		dbName: ContainerName;
		modelDefinitions: string; // model definitions JSON Schema
		bucketInfo: ContainerInfo;
	};
};

export type FileREModelLevelResponseData = {
	modelName: string; // model name
	description?: string; // model description
};

export type FieldsOrder = 'field' | 'alphabetical';

export type FileREData = {
	filePath: string;
	fieldInference: {
		active: FieldsOrder;
	};
};

export type REFromFileCallback = (
	err: Error | null | unknown,
	entitiesData?: FileREEntityResponseData[],
	modelData?: FileREModelLevelResponseData | {},
	relationships?: object[], // no need in context in GraphQL
	reType?: string,
) => void;

type ConnectionSourceType = 'database' | 'dataDictionary' | 'cloud';

export type AuthenticationType = 'none' | 'basic' | 'bearer';

type RecordSamplingMode = 'absolute' | 'relative';

type RecordSamplingModeOptions = {
	value: number;
};

type RecordSamplingSettings = {
	absolute: RecordSamplingModeOptions;
	relative: RecordSamplingModeOptions;
	active: RecordSamplingMode;
	maxValue: number;
};

export type ConnectionSettings = {
	id: string;
	name: string;
	host: string;
	connectionSourceType: ConnectionSourceType;
	authType: AuthenticationType;
	bearerToken?: string;
	userName?: string;
	userPassword?: string;
	target: 'GraphQL';
};

type GeneralRESettings = {
	appVersion?: string;
	tempFolder: string;
	pluginVersion: string;
	includeSystemCollection?: boolean;
	includeEmptyCollection?: boolean;
	pagination?: PaginationSettings;
	recordSamplingSettings: RecordSamplingSettings;
	queryRequestTimeout: number;
	applyToInstanceQueryRequestTimeout?: number;
	schemaRegistryConfig: boolean;
	target?: 'GraphQL';
	appTarget?: 'GraphQL';
	pluginPath: string;
	hiddenKeys: string[];
	excludeDocKind?: string[];
	probabilisticSchema?: boolean;
	fieldInference: {
		active: string;
	};
};

type PaginationSettings = {
	enabled: boolean;
	value: number;
};

export type TestConnectionInfo = ConnectionSettings & GeneralRESettings;
export type REConnectionInfo = GeneralRESettings & {
	connectionSettings: ConnectionSettings;
};

export type REDirectiveDefinition = DirectiveDefinition<Object> & {
	name: string;
};

export type REDefinitionsSchema = REDirectiveDefinitionsSchema | RECustomScalarDefinitionsSchema;

export type REDirectiveDefinitionsSchema = Record<string, REDirectiveDefinition>;
export type RECustomScalarDefinitionsSchema = Record<string, RECustomScalarDefinition>;
export type REEnumDefinitionsSchema = Record<string, REEnumDefinition>;

export type REDefinition = RECustomScalarDefinition | REDirectiveDefinition | REEnumDefinition;

export type REModelDefinitionsSchema = {
	definitions: {
		Directives: DirectiveStructureType;
		Scalars: ScalarStructureType;
	};
};

export type DefinitionREStructure = DirectiveStructureType | ScalarStructureType | EnumStructureType;

type StructureType<T> = {
	type: 'type';
	structureType: true;
	properties: T;
};

export type DirectiveStructureType = StructureType<REDirectiveDefinitionsSchema> & {
	subtype: 'directive';
};

export type ScalarStructureType = StructureType<RECustomScalarDefinitionsSchema> & {
	subtype: 'scalar';
};

export type EnumStructureType = StructureType<REEnumDefinitionsSchema> & {
	subtype: 'enum';
};

export type RECustomScalarDefinition = CustomScalarDefinition<StructuredDirective> & {
	type: 'scalar';
	name: string;
};

export type REEnumDefinition = EnumDefinition<StructuredDirective> & {
	type: 'enum';
	name: string;
};

export type REEnumValue = EnumValue<StructuredDirective>;

export type TestConnectionCallback = (err?: Error | unknown) => void;
export type DisconnectCallback = TestConnectionCallback;
