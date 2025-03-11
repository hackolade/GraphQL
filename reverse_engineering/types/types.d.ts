type ContainerName = string;

export type ContainerInfo = {
	name: ContainerName;
	description?: string; // container description
	schemaRootTypes?: ContainerSchemaRootTypes; // container schema root types
	graphDirectives?: DirectiveUsage[]; // container graph directives
};

export type ContainerSchemaRootTypes = {
	rootQuery?: string; // root query name
	rootMutation?: string; // root mutation name
	rootSubscription?: string; // root subscription name
};

export type FileREEntityResponseData = {
	jsonSchema: string; // entity JSON Schema
	objectNames: {
		collectionName: string; // collection name
	}
	doc: {
		collectionName: string; // collection name
		dbName: ContainerName;
		modelDefinitions: string; // model definitions JSON Schema
		bucketInfo: ContainerInfo;
	}
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

export type REFromFileCallback = (err: Error | null, entitiesData: FileREEntityResponseData[], modelData: FileREModelLevelResponseData) => void;

type ConnectionSourceType = 'database' | 'dataDictionary' | 'cloud'

export type AuthenticationType = 'none' | 'basic' | 'bearer'

type RecordSamplingMode = 'absolute' | 'relative'

type RecordSamplingModeOptions = {
	value: number
}

type RecordSamplingSettings = {
	absolute: RecordSamplingModeOptions;
	relative: RecordSamplingModeOptions;
	active: RecordSamplingMode;
	maxValue: number;
}

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
}

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
	}
}

type PaginationSettings = {
	enabled: boolean;
	value: number;
}

export type TestConnectionInfo = ConnectionSettings & GeneralRESettings;
export type REConnectionInfo = GeneralRESettings & {
	connectionSettings: ConnectionSettings;
};

export type REFromFileCallback = (err: Error | null, entitiesData: FileREEntityResponseData[], modelData: FileREModelLevelResponseData) => void;

export type DirectiveUsage = {
	directiveFormat: 'Structured';
	directiveName: string;
	argumentValueFormat: 'Raw';
	rawArgumentValues: string;
};

export type DirectiveLocations = {
    schema: boolean;
    query: boolean;
    mutation: boolean;
    subscription: boolean;
    scalar: boolean;
    enum: boolean;
    enumValue: boolean;
    object: boolean;
    interface: boolean;
    union: boolean;
    inputObject: boolean;
    field: boolean;
    fieldDefinition: boolean;
    inputFieldDefinition: boolean;
    argumentDefinition: boolean;
};

export type DirectiveDefinition = {
	type: 'directive';
    name: string;
    description?: string;
    arguments?: Object[]; // TODO: update when arguments are ready
    directiveLocations: DirectiveLocations;
}

export type TestConnectionCallback = (err: Error | null) => void;
export type DisconnectCallback = TestConnectionCallback;
