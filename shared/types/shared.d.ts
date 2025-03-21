type LogType = 'info' | 'error';

type LogData =
	| {
			message?: string;
			error?: Error;
	  }
	| Error
	| unknown;

type LogTitle = string;

export type Logger = {
	log: (logType: LogType, logData: LogData, logTitle: LogTitle, hiddenKeys?: string[]) => void;
	clear: () => void;
	progress: (data: object) => void;
};

export type ContainerSchemaRootTypes = {
	rootQuery?: string; // root query name
	rootMutation?: string; // root mutation name
	rootSubscription?: string; // root subscription name
};

export type DirectiveLocations = {
	argumentDefinition?: boolean;
	enum?: boolean;
	enumValue?: boolean;
	field?: boolean;
	fieldDefinition?: boolean;
	inputFieldDefinition?: boolean;
	inputObject?: boolean;
	interface?: boolean;
	mutation?: boolean;
	object?: boolean;
	query?: boolean;
	scalar?: boolean;
	schema?: boolean;
	subscription?: boolean;
	union?: boolean;
};

export type DirectivePropertyData = StructuredDirective | RawDirective;

type RawDirective = {
	directiveFormat: 'Raw'; // Format of the directive
	rawDirective: string; // Raw directive string
};

type StructuredDirective = {
	directiveFormat: 'Structured'; // Format of the directive
	directiveName: string; // Name of a built-in directive or GUID of a custom directive
	argumentValueFormat: 'Raw'; // Format of the argument values
	rawArgumentValues: string; // Raw argument values
};

export type CustomScalarDefinition<T> = {
	description?: string;
	isActivated?: boolean;
	typeDirectives?: T[]
}

export type DirectiveDefinition<T, D = DirectiveLocations> = {
	type: 'directive';
	description?: string;
	comments?: string;
	arguments?: T[];
	directiveLocations: D;
}

export type ObjectLikeDefinition<Interfaces> = {
	description?: string; // Description of the object type
	isActivated?: boolean; // If the object type is activated
	implementsInterfaces?: Interfaces; // Interfaces that the object type implements
	typeDirectives?: DirectivePropertyData[]; // Directives for the type
	properties: Record<string, FieldData>; // Properties of the object type
	required?: string[];
};

// Field data type
export type FieldData = RegularFieldData | ReferenceFieldData;

export type FieldSchema = Record<string, FieldData>

export type ArrayItems = ArrayItem | ArrayItem[];

type RegularFieldData = {
	type: string; // Type of the field
	isActivated?: boolean; // If the field is activated
	description?: string; // Description of the field
	fieldDirectives?: DirectivePropertyData[]; // Directives for the field
	items?: ArrayItems; // Items of the List type
	arguments?: Argument[]; // Arguments of the field
	default?: string; // Default value of the field
};

type ReferenceFieldData = {
	$ref: string; // Reference path to the type definition
	isActivated?: boolean; // If the field is activated
	refDescription?: string; // Description of the reference
	fieldDirectives?: DirectivePropertyData[]; // Directives for the field
	arguments?: Argument[]; // Arguments of the field
	default?: string; // Default value of the reference
};

export type ArrayItem = FieldData & {
	required?: boolean; // If the array item is required
	$ref?: string; // Reference path to the type definition
};

// Field arguments
type ArgumentListItem = {
	type?: string;
	required?: boolean;
};

export type Argument = {
	id: string;
	type: string;
	name: string;
	default?: string;
	description?: string;
	directives?: DirectivePropertyData[];
	required?: boolean;
	listItems?: ArgumentListItem[];
};
