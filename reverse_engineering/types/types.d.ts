type ContainerName = string;

export type ContainerInfo = {
	name: ContainerName;
	description?: string; // container description
	schemaRootTypes?: ContainerSchemaRootTypes; // container schema root types
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

export type FileREData = {
	filePath: string; 
};

export type Logger = {
	log: (logType: string, logData: object, logMessage: string) => void;
};

export type REFromFileCallback = (err: Error | null, entitiesData: FileREEntityResponseData[], modelData: FileREModelLevelResponseData) => void;