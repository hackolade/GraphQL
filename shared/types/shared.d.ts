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

type EntityDetails<TypeDirectives> = {
	operationType: string;
	typeDirectives?: TypeDirectives;
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

export type StructuredDirective = {
	directiveFormat: 'Structured'; // Format of the directive
	directiveName: string; // Name of a built-in directive or GUID of a custom directive
	argumentValueFormat: 'Raw'; // Format of the argument values
	rawArgumentValues: string; // Raw argument values
};

export type CustomScalarDefinition<T> = {
	description?: string;
	isActivated?: boolean;
	typeDirectives?: T[];
};

export type DirectiveDefinition<T, D = DirectiveLocations> = {
	type: 'directive';
	description?: string;
	comments?: string;
	arguments?: T[];
	directiveLocations: D;
};

export type ObjectLikeDefinition<DirectiveUsage> = {
	description?: string; // Description of the object type
	isActivated?: boolean; // If the object type is activated
	typeDirectives?: DirectiveUsage[]; // Directives for the type
	properties: Record<string, FieldData<DirectiveUsage>>; // Properties of the object type
	required?: string[];
};

// Field data type
export type FieldData<DirectiveUsage> = RegularFieldData<DirectiveUsage> | ReferenceFieldData<DirectiveUsage>;

export type FieldSchema<DirectiveUsage> = Record<string, FieldData<DirectiveUsage>>;

export type ArrayItems<DirectiveUsage> = ArrayItem<DirectiveUsage> | ArrayItem<DirectiveUsage>[];

export type InputFieldDefaultValue = string | number;

type RegularFieldData<DirectiveUsage> = {
	type: string; // Type of the field
	isActivated?: boolean; // If the field is activated
	description?: string; // Description of the field
	fieldDirectives?: DirectiveUsage[]; // Directives for the field
	items?: ArrayItems<DirectiveUsage>; // Items of the List type
	arguments?: Argument[]; // Arguments of the field
	default?: InputFieldDefaultValue; // Default value of the field
};

type ReferenceFieldData<DirectiveUsage> = {
	$ref: string; // Reference path to the type definition
	isActivated?: boolean; // If the field is activated
	refDescription?: string; // Description of the reference
	fieldDirectives?: DirectiveUsage[]; // Directives for the field
	arguments?: Argument[]; // Arguments of the field
	default?: InputFieldDefaultValue; // Default value of the reference
};

export type ArrayItem<DirectiveUsage> = FieldData<DirectiveUsage> & {
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

// Enum
export type EnumValue<T> = {
	value: string; // The name of the enum value
	description?: string; // The description of the enum value
	typeDirectives?: T[]; // The directives of the enum value
};

export type EnumDefinition<T> = {
	description?: string; // The description of the enum
	isActivated?: boolean; // Indicates if the enum is activated
	typeDirectives?: T[]; // The directives of the enum
	enumValues: EnumValue<T>[]; // The values of the enum
};
