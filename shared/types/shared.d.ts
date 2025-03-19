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
