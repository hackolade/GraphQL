import {
	ContainerSchemaRootTypes,
	CustomScalarDefinition,
	DirectiveDefinition,
	FieldData,
	ObjectLikeDefinition,
	EnumDefinition,
	EnumValue,
	StructuredDirective,
	InputFieldDefaultValue,
	Argument,
	EntityDetails,
} from './shared';

type ContainerName = string;

export type ContainerInfo = {
	name: ContainerName;
	description?: string; // container description
	schemaRootTypes?: ContainerSchemaRootTypes; // container schema root types
	graphDirectives?: StructuredDirective[]; // container graph directives
};

type REEntityDetails = EntityDetails<StructuredDirective[]> &
	ObjectLikeDefinition<StructuredDirective> & { type: 'object' };

export type RootTypeEntity = {
	name: string; // entity name
	data: REEntityDetails; // specify the type for data
};

export type MappedRESchema = {
	container: ContainerInfo;
	entities: RootTypeEntity[];
	typeDefinitions: REModelDefinitionsSchema;
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

export type InstanceREEntityResponseData = {
	dbName: string;
	collectionName: string;
	entityLevel: Partial<Omit<REEntityDetails, 'required' | 'properties'>>;
	validation: {
		jsonSchema: Pick<REEntityDetails, 'required' | 'properties'>;
	};
	emptyBucket: boolean;
	bucketInfo: ContainerInfo;
	modelDefinitions: {
		properties: REDefinitionsSchema;
	};
};

export type REFromInstanceCallback = (
	err: Error | null | unknown,
	entitiesData?: InstanceREEntityResponseData[],
) => void;

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

export type REError = {
	title?: string;
	message: string;
	type: string;
	stack?: string;
};

export type REFromFileCallback = (
	err: REError | null | unknown,
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
	host: string; // should be empty - not used in GraphQL connections
	url: string;
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

type REDirectiveDefinitionsSchema = Record<string, REDirectiveDefinition>;
type RECustomScalarDefinitionsSchema = Record<string, RECustomScalarDefinition>;
type REObjectDefinitionsSchema = Record<string, REObjectTypeDefinition>;
type REEnumDefinitionsSchema = Record<string, REEnumDefinition>;
type REInterfaceDefinitionsSchema = Record<string, REInterfaceDefinition>;
type REInputDefinitionsSchema = Record<string, REInputTypeDefinition>;
type REUnionDefinitionsSchema = Record<string, REUnionDefinition>;

export type REDefinition =
	| RECustomScalarDefinition
	| REDirectiveDefinition
	| REEnumDefinition
	| REObjectTypeDefinition
	| REInterfaceDefinition
	| REInputTypeDefinition
	| REUnionDefinition;

type REDefinitionsSchema = {
	Directives: DirectiveStructureType;
	Scalars: ScalarStructureType;
	Objects: ObjectStructureType;
	Enums: EnumStructureType;
	Interfaces: InterfaceStructureType;
	'Input objects': InputStructureType;
	Unions: UnionStructureType;
};

export type REModelDefinitionsSchema = {
	definitions: REDefinitionsSchema;
};

export type DefinitionREStructure =
	| DirectiveStructureType
	| ScalarStructureType
	| EnumStructureType
	| ObjectStructureType
	| InterfaceStructureType
	| InputStructureType
	| UnionStructureType;

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

export type InterfaceStructureType = StructureType<REInterfaceDefinitionsSchema> & {
	subtype: 'interface';
};

export type InputStructureType = StructureType<REInputDefinitionsSchema> & {
	subtype: 'input';
};

export type UnionStructureType = StructureType<REUnionDefinitionsSchema> & {
	subtype: 'union';
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

export type ObjectStructureType = StructureType<REObjectDefinitionsSchema> & {
	subtype: 'object';
};

export type REImplementsInterface = {
	interface: string; // Name of the interface
};

export type REPropertiesSchema = Record<string, FieldData<StructuredDirective>>;
type REObjectLikeDefinition = ObjectLikeDefinition<StructuredDirective> & { name: string };

export type REFieldsSchemaProperties = {
	properties: REPropertiesSchema;
	required: string[];
};

export type REObjectTypeDefinition = REObjectLikeDefinition & {
	type: 'object';
	implementsInterfaces?: REImplementsInterface[];
};

export type REInterfaceDefinition = REObjectLikeDefinition & {
	type: 'interface';
	implementsInterfaces?: REImplementsInterface[];
};

export type REInputTypeDefinition = REObjectLikeDefinition & {
	type: 'input';
};

export type REUnionDefinition = {
	type: 'union';
	name: string;
	description?: string;
	typeDirectives?: StructuredDirective[];
	oneOf: REUnionMemberType[];
};

export type REUnionMemberType = {
	$ref: string;
};

export type PreProcessedFieldData = FieldData<StructuredDirective> &
	FieldTypeProperties & {
		name: string;
	};

export type InputTypeFieldProperties = {
	default?: InputFieldDefaultValue;
};

export type FieldTypeProperties = RegularFieldTypeProperties | ArrayFieldTypeProperties | ReferenceFieldTypeProperties;

type RegularFieldTypeProperties = InputTypeFieldProperties & {
	type: string;
	required: boolean;
};

type ArrayFieldTypeProperties = InputTypeFieldProperties & {
	type: 'List';
	items?: [FieldTypeProperties];
	required: boolean;
};

type ReferenceFieldTypeProperties = InputTypeFieldProperties & {
	$ref: string;
	required: boolean;
};

export type DefinitionTypeName =
	| 'Scalars'
	| 'Enums'
	| 'Objects'
	| 'Interfaces'
	| 'Unions'
	| 'Input objects'
	| 'Directives';
export type DefinitionNameToTypeNameMap = Record<string, DefinitionTypeName>;

export type REArgument = Argument<StructuredDirective>;

export type ArgumentTypeInfo = {
	typeName: string;
	required: boolean;
	isList?: boolean;
	innerTypeName?: string;
	innerRequired?: boolean;
};

export type TestConnectionCallback = (err?: Error | unknown) => void;
export type DisconnectCallback = TestConnectionCallback;
