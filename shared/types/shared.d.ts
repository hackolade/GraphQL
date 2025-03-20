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

export type ArgumentValueFormat = 'Raw';

type StructuredDirective = {
	directiveFormat: 'Structured'; // Format of the directive
	directiveName: string; // Name of a built-in directive or GUID of a custom directive
	argumentValueFormat: ArgumentValueFormat; // Format of the argument values @see ARGUMENT_VALUE_FORMAT */
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
